/* Minimal freestanding C support for the same native CJS/JSX frontends in wasm32.
   No WASI, browser imports, Node.js, npm, or third-party runtime dependency. */
#include <stddef.h>
#include <stdint.h>
#include <stdarg.h>
#include "include/stdlib.h"
#include "include/string.h"
#include "include/ctype.h"
#include "include/stdio.h"
extern unsigned char __heap_base;
static uintptr_t cursor;
void cjs_reset_arena(void){cursor=((uintptr_t)&__heap_base+15u)&~(uintptr_t)15u;}
static void *bump(size_t bytes){
 if(!cursor)cjs_reset_arena();
 if(bytes>(size_t)(32u*1024u*1024u))return NULL;
 uintptr_t end=cursor+((bytes+15u)&~(uintptr_t)15u);
 if(end<cursor)return NULL;
 uintptr_t available=(uintptr_t)__builtin_wasm_memory_size(0)*65536u;
 if(end>available){
  uintptr_t pages=(end-available+65535u)/65536u;
  if(__builtin_wasm_memory_grow(0,(unsigned int)pages)==(size_t)-1)return NULL;
 }
 void *p=(void *)cursor;cursor=end;return p;
}
void *malloc(size_t n){
 if(n>32u*1024u*1024u)return NULL;
 size_t *header=bump(n+sizeof(size_t));if(!header)return NULL;
 *header=n;return header+1;
}
void free(void *p){(void)p;}
void *realloc(void *p,size_t n){
 if(!p)return malloc(n);
 void *q=malloc(n);if(!q)return NULL;
 size_t old=((size_t*)p)[-1];memcpy(q,p,old<n?old:n);return q;
}
void *memcpy(void *dst,const void *src,size_t n){
 unsigned char *d=dst;const unsigned char *s=src;for(size_t i=0;i<n;i++)d[i]=s[i];return dst;
}
int memcmp(const void *a,const void *b,size_t n){
 const unsigned char *x=a,*y=b;for(size_t i=0;i<n;i++)if(x[i]!=y[i])return (int)x[i]-(int)y[i];return 0;
}
void *memchr(const void *s,int ch,size_t n){const unsigned char *p=s;for(size_t i=0;i<n;i++)if(p[i]==(unsigned char)ch)return (void *)(p+i);return NULL;}
size_t strlen(const char *s){size_t n=0;while(s[n])n++;return n;}
int strcmp(const char *a,const char *b){while(*a&&*a==*b){a++;b++;}return (unsigned char)*a-(unsigned char)*b;}
char *strchr(const char *s,int c){for(;;s++){if(*s==(char)c)return (char*)s;if(!*s)return NULL;}}
size_t strspn(const char *s,const char *accept){size_t n=0;while(s[n]&&strchr(accept,(unsigned char)s[n]))n++;return n;}
int isalpha(int c){return (c>='a'&&c<='z')||(c>='A'&&c<='Z');}
int isdigit(int c){return c>='0'&&c<='9';}
int isalnum(int c){return isalpha(c)||isdigit(c);}
int isupper(int c){return c>='A'&&c<='Z';}
int isspace(int c){return c==' '||c=='\r'||c=='\n'||c=='\t'||c=='\v'||c=='\f';}
/* Native JSX code only formats Unicode escapes as %04x. */
int snprintf(char *dst,size_t max,const char *fmt,...){
 va_list args;va_start(args,fmt);int value=va_arg(args,int);va_end(args);
 if(strcmp(fmt,"\\u%04x"))return -1;
 if(max<7)return -1;
 static const char hex[]="0123456789abcdef";
 dst[0]='\\';dst[1]='u';for(int i=0;i<4;i++)dst[2+i]=hex[((unsigned int)value>>(12-4*i))&15u];dst[6]=0;
 return 6;
}

char *strstr(const char *s,const char *needle){
 size_t n=strlen(needle);if(!n)return (char*)s;
 for(;*s;s++){if(*s==*needle){size_t j=0;while(j<n&&s[j]&&s[j]==needle[j])j++;if(j==n)return (char*)s;}}
 return NULL;
}

int strncmp(const char *a,const char *b,size_t n){
 for(size_t i=0;i<n;i++){
  if(a[i]!=b[i])return (unsigned char)a[i]-(unsigned char)b[i];
  if(!a[i])return 0;
 }return 0;
}

void *memset(void *dest,int value,size_t n){unsigned char *p=dest;for(size_t i=0;i<n;i++)p[i]=(unsigned char)value;return dest;}
