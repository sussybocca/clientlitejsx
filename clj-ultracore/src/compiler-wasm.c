#include "dialects.h"
#include <stddef.h>
#include <stdint.h>
#include "freestanding/include/stdlib.h"
#include "freestanding/include/string.h"
extern void cjs_reset_arena(void);
static char *out;static size_t len;static const char *err;
__attribute__((visibility("default"))) void cjs18_begin(void){cjs_reset_arena();out=NULL;len=0;err=NULL;}
__attribute__((visibility("default"))) unsigned int cjs18_alloc(unsigned int n){
 if(!n||n>1048576)return 0;return (unsigned int)(uintptr_t)malloc(n);
}
__attribute__((visibility("default"))) int cjs18_run(unsigned int ptr,unsigned int n){
 if(!ptr||!n||n>1048576){err="Missing or oversized source";return 2;}
 return cjs18_compile((const char *)(uintptr_t)ptr,n,&out,&len,&err);
}
__attribute__((visibility("default"))) unsigned int cjs18_result(void){return (unsigned int)(uintptr_t)out;}
__attribute__((visibility("default"))) unsigned int cjs18_length(void){return (unsigned int)len;}
__attribute__((visibility("default"))) unsigned int cjs18_error(void){return (unsigned int)(uintptr_t)err;}
__attribute__((visibility("default"))) unsigned int cjs18_wasm_version(void){return 18;}
