/* CLJ HyperCore native Ubuntu project builder: content-addressed incremental
 * compilation, dependency invalidation, and staged atomic module outputs.
 * No Node.js, npm, C++ or external build framework required. */
#define _POSIX_C_SOURCE 200809L
#include "dialects.h"
#include "hypermem.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <sys/stat.h>
#include <dirent.h>
#include <errno.h>
#include <unistd.h>
#include <limits.h>
#define MAX_MODULES 1024
#define MAX_PATH 1024
#define MAX_SOURCE_BYTES (4u*1024u*1024u)
typedef struct {char rel[512];uint64_t digest,previous;int existed,changed,staged;} Module;
static Module modules[MAX_MODULES],previous[MAX_MODULES];static int nmodules,nprevious;
static char source_root[MAX_PATH],output_root[MAX_PATH];
static uint64_t fnv(uint64_t h,const void *ptr,size_t n){const unsigned char *data=ptr;for(size_t i=0;i<n;i++){h^=data[i];h*=UINT64_C(1099511628211);}return h;}
static int safe_rel(const char *rel){
 if(!*rel||rel[0]=='/'||strlen(rel)>500||strstr(rel,"..")||strchr(rel,'\\'))return 0;
 for(const char *p=rel;*p;p++)if(!((*p>='a'&&*p<='z')||(*p>='A'&&*p<='Z')||(*p>='0'&&*p<='9')||*p=='/'||*p=='.'||*p=='_'||*p=='-'))return 0;
 return 1;
}
static int join(char *out,size_t cap,const char *a,const char *b){int n=snprintf(out,cap,"%s/%s",a,b);return n>0&&(size_t)n<cap;}
static int mkdirs(const char *pathname){
 char temp[MAX_PATH];size_t n=strlen(pathname);if(n>=sizeof temp)return 0;
 memcpy(temp,pathname,n+1);
 for(char *p=temp+1;*p;p++)if(*p=='/'){*p=0;if(mkdir(temp,0755)&&errno!=EEXIST)return 0;*p='/';}
 return !mkdir(temp,0755)||errno==EEXIST;
}
static int walk(const char *rel,int depth){
 if(depth>24)return 0;
 char folder[MAX_PATH];if(*rel){if(!join(folder,sizeof folder,source_root,rel))return 0;}
 else {if(strlen(source_root)>=sizeof folder)return 0;strcpy(folder,source_root);}
 DIR *d=opendir(folder);if(!d){perror(folder);return 0;}
 struct dirent *e;int okay=1;
 while((e=readdir(d))){
  if(!strcmp(e->d_name,".")||!strcmp(e->d_name,"..")||!strcmp(e->d_name,"node_modules")||!strcmp(e->d_name,".git")||!strcmp(e->d_name,"dist"))continue;
  char child[512],absolute[MAX_PATH];int k=snprintf(child,sizeof child,"%s%s%s",rel,*rel?"/":"",e->d_name);
  if(k<0||(size_t)k>=sizeof child||!safe_rel(child)||!join(absolute,sizeof absolute,source_root,child)){okay=0;break;}
  struct stat st;if(lstat(absolute,&st)){okay=0;break;}
  if(S_ISLNK(st.st_mode))continue;
  if(S_ISDIR(st.st_mode)){if(!walk(child,depth+1)){okay=0;break;}}
  else if(S_ISREG(st.st_mode)){size_t z=strlen(child);if(z<4||strcmp(child+z-4,".clj"))continue;
   if(nmodules==MAX_MODULES){okay=0;break;}
   strcpy(modules[nmodules++].rel,child);
  }
 }
 closedir(d);return okay;
}
static int by_path(const void *a,const void *b){return strcmp(((Module*)a)->rel,((Module*)b)->rel);}
static char *readfile(const char *root,const char *rel,size_t *n){
 char file[MAX_PATH];if(!join(file,sizeof file,root,rel))return NULL;
 FILE *f=fopen(file,"rb");if(!f)return NULL;
 if(fseek(f,0,SEEK_END)){fclose(f);return NULL;}
 long size=ftell(f);if(size<0||size>MAX_SOURCE_BYTES){fclose(f);return NULL;}
 rewind(f);char *p=malloc((size_t)size+1);if(!p){fclose(f);return NULL;}
 if(fread(p,1,(size_t)size,f)!=(size_t)size){free(p);fclose(f);return NULL;}
 fclose(f);p[size]=0;*n=(size_t)size;return p;
}
/* Explicit dependency hints describe files from project root:
 *    // clj-dep: shared/state.clj
 * The compiler still compiles each file independently, with no bundled import semantics. */
