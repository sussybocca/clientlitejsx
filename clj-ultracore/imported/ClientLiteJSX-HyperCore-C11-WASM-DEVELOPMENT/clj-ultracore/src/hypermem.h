#ifndef CLJ_HYPERMEM_H
#define CLJ_HYPERMEM_H
#include <stddef.h>
#include <stdint.h>
/* C11 HyperCore memory API. The managed collector uses explicit roots and handles;
 * unregistered raw C pointers must never be moved or traced heuristically. */
typedef struct {
 uint64_t allocations, frees, reused, requested_bytes, live_bytes, peak_bytes;
 uint64_t raw_bytes, failures, gc_freed, gc_cycles, gc_steps;
 uint64_t reusable_bytes, largest_reusable_block, reusable_blocks;
} CljMemoryStats;
void *clj_hyper_malloc(size_t bytes);
void clj_hyper_free(void *ptr);
void *clj_hyper_realloc(void *ptr, size_t bytes);
void clj_hyper_reset(void);
CljMemoryStats clj_hyper_stats(void);

typedef struct CljArenaChunk CljArenaChunk;
typedef struct {CljArenaChunk *head,*current;} CljArena;
typedef struct {CljArenaChunk *chunk;size_t offset;} CljArenaMark;
void clj_arena_init(CljArena *arena);
void *clj_arena_alloc(CljArena *arena,size_t bytes);
CljArenaMark clj_arena_mark(CljArena *arena);
void clj_arena_rewind(CljArena *arena,CljArenaMark mark);
void clj_arena_release(CljArena *arena);

typedef struct CljGCObject CljGCObject;
typedef struct {
 CljGCObject *objects,*gray,*sweep,*sweep_prev;
 unsigned phase,minor;
 size_t objects_live,objects_reclaimed,young_objects;
} CljGC;
void clj_gc_init(CljGC *gc);
CljGCObject *clj_gc_new(CljGC *gc,size_t payload);
void clj_gc_root(CljGC *gc,CljGCObject *obj);
void clj_gc_unroot(CljGCObject *obj);
int clj_gc_link(CljGC *gc,CljGCObject *parent,unsigned slot,CljGCObject *child);
void *clj_gc_data(CljGCObject *obj);
void clj_gc_start(CljGC *gc,int minor);
int clj_gc_step(CljGC *gc,unsigned budget);
void clj_gc_collect(CljGC *gc,int minor);
/* Adaptive budget helper. Caller decides when to run background GC slices. */
int clj_gc_pressure(CljGC *gc,size_t budget_bytes,size_t young_threshold);
void clj_gc_destroy(CljGC *gc);
#endif
