#ifndef CJS_FREESTANDING_STDIO_H
#define CJS_FREESTANDING_STDIO_H
#include <stddef.h>
typedef struct CjsUnsupportedFILE FILE;
int snprintf(char *dst,size_t max,const char *fmt,...);
#endif
