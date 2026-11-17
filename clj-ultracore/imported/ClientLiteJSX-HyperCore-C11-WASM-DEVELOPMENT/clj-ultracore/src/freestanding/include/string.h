#ifndef CJS_FREESTANDING_STRING_H
#define CJS_FREESTANDING_STRING_H
#include <stddef.h>
size_t strlen(const char *s);
int strncmp(const char *a,const char *b,size_t n);
int strcmp(const char *a,const char *b);
int memcmp(const void *a,const void *b,size_t n);
void *memcpy(void *dst,const void *src,size_t n);
void *memset(void *dest,int value,size_t n);
void *memchr(const void *src,int c,size_t n);
char *strchr(const char *s,int c);
char *strstr(const char *haystack, const char *needle);
size_t strspn(const char *s,const char *accept);
#endif
