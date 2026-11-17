/* CLJ HyperCore: C11 hybrid allocator, pooled slabs, free lists, arena checkpoints,
 * and explicit-root incremental generational mark-and-sweep collector.
 * Designed for wasm32 freestanding and native hosts; no third-party allocator. */
#include "hypermem.h"
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#ifndef CLJ_WASM
#include <stdlib.h>
#endif
#define BLOCK_LIVE 0x434c4a31u
#define BLOCK_FREE 0x434c4a32u
#define HYPER_CLASSES 9
static const size_t classes[HYPER_CLASSES]={16,32,64,128,256,512,1024,2048,4096};
typedef union HyperBlock HyperBlock;
union HyperBlock{
 struct {HyperBlock *next;size_t capacity,requested;unsigned magic,cls;uintptr_t region;} h;
 max_align_t alignment;
};
static HyperBlock *pool[HYPER_CLASSES], *large_free;
static CljMemoryStats stats;
static uintptr_t large_region_counter;
#ifdef CLJ_WASM
extern unsigned char __heap_base;
static uintptr_t wasm_cursor;
static void *reserve_bytes(size_t n){
 if(!wasm_cursor)wasm_cursor=((uintptr_t)&__heap_base+15u)&~(uintptr_t)15u;
 if(n>32u*1024u*1024u||n>(size_t)UINTPTR_MAX-15u)return NULL;
 n=(n+15u)&~(size_t)15u;
 if(wasm_cursor>UINTPTR_MAX-n)return NULL;
 uintptr_t end=wasm_cursor+n;
 uintptr_t available=(uintptr_t)__builtin_wasm_memory_size(0)*65536u;
 if(end>available){uintptr_t pages=(end-available+65535u)/65536u;
  if(pages>UINT32_MAX||__builtin_wasm_memory_grow(0,(unsigned int)pages)==(size_t)-1)return NULL;
 }
 void *p=(void *)wasm_cursor;wasm_cursor=end;stats.raw_bytes+=n;return p;
}
#else
/* Native memory is obtained from the OS libc, but all small-block reuse,
 * splitting, lifetimes and tracing are managed by CLJ's own allocator. */
