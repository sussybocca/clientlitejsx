#ifndef CJS_FREESTANDING_STDLIB_H
#define CJS_FREESTANDING_STDLIB_H
#include <stddef.h>
void *malloc(size_t n);
void *realloc(void *p,size_t n);
void free(void *p);
#endif
