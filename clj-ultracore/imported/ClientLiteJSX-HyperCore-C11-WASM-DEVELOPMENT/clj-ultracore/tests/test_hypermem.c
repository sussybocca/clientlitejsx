#include "../src/hypermem.h"
#include <assert.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
static uint32_t rng=0x12345678u;
static unsigned next_random(void){rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;return rng;}
int main(void){
 void *ptrs[1024]={0};size_t sizes[1024]={0};
 for(unsigned i=0;i<50000;i++){
  unsigned slot=next_random()%1024u;
  if(ptrs[slot]){
   unsigned char *p=(unsigned char *)ptrs[slot];
   for(size_t j=0;j<sizes[slot];j+=97)assert(p[j]==(unsigned char)(slot&255));
   if((next_random()%4)==0){
    size_t newer=1+next_random()%20000;
    void *np=clj_hyper_realloc(ptrs[slot],newer);assert(np);
    size_t preserved=sizes[slot]<newer?sizes[slot]:newer;
    for(size_t j=0;j<preserved;j+=97)assert(((unsigned char *)np)[j]==(unsigned char)(slot&255));
    memset(np,(unsigned char)slot,newer);
    ptrs[slot]=np;sizes[slot]=newer;
   }else{clj_hyper_free(ptrs[slot]);ptrs[slot]=NULL;sizes[slot]=0;}
  }else{
   size_t n=1+next_random()%18000;ptrs[slot]=clj_hyper_malloc(n);assert(ptrs[slot]);sizes[slot]=n;
   assert((uintptr_t)ptrs[slot]%_Alignof(max_align_t)==0);
   memset(ptrs[slot],(unsigned char)slot,n);
  }
 }
 for(unsigned i=0;i<1024;i++)clj_hyper_free(ptrs[i]);
 CljMemoryStats s=clj_hyper_stats();assert(s.live_bytes==0);assert(s.reused>500);assert(s.allocations>1000);
 /* Exercise split large-block free-list reuse and in-place expansion. */
 void *big=clj_hyper_malloc(30000);assert(big);clj_hyper_free(big);
 void *left=clj_hyper_malloc(9000);void *right=clj_hyper_malloc(9000);
 assert(left&&right);memset(left,123,9000);clj_hyper_free(right);
 void *expanded=clj_hyper_realloc(left,17000);
 assert(expanded==left);assert(((unsigned char*)expanded)[8999]==123);
 clj_hyper_free(expanded);
 CljArena arena;clj_arena_init(&arena);
 assert(clj_arena_alloc(&arena,256));CljArenaMark m=clj_arena_mark(&arena);
 assert(clj_arena_alloc(&arena,70000));clj_arena_rewind(&arena,m);
 assert(clj_arena_alloc(&arena,128));clj_arena_release(&arena);
 assert(clj_hyper_stats().live_bytes==0);
 CljGC gc;clj_gc_init(&gc);
 CljGCObject *r=clj_gc_new(&gc,128),*a=clj_gc_new(&gc,64),*b=clj_gc_new(&gc,32),*dead=clj_gc_new(&gc,16);
 assert(r&&a&&b&&dead);(void)dead;
 clj_gc_root(&gc,r);assert(clj_gc_link(&gc,r,0,a));assert(clj_gc_link(&gc,a,0,b));assert(clj_gc_link(&gc,b,0,a));
 memset(clj_gc_data(a),42,64);
 clj_gc_collect(&gc,1);assert(gc.objects_live==3);
 assert(((unsigned char *)clj_gc_data(a))[10]==42);
 /* Newly linked objects during the incremental marking phase must survive. */
 CljGCObject *newchild=clj_gc_new(&gc,32);assert(newchild);
 clj_gc_start(&gc,0);
 assert(clj_gc_step(&gc,1));
 assert(clj_gc_link(&gc,r,1,newchild));
 while(clj_gc_step(&gc,1)){}
 assert(gc.objects_live==4);
 /* Reachability and cycles: both disappear after roots are removed. */
 clj_gc_unroot(r);clj_gc_collect(&gc,0);assert(gc.objects_live==0);
 CljMemoryStats done=clj_hyper_stats();assert(done.live_bytes==0);
 clj_gc_destroy(&gc);
 assert(clj_hyper_malloc(34u*1024u*1024u)==NULL);
 printf("PASS HyperCore allocator: 50000 randomized allocations, %llu reused, peak %llu bytes, arena rewind, GC cycles, write barriers\n",(unsigned long long)done.reused,(unsigned long long)done.peak_bytes);
 return 0;
}