typedef struct HostRegion {struct HostRegion *next;void *mem;} HostRegion;
static HostRegion *regions;
static void *reserve_bytes(size_t n){
 HostRegion *r=(HostRegion *)malloc(sizeof *r);if(!r)return NULL;
 r->mem=malloc(n);if(!r->mem){free(r);return NULL;}
 r->next=regions;regions=r;stats.raw_bytes+=n;return r->mem;
}
#endif
static unsigned bin_for(size_t n){unsigned k=0;while(k<HYPER_CLASSES&&classes[k]<n)k++;return k;}
static void account_alloc(size_t n){stats.allocations++;stats.requested_bytes+=n;stats.live_bytes+=n;if(stats.live_bytes>stats.peak_bytes)stats.peak_bytes=stats.live_bytes;}
void *clj_hyper_malloc(size_t n){
 if(n==0)n=1;
 if(n>32u*1024u*1024u||n>SIZE_MAX-sizeof(HyperBlock)-32){stats.failures++;return NULL;}
 unsigned c=bin_for(n);HyperBlock *b=NULL;
 if(c<HYPER_CLASSES){
  if(!pool[c]){
   size_t stride=sizeof(HyperBlock)+classes[c];
   size_t count=16384u/stride;if(count<2)count=2;
   if(count>SIZE_MAX/stride){stats.failures++;return NULL;}
   unsigned char *page=reserve_bytes(stride*count);
   if(!page){stats.failures++;return NULL;}
   for(size_t i=0;i<count;i++){
    HyperBlock *t=(HyperBlock *)(void *)(page+i*stride);
    t->h.next=pool[c];t->h.capacity=classes[c];t->h.magic=BLOCK_FREE;t->h.cls=c;
    pool[c]=t;
   }
  }else stats.reused++;
  b=pool[c];pool[c]=b->h.next;
 }else{
  HyperBlock **link=&large_free;
  while(*link&&(*link)->h.capacity<n)link=&(*link)->h.next;
  if(*link){b=*link;*link=b->h.next;stats.reused++;
   size_t split=(n+15u)&~(size_t)15u;
   if(b->h.capacity>=split+sizeof(HyperBlock)+256u){
    HyperBlock *tail=(HyperBlock *)(void *)((unsigned char *)(b+1)+split);
    tail->h.magic=BLOCK_FREE;tail->h.capacity=b->h.capacity-split-sizeof(HyperBlock);
    tail->h.requested=0;tail->h.cls=HYPER_CLASSES;tail->h.region=b->h.region;tail->h.next=large_free;large_free=tail;
    b->h.capacity=split;
   }
  }else{
   size_t round=(n+4095u)&~(size_t)4095u;
   b=reserve_bytes(sizeof(HyperBlock)+round);
   if(!b){stats.failures++;return NULL;}
   b->h.capacity=round;b->h.region=++large_region_counter;
  }
 }
 b->h.magic=BLOCK_LIVE;b->h.requested=n;b->h.cls=c;
 b->h.next=NULL;account_alloc(n);return (void *)(b+1);
}
void clj_hyper_free(void *ptr){
 if(!ptr)return;
 HyperBlock *b=((HyperBlock *)ptr)-1;
 if(b->h.magic!=BLOCK_LIVE)return;/* invalid/double frees are ignored, never reinserted */
 b->h.magic=BLOCK_FREE;stats.frees++;
 if(stats.live_bytes>=b->h.requested)stats.live_bytes-=b->h.requested;
 b->h.requested=0;
 unsigned c=b->h.cls;
 if(c<HYPER_CLASSES){b->h.next=pool[c];pool[c]=b;}
 else{
  b->h.next=large_free;large_free=b;
  /* Large-block coalescing is restricted to blocks split from the same
   * backing reservation. This avoids merging separate native allocations. */
  int changed;
  do{
   changed=0;
   HyperBlock **link=&large_free;
   while(*link){
    HyperBlock *other=*link;
    if(other==b){link=&other->h.next;continue;}
    if(other->h.region!=b->h.region){link=&other->h.next;continue;}
    uintptr_t x=(uintptr_t)b,y=(uintptr_t)other;
    if(x+sizeof(HyperBlock)+b->h.capacity==y){
     *link=other->h.next;b->h.capacity+=sizeof(HyperBlock)+other->h.capacity;changed=1;break;
    }
    if(y+sizeof(HyperBlock)+other->h.capacity==x){
     /* Remove b, merge it into its left neighbor, and reinsert the new head. */
     HyperBlock **bp=&large_free;
     while(*bp&&*bp!=b)bp=&(*bp)->h.next;
     if(*bp==b)*bp=b->h.next;
     other->h.capacity+=sizeof(HyperBlock)+b->h.capacity;
     b=other;changed=1;break;
    }
    link=&other->h.next;
   }
  }while(changed);
 }
}
void *clj_hyper_realloc(void *ptr,size_t n){
 if(!ptr)return clj_hyper_malloc(n);
 if(!n){clj_hyper_free(ptr);return NULL;}
 HyperBlock *b=((HyperBlock *)ptr)-1;
 if(b->h.magic!=BLOCK_LIVE)return NULL;
 if(n<=b->h.capacity){
  size_t old=b->h.requested;b->h.requested=n;
  if(n>=old){stats.live_bytes+=n-old;if(stats.live_bytes>stats.peak_bytes)stats.peak_bytes=stats.live_bytes;}
  else stats.live_bytes-=old-n;
  return ptr;
 }
 if(b->h.cls==HYPER_CLASSES){
  HyperBlock **link=&large_free;
  while(*link){HyperBlock *right=*link;
   if(right->h.region==b->h.region&&
      (uintptr_t)(b+1)+b->h.capacity==(uintptr_t)right&&
      b->h.capacity+sizeof(HyperBlock)+right->h.capacity>=n){
    *link=right->h.next;
    b->h.capacity+=sizeof(HyperBlock)+right->h.capacity;
    stats.reused++;
    stats.live_bytes+=n-b->h.requested;
    if(stats.live_bytes>stats.peak_bytes)stats.peak_bytes=stats.live_bytes;
    b->h.requested=n;return ptr;
   }
   link=&right->h.next;
  }
 }
 void *next=clj_hyper_malloc(n);if(!next)return NULL;
 memcpy(next,ptr,b->h.requested);clj_hyper_free(ptr);return next;
}
void clj_hyper_reset(void){
#ifdef CLJ_WASM
 wasm_cursor=((uintptr_t)&__heap_base+15u)&~(uintptr_t)15u;
#else
 HostRegion *r=regions;while(r){HostRegion *next=r->next;free(r->mem);free(r);r=next;}regions=NULL;
#endif
 memset(pool,0,sizeof pool);large_free=NULL;
 /* Reset is a full bulk release; it invalidates all previous pointers. */
 stats.live_bytes=0;
}
CljMemoryStats clj_hyper_stats(void){
 CljMemoryStats result=stats;
 result.reusable_bytes=0;result.largest_reusable_block=0;result.reusable_blocks=0;
 for(unsigned c=0;c<HYPER_CLASSES;c++){
  for(HyperBlock *b=pool[c];b;b=b->h.next){
   result.reusable_bytes+=b->h.capacity;result.reusable_blocks++;
   if(b->h.capacity>result.largest_reusable_block)result.largest_reusable_block=b->h.capacity;
  }
 }
 for(HyperBlock *b=large_free;b;b=b->h.next){
  result.reusable_bytes+=b->h.capacity;result.reusable_blocks++;
  if(b->h.capacity>result.largest_reusable_block)result.largest_reusable_block=b->h.capacity;
 }
 return result;
}
struct CljArenaChunk {struct CljArenaChunk *next;size_t used,cap;max_align_t align;};
void clj_arena_init(CljArena *a){a->head=NULL;a->current=NULL;}
void *clj_arena_alloc(CljArena *a,size_t n){
 if(!n)n=1;
 size_t align=sizeof(max_align_t),want=(n+align-1u)&~(align-1u);
 if(want<n)return NULL;
 CljArenaChunk *c=a->current;
 if(!c||c->cap-c->used<want){
  size_t cap=want>16384u?want:16384u;
  CljArenaChunk *fresh=clj_hyper_malloc(sizeof *fresh+cap);if(!fresh)return NULL;
  fresh->next=NULL;fresh->used=0;fresh->cap=cap;
  if(c)c->next=fresh;else a->head=fresh;
  a->current=fresh;c=fresh;
 }
 void *p=(unsigned char *)(c+1)+c->used;c->used+=want;return p;
}
CljArenaMark clj_arena_mark(CljArena *a){CljArenaMark m={a->current,a->current?a->current->used:0};return m;}
void clj_arena_rewind(CljArena *a,CljArenaMark m){
 CljArenaChunk *c=m.chunk;
 if(!c){clj_arena_release(a);return;}
 CljArenaChunk *later=c->next;c->next=NULL;c->used=m.offset;a->current=c;
 while(later){CljArenaChunk *next=later->next;clj_hyper_free(later);later=next;}
}
void clj_arena_release(CljArena *a){
 CljArenaChunk *c=a->head;while(c){CljArenaChunk *next=c->next;clj_hyper_free(c);c=next;}
 a->head=a->current=NULL;
}
/* Opt-in GC for persistent managed graphs. No tracing of arbitrary native C
 * pointers; the only roots are registered explicitly. Links use stable handles. */
