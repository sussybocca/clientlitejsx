#include "hypermem.h"
#include <stddef.h>
#include <stdint.h>
#include "freestanding/include/string.h"
__attribute__((visibility("default"))) int clj_hyper_selftest(void){
 void *buf[128];
 for(unsigned i=0;i<128;i++){
  buf[i]=clj_hyper_malloc(10+i*8);
  if(!buf[i])return 1;
  memset(buf[i],(int)i,10+i*8);
 }
 for(unsigned i=0;i<128;i++)clj_hyper_free(buf[i]);
 if(clj_hyper_stats().reused==0){
  void *p=clj_hyper_malloc(64);if(!p)return 2;clj_hyper_free(p);
  p=clj_hyper_malloc(64);if(!p)return 3;clj_hyper_free(p);
 }
 CljGC gc;clj_gc_init(&gc);
 CljGCObject *a=clj_gc_new(&gc,64),*b=clj_gc_new(&gc,64);
 if(!a||!b)return 4;
 clj_gc_root(&gc,a);clj_gc_link(&gc,a,0,b);clj_gc_link(&gc,b,0,a);
 if(!clj_gc_pressure(&gc,0,0))return 5;
 while(clj_gc_step(&gc,1)){}
 if(gc.objects_live!=2)return 6;
 clj_gc_unroot(a);clj_gc_collect(&gc,0);
 if(gc.objects_live!=0||clj_hyper_stats().live_bytes)return 7;
 clj_gc_destroy(&gc);
 return 0;
}