static int digest_file(const char *rel,int depth,uint64_t *result){
 if(depth>16||!safe_rel(rel))return 0;
 size_t n=0;char *text=readfile(source_root,rel,&n);if(!text)return 0;
 uint64_t h=fnv(UINT64_C(14695981039346656037),"hypercore-c11-v1",16);
 h=fnv(h,text,n);
 const char *p=text;
 while(*p){
  const char *line_end=strchr(p,'\n');size_t line_len=line_end?(size_t)(line_end-p):strlen(p);
  const char *directive="// clj-dep:";
  if(line_len>=11&&strstr(p,directive)==p){
   const char *dep=p+11;while(*dep==' '||*dep=='\t')dep++;
   char name[512];size_t k=0;
   while(k+1<sizeof name&&dep[k]&&dep[k]!='\n'&&dep[k]!='\r'&&dep[k]!=' '&&dep[k]!='\t') {name[k]=dep[k];k++;}
   name[k]=0;
   if(!safe_rel(name)){free(text);return 0;}
   uint64_t dh;if(!digest_file(name,depth+1,&dh)){free(text);return 0;}
   h=fnv(h,&dh,sizeof dh);
  }
  p=line_end?line_end+1:p+line_len;
 }
 free(text);*result=h;return 1;
}
static int load_previous(void){
 char file[MAX_PATH];if(!join(file,sizeof file,output_root,".hypercache.tsv"))return 0;
 FILE *f=fopen(file,"r");if(!f)return 1;
 char line[700];while(fgets(line,sizeof line,f)&&nprevious<MAX_MODULES){
  Module old={0};unsigned long long hash;
  if(sscanf(line,"%511[^\t]\t%llx",old.rel,&hash)==2&&safe_rel(old.rel)){
   old.digest=(uint64_t)hash;previous[nprevious++]=old;
  }
 }
 fclose(f);return 1;
}
static int path_output(char *out,size_t cap,const char *rel,const char *suffix){
 char temp[512];size_t n=strlen(rel);if(n>=sizeof temp-8)return 0;
 strcpy(temp,rel);if(n>=4&&!strcmp(temp+n-4,".clj"))strcpy(temp+n-4,suffix);
 return join(out,cap,output_root,temp);
}
static int stage_one(Module *m){
 char target[MAX_PATH],tmp[MAX_PATH];if(!path_output(target,sizeof target,m->rel,".mjs"))return 0;
 int k=snprintf(tmp,sizeof tmp,"%s.part",target);if(k<0||(size_t)k>=sizeof tmp)return 0;
 char dir[MAX_PATH];strcpy(dir,target);char *last=strrchr(dir,'/');if(!last)return 0;*last=0;if(!mkdirs(dir))return 0;
 size_t n=0;char *src=readfile(source_root,m->rel,&n);if(!src)return 0;
 char *out=NULL;size_t len=0;const char *error=NULL;int rc=cjs18_compile(src,n,&out,&len,&error);
 free(src);if(rc){fprintf(stderr,"CLJ compilation failed for %s: %s\n",m->rel,error?error:"unknown");clj_hyper_reset();return 0;}
 FILE *f=fopen(tmp,"wb");if(!f){clj_hyper_reset();return 0;}
 int failed=fwrite(out,1,len,f)!=len||fflush(f)!=0;failed|=fclose(f)!=0;
 clj_hyper_reset();if(failed){unlink(tmp);return 0;}
 m->staged=1;return 1;
}
static void cleanup_staged(void){for(int i=0;i<nmodules;i++)if(modules[i].staged){char target[MAX_PATH],part[MAX_PATH];if(path_output(target,sizeof target,modules[i].rel,".mjs")&&snprintf(part,sizeof part,"%s.part",target)>0)unlink(part);}}
int main(int argc,char **argv){
 if(argc!=3){fputs("Usage: clj-hyper-build PROJECT_DIRECTORY OUTPUT_DIRECTORY\n",stderr);return 2;}
 if(strlen(argv[1])>=sizeof source_root||strlen(argv[2])>=sizeof output_root)return 2;
 strcpy(source_root,argv[1]);strcpy(output_root,argv[2]);
 if(!mkdirs(output_root)||!walk("",0)||!load_previous()){fputs("CLJ project scanning failed\n",stderr);return 2;}
 qsort(modules,nmodules,sizeof modules[0],by_path);
 int changed=0;
 for(int i=0;i<nmodules;i++){
  Module *m=&modules[i];if(!digest_file(m->rel,0,&m->digest)){fprintf(stderr,"Missing or invalid CLJ dependency for %s\n",m->rel);cleanup_staged();return 2;}
  for(int j=0;j<nprevious;j++)if(!strcmp(previous[j].rel,m->rel)){m->existed=1;m->previous=previous[j].digest;break;}
  char target[MAX_PATH];struct stat st;
  if(!path_output(target,sizeof target,m->rel,".mjs")){cleanup_staged();return 2;}
  m->changed=!(m->existed&&m->previous==m->digest&&!stat(target,&st)&&S_ISREG(st.st_mode));
  if(m->changed){if(!stage_one(m)){cleanup_staged();return 2;}changed++;}
 }
 for(int i=0;i<nmodules;i++)if(modules[i].staged){
  char target[MAX_PATH],part[MAX_PATH];if(!path_output(target,sizeof target,modules[i].rel,".mjs"))return 2;
  if(snprintf(part,sizeof part,"%s.part",target)<0||rename(part,target)){perror("CLJ rename");cleanup_staged();return 2;}
 }
 for(int j=0;j<nprevious;j++){
  int kept=0;for(int i=0;i<nmodules;i++)if(!strcmp(previous[j].rel,modules[i].rel)){kept=1;break;}
  if(!kept){char file[MAX_PATH];if(path_output(file,sizeof file,previous[j].rel,".mjs"))unlink(file);}
 }
 char manifest[MAX_PATH],part[MAX_PATH];if(!join(manifest,sizeof manifest,output_root,".hypercache.tsv")||snprintf(part,sizeof part,"%s.part",manifest)>=(int)sizeof part)return 2;
 FILE *f=fopen(part,"wb");if(!f)return 2;
 for(int i=0;i<nmodules;i++)fprintf(f,"%s\t%016llx\n",modules[i].rel,(unsigned long long)modules[i].digest);
 int bad=fflush(f)!=0;bad|=fclose(f)!=0;if(bad||rename(part,manifest)){unlink(part);return 2;}
 printf("CLJ HyperProject: %d modules, %d compiled, %d reused\n",nmodules,changed,nmodules-changed);
 return 0;
}