struct CljGCObject {
 CljGCObject *next,*gray_next,*edge[4];
 unsigned roots,marked,black,age,remembered;
 size_t payload;
 max_align_t alignment;
};
void clj_gc_init(CljGC *gc){memset(gc,0,sizeof *gc);}
CljGCObject *clj_gc_new(CljGC *gc,size_t payload){
 if(payload>1024u*1024u)return NULL;
 CljGCObject *o=clj_hyper_malloc(sizeof *o+payload);
 if(!o)return NULL;
 memset(o,0,sizeof *o);
 o->next=gc->objects;gc->objects=o;o->payload=payload;
 if(gc->phase){o->marked=1;o->black=1;}
 gc->objects_live++;gc->young_objects++;return o;
}
static void shade(CljGC *gc,CljGCObject *o);
void clj_gc_root(CljGC *gc,CljGCObject *o){
 if(!o)return;
 if(o->roots<UINT32_MAX)o->roots++;
 if(gc->phase==1)shade(gc,o);
 else if(gc->phase==2)o->marked=1;
}
void clj_gc_unroot(CljGCObject *o){if(o&&o->roots)o->roots--;}
static void shade(CljGC *gc,CljGCObject *o){
 if(o&&gc->minor&&o->age>=2)return; /* young-only mark phase */
 if(o&&!o->marked){o->marked=1;o->gray_next=gc->gray;gc->gray=o;}
}
int clj_gc_link(CljGC *gc,CljGCObject *parent,unsigned slot,CljGCObject *child){
 if(!parent||slot>=4)return 0;
 parent->edge[slot]=child;
 if(parent->age>=2&&child&&child->age<2)parent->remembered=1;
 if(gc->phase==1&&(parent->black||(gc->minor&&parent->age>=2)))shade(gc,child);
 else if(gc->phase==2&&child)child->marked=1;/* mutation barrier during sweep */
 return 1;
}
void *clj_gc_data(CljGCObject *o){return o?(void *)(o+1):NULL;}
void clj_gc_start(CljGC *gc,int minor){
 if(gc->phase)return;
 gc->minor=!!minor;gc->gray=NULL;
 for(CljGCObject *o=gc->objects;o;o=o->next){o->marked=0;o->black=0;o->gray_next=NULL;}
 gc->phase=1;
 for(CljGCObject *o=gc->objects;o;o=o->next){
  if(o->roots)shade(gc,o);
  /* Old-to-young remembered references let minor collections avoid traversing
   * the entire old generation. This can conservatively retain young objects
   * until a full collection when the old parent is itself unreachable. */
  if(gc->minor&&o->age>=2&&o->remembered)
   for(unsigned j=0;j<4;j++)shade(gc,o->edge[j]);
 }
}
int clj_gc_step(CljGC *gc,unsigned budget){
 if(!gc->phase||!budget)return (int)gc->phase;
 stats.gc_steps++;
 while(budget&&gc->phase==1){
  if(!gc->gray){gc->phase=2;gc->sweep=gc->objects;gc->sweep_prev=NULL;break;}
  CljGCObject *o=gc->gray;gc->gray=o->gray_next;o->black=1;
  for(unsigned i=0;i<4;i++){shade(gc,o->edge[i]);}budget--;
 }
 while(budget&&gc->phase==2){
  CljGCObject *o=gc->sweep;
  if(!o){gc->phase=0;stats.gc_cycles++;break;}
  CljGCObject *next=o->next;
  if(!o->marked&&(!gc->minor||o->age<2)){
   if(gc->sweep_prev)gc->sweep_prev->next=next;else gc->objects=next;
   if(o->age<2&&gc->young_objects)gc->young_objects--;
   clj_hyper_free(o);gc->objects_live--;gc->objects_reclaimed++;stats.gc_freed++;
  }else{
   if(o->marked&&o->age<2){
    o->age++;
    if(o->age==2){
     if(gc->young_objects)gc->young_objects--;
     for(unsigned j=0;j<4;j++)if(o->edge[j]&&o->edge[j]->age<2)o->remembered=1;
    }
   }
   gc->sweep_prev=o;
  }
  gc->sweep=next;budget--;
 }
 if(gc->phase==2&&!gc->sweep){gc->phase=0;stats.gc_cycles++;}
 return (int)gc->phase;
}
void clj_gc_collect(CljGC *gc,int minor){clj_gc_start(gc,minor);while(gc->phase)clj_gc_step(gc,128);}
int clj_gc_pressure(CljGC *gc,size_t budget_bytes,size_t young_threshold){
 if(gc->phase)return 1;
 CljMemoryStats now=clj_hyper_stats();
 if(now.live_bytes>budget_bytes){clj_gc_start(gc,0);return 2;}
 if(gc->young_objects>young_threshold){clj_gc_start(gc,1);return 1;}
 return 0;
}
void clj_gc_destroy(CljGC *gc){
 CljGCObject *o=gc->objects;while(o){CljGCObject *next=o->next;clj_hyper_free(o);o=next;}
 memset(gc,0,sizeof *gc);
}
