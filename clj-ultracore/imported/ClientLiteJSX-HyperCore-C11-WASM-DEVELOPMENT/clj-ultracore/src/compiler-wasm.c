/* Browser CLJ compiler: persistent in-memory exact-input cache and pooled C memory. */
#include "dialects.h"
#include "hypermem.h"
#include <stddef.h>
#include <stdint.h>
#include "freestanding/include/stdlib.h"
#include "freestanding/include/string.h"
#define CACHE_COUNT 4
#define CACHE_INPUT_MAX 32768u
#define CACHE_OUTPUT_MAX 131072u
typedef struct {unsigned valid;size_t inlen,outlen;uint64_t hash;
 char input[CACHE_INPUT_MAX],output[CACHE_OUTPUT_MAX];} CompilerCache;
static CompilerCache cache[CACHE_COUNT];
static unsigned replace_slot,cache_hits;
static char *out;static size_t len;static const char *err;
static uint64_t hashbytes(const char *s,size_t n){
 uint64_t h=UINT64_C(14695981039346656037);
 for(size_t i=0;i<n;i++){h^=(unsigned char)s[i];h*=UINT64_C(1099511628211);}
 return h;
}
__attribute__((visibility("default"))) void cjs18_begin(void){
 clj_hyper_reset();out=NULL;len=0;err=NULL;
}
__attribute__((visibility("default"))) unsigned int cjs18_alloc(unsigned int n){
 if(!n||n>4u*1048576u)return 0;
 return (unsigned int)(uintptr_t)clj_hyper_malloc(n);
}
__attribute__((visibility("default"))) int cjs18_run(unsigned int ptr,unsigned int n){
 if(!ptr||!n||n>4u*1048576u){err="Missing or oversized source";return 2;}
 const char *source=(const char *)(uintptr_t)ptr;
 uint64_t digest=hashbytes(source,n);
 if(n<=CACHE_INPUT_MAX){
  for(unsigned i=0;i<CACHE_COUNT;i++){
   CompilerCache *c=&cache[i];
   if(c->valid&&c->hash==digest&&c->inlen==n&&!memcmp(c->input,source,n)){
    out=c->output;len=c->outlen;cache_hits++;return 0;
   }
  }
 }
 int status=cjs18_compile(source,n,&out,&len,&err);
 if(!status&&n<=CACHE_INPUT_MAX&&len<=CACHE_OUTPUT_MAX){
  CompilerCache *c=&cache[replace_slot++%CACHE_COUNT];
  c->valid=1;c->hash=digest;c->inlen=n;c->outlen=len;
  memcpy(c->input,source,n);memcpy(c->output,out,len);
 }
 return status;
}
__attribute__((visibility("default"))) unsigned int cjs18_result(void){return (unsigned int)(uintptr_t)out;}
__attribute__((visibility("default"))) unsigned int cjs18_length(void){return (unsigned int)len;}
__attribute__((visibility("default"))) unsigned int cjs18_error(void){return (unsigned int)(uintptr_t)err;}
__attribute__((visibility("default"))) unsigned int cjs18_cache_hits(void){return cache_hits;}
__attribute__((visibility("default"))) unsigned int cjs18_memory_peak(void){return (unsigned int)clj_hyper_stats().peak_bytes;}
__attribute__((visibility("default"))) unsigned int cjs18_memory_reuses(void){return (unsigned int)clj_hyper_stats().reused;}
__attribute__((visibility("default"))) unsigned int cjs18_memory_reusable(void){return (unsigned int)clj_hyper_stats().reusable_bytes;}
__attribute__((visibility("default"))) unsigned int cjs18_wasm_version(void){return 19;}
