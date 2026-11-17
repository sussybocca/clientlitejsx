#define _POSIX_C_SOURCE 200809L
#include "dialects.h"
#include "hypermem.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <unistd.h>
static void help(void){
 puts("CJS UltraCore 18-dialect native C11 compiler");
 puts("Usage: cjs18 detect INPUT.clj | compile INPUT.clj OUTPUT.mjs | check INPUT.clj | version");
}
int main(int argc,char **argv){
 if(argc==2&&!strcmp(argv[1],"version")){puts(cjs18_version());return 0;}
 if(argc<3){help();return 2;}
 FILE *f=fopen(argv[2],"rb");if(!f){perror(argv[2]);return 2;}
 if(fseek(f,0,SEEK_END)){fclose(f);return 2;}
 long size=ftell(f);if(size<0||size>4*1048576){fclose(f);fputs("Input exceeds 4 MiB\n",stderr);return 2;}
 rewind(f);char *input=malloc((size_t)size+1);if(!input){fclose(f);return 2;}
 if(fread(input,1,(size_t)size,f)!=(size_t)size){free(input);fclose(f);return 2;}
 fclose(f);input[size]=0;
 if(!strcmp(argv[1],"detect")){puts(cjs18_detect(input));free(input);return 0;}
 if(strcmp(argv[1],"compile")&&strcmp(argv[1],"check")){help();free(input);return 2;}
 char *out=NULL;size_t n=0;const char *err=NULL;
 int rc=cjs18_compile(input,(size_t)size,&out,&n,&err);free(input);
 if(rc){fprintf(stderr,"CJS18 compiler error: %s\n",err?err:"unknown");return rc;}
 if(!strcmp(argv[1],"check")){puts("CJS18 check PASSED");clj_hyper_free(out);return 0;}
 if(argc<4){fputs("Output file required\n",stderr);clj_hyper_free(out);return 2;}
 size_t len=strlen(argv[3]);if(len>PATH_MAX-12){clj_hyper_free(out);return 2;}
 char temp[PATH_MAX];snprintf(temp,sizeof temp,"%s.tmp",argv[3]);
 f=fopen(temp,"wb");if(!f){perror(temp);clj_hyper_free(out);return 2;}
 int failed=fwrite(out,1,n,f)!=n;failed|=fflush(f)!=0;failed|=fclose(f)!=0;
 clj_hyper_free(out);if(failed||rename(temp,argv[3])){remove(temp);fputs("Failed to write output atomically\n",stderr);return 2;}
 printf("CJS18 compiled %s -> %s (%zu bytes)\n",argv[2],argv[3],n);return 0;
}
