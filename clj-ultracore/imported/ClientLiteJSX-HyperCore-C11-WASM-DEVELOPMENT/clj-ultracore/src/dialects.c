/* CJS UltraCore 18-dialect language frontend. Strict lexical decoding, one IR.
   The trusted OPEN shell owns permissions; source code never grants privileges.
   Compatible with both native C11 and freestanding wasm32 compilation. */
#include "dialects.h"
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#ifdef CLJ_HYPER_NATIVE
#include "hypermem.h"
#define malloc clj_hyper_malloc
#define free clj_hyper_free
#define realloc clj_hyper_realloc
#endif
#define MAX_SOURCE (4u*1024u*1024u)
#define MAX_OUTPUT (2u*1024u*1024u)
static const char *failure;
typedef struct {char *s;size_t n,cap,limit;} Buf;
static int append(Buf *b,const char *p,size_t n){
 size_t limit=b->limit?b->limit:MAX_OUTPUT;
 if(n>limit||b->n>limit-n)return 0;
 if(b->n+n+1>b->cap){size_t v=b->cap?b->cap:256;while(v<b->n+n+1)v*=2;
 char *q=realloc(b->s,v);if(!q)return 0;b->s=q;b->cap=v;}
 if(n)memcpy(b->s+b->n,p,n);
 b->n+=n;b->s[b->n]=0;return 1;
}
static __attribute__((noinline)) int adds(Buf *b,const char *s){return append(b,s,strlen(s));}
static int one(Buf *b,char x){return append(b,&x,1);}
static int eqi(const char *a,const char *b){
 while(*a&&*b){char x=*a++,y=*b++;if(x>='A'&&x<='Z')x+=32;if(y>='A'&&y<='Z')y+=32;if(x!=y)return 0;}return !*a&&!*b;
}
static int asciiletter(char c){return (c>='a'&&c<='z')||(c>='A'&&c<='Z');}
static char lo(char c){return c>='A'&&c<='Z'?c+32:c;}
static int has(const char *s,const char *find){return strstr(s,find)!=NULL;}
/* Convert quotation shards, arrows, reversed mirrors and dot-stitches.
   Reject a malformed encoded identifier instead of silently treating it as JS. */
static int normalize(const char *s,size_t n,Buf *o){
 size_t i=0;
 while(i<n){
  /* Keep comments and quoted user-visible strings literal: encoded keywords
     inside text must not be rewritten as executable language tokens. */
  if(i+1<n&&s[i]=='/'&&(s[i+1]=='/'||s[i+1]=='*')){
   size_t j=i+2;
   if(s[i+1]=='/'){while(j<n&&s[j]!='\n')j++;}
   else {while(j+1<n&&!(s[j]=='*'&&s[j+1]=='/'))j++;
    if(j+1>=n){failure="Unterminated CJS comment";return 0;}
    j+=2;}
   if(!append(o,s+i,j-i))return 0;
   i=j;continue;
  }
  if(s[i]=='\"'||s[i]=='\''){
   if(s[i]=='\"'&&i>=1&&s[i-1]==':'){if(!one(o,s[i++]))return 0;continue;}
   if(s[i]=='\"'&&i+2<n&&s[i+1]=='\"'&&s[i+2]=='\"'){
    if(!append(o,s+i,3))return 0;
    i+=3;continue;
   }
   char quote=s[i];size_t j=i+1;int closed=0;
   while(j<n){if(s[j]=='\\'&&j+1<n){j+=2;continue;}
    if(s[j++]==quote){closed=1;break;}}
   if(!closed){failure="Unterminated CJS string literal";return 0;}
   if(!append(o,s+i,j-i))return 0;
   i=j;continue;
  }
  size_t j=i;char tok[128];size_t k=0;int mode=0,ok=0;
  if(i+4<n&&s[i]=='{'&&s[i+1]=='"'&&asciiletter(s[i+2])&&s[i+3]=='"'&&asciiletter(s[i+4])){
   mode=1;j=i+2;
   while(j<n&&k<100&&asciiletter(s[j])){tok[k++]=lo(s[j++]);if(j<n&&s[j]=='"')j++;}
   if(j<n&&s[j]=='}'&&k){j++;ok=1;}
   else{failure="Malformed quotation-shard keyword";return 0;}
  }else if(s[i]=='['&&i+3<n&&asciiletter(s[i+1])&&s[i+2]=='>'){
   mode=2;j=i+1;
   while(j<n&&k<100){if(!asciiletter(s[j]))break;tok[k++]=lo(s[j++]);if(j<n&&s[j]=='>'){j++;continue;}break;}
   if(j<n&&s[j]==']'&&k>1){j++;ok=1;}
   else{failure="Malformed arrow-letter keyword";return 0;}
  }else if(i+3<n&&(unsigned char)s[i]==0xe2&&(unsigned char)s[i+1]==0x9f&&(unsigned char)s[i+2]==0xaa){
   mode=3;j=i+3;
   while(j<n&&k<100&&asciiletter(s[j])){tok[k++]=lo(s[j++]);if(j<n&&s[j]=='|')j++;else break;}
   if(j+2<n&&(unsigned char)s[j]==0xe2&&(unsigned char)s[j+1]==0x9f&&(unsigned char)s[j+2]==0xab&&k){j+=3;ok=1;}
   else{failure="Malformed mirror-letter keyword";return 0;}
   for(size_t x=0;x<k/2;x++){char t=tok[x];tok[x]=tok[k-x-1];tok[k-x-1]=t;}
  }else if(s[i]=='.'&&i+4<n&&asciiletter(s[i+1])&&s[i+2]=='.'&&asciiletter(s[i+3])){
   mode=4;j=i+1;
   while(j+1<n&&k<100&&asciiletter(s[j])&&s[j+1]=='.'){tok[k++]=lo(s[j]);j+=2;}
   if(k>1)ok=1;else{failure="Malformed dot-stitch keyword";return 0;}
  }else if(s[i]=='@'&&i+1<n&&asciiletter(s[i+1])&& (i==0||s[i-1]=='\n'||s[i-1]==' '||s[i-1]=='\t')){
   mode=5;tok[k++]=lo(s[i+1]);j=i+2;
   /* Strict staircase: each letter one more column than @. */
   size_t base=i;while(base>0&&s[base-1]!='\n')base--;size_t indent=i-base;
   while(j<n&&s[j]=='\n'&&k<100){size_t p=j+1,col=0;while(p<n&&s[p]==' '){col++;p++;}
    if(col!=indent+1||p>=n||!asciiletter(s[p]))break;
    if(p+1<n&&s[p+1]!='\n')break;
    tok[k++]=lo(s[p]);j=p+1;
   }
   if(k>1&&j<n&&s[j]=='\n'){size_t p=j+1;while(p<n&&s[p]==' ')p++;if(p<n&&(s[p]==':'||s[p]=='=')){j=p;ok=1;}}
   if(!ok){failure="Malformed vertical keyword: each letter must align one space after @ and end with : or =";return 0;}
  }
  if(ok){if(!append(o,tok,k))return 0;i=j;(void)mode;continue;}
  /* Zero-copy lexical spans: ordinary source bytes are appended as contiguous
     source slices instead of one buffer call per character. Delimiters are
     handled individually so comments, quoted values and special encodings
     remain exactly compatible with the original lexer. */
  size_t begin=i;
  while(i<n){unsigned char ch=(unsigned char)s[i];
   if(ch=='"'||ch=='\''||ch=='/'||ch=='{'||ch=='['||ch=='.'||ch=='@'||ch==0xe2)break;
   i++;
  }
  if(i>begin){if(!append(o,s+begin,i-begin))return 0;continue;}
  if(!one(o,s[i]))return 0;
  i++;
 }
 return 1;
}
const char *cjs18_detect(const char *s){
 if(!s)return "unknown";
 /* Explicit mode header resolves source snippets whose syntax is intentionally shared. */
 static const char *names[]={"reverse-commands","reversed-jsx","backflow","upside-down","hypercjs","zipshot","ghostwire","lettershatter","arrowspine","mirrormouth","dotpulse","columnritual","fliptag","wiregrind","quotedvault","gridlock","bottomup","fullcircuit"};
 const char *forced=strstr(s,"cjs-dialect:");
 if(forced){forced+=12;for(size_t i=0;i<sizeof names/sizeof names[0];i++)if(!strncmp(forced,names[i],strlen(names[i]))){char next=forced[strlen(names[i])];if(!next||next=='\n'||next==' '||next=='\r')return names[i];}}
 if(has(s,"padz!"))return "fullcircuit";
 if(has(s,"::finish padz"))return "bottomup";
 if(has(s,"padz::"))return "gridlock";
 if(has(s,"\"padz\" >>"))return "quotedvault";
 if(has(s,"R-CJS : Canvas"))return "backflow";
 if(has(s,"#open-live-widget <~")||has(s,"#root <~"))return "ghostwire";
 if(has(s,"padz <~"))return "wiregrind";
 if(has(s,"<:padz"))return "fliptag";
 if(has(s,"@P\n")||has(s,"@p\n"))return "columnritual";
 if(has(s,".P.A.D.Z."))return "dotpulse";
 if(has(s,"⟪Z|D|A|P⟫"))return "mirrormouth";
 if(has(s,"[P>A>D>Z]"))return "arrowspine";
 if(has(s,"{\"P\"A\"D\"Z\"}"))return "lettershatter";
 if(has(s,"R-CJS : Canvas"))return "backflow";
 if(has(s,":\"padz:"))return "zipshot";
 if(has(s,"<:Canvas"))return "reversed-jsx";
 if(has(s,"R-CJS : Canvas"))return "backflow";
 if(has(s,":\"END:Canvas"))return "upside-down";
 if(has(s,":\"R-CJS:Canvas:")){
  if(has(s,"OPEN.LiveSource\n")||has(s,"ACTIONS <- ALL"))return "hypercjs";
  return "reverse-commands";
 }
 if(has(s,":\"State\"\"\"")||has(s,":\"stash\"\"\"")||has(s,":\"Render\"\"\"")||has(s,"Canvas <~ Render <~ TXT HW"))return "reverse-commands";
 return "unknown";
}
const char *cjs18_version(void){return "ClientLiteJSX HyperCore C11 v0.3 (18 dialects)";}
static const char *synonyms[][2]={
 {"canvas","padz"},{"render","spit"},{"state","stash"},{"text","sayz"},{"txt","sayz"},
 {"button","tapz"},{"btn","tapz"},{"action","movez"},{"actions","movez"},{"update","flipz"},
 {"component","piecez"},{"function","cookz"},{"variable","bagz"},{"return","sendbak"},
 {"import","snagz"},{"export","shipz"},{"if","whenz"},{"else","nahz"},
 {"loop","spinzz"},{"true","yupz"},{"false","nopez"},{"wait","holdz"},
 {"async","laterz"},{"route","lanez"},{"ui","lookz"},{"history","rewz"},
 {"edit","tweakz"},{"remix","mixupz"},{"unpublish","ghostz"},{"restore","backz"},
 {"revision","snapz"},{"reload","zapz"},{"editor","scribz"},{"sourcegrid","gridz"},
 {"drag","slidez"},{"realtime","buzz"},{"security","lockz"},{"protect","lockz"},
 {"confirm","askz"},{"errors","oopsz"},{"error","oopsz"},{"all","fullsend"},
 {"original","ogz"},{"open.livesource","livz"},{"into","pinz"},
 {"use","snagz"},{"live","buzz"},{"resolve","lanez"},{"movement","slidez"},
 {"approval","askz"},{"failure","oopsz"},{"buttons","movez"},
 {"pinz","pinz"},{"spit","spit"},{"padz","padz"},{"livz","livz"},
 {"stash","stash"},{"sayz","sayz"},{"tapz","tapz"},{"movez","movez"},
 {"flipz","flipz"},{"piecez","piecez"},{"cookz","cookz"},{"bagz","bagz"},
 {"sendbak","sendbak"},{"snagz","snagz"},{"shipz","shipz"},{"whenz","whenz"},
 {"nahz","nahz"},{"spinzz","spinzz"},{"yupz","yupz"},{"nopez","nopez"},
 {"holdz","holdz"},{"laterz","laterz"},{"lanez","lanez"},{"lookz","lookz"},
 {"rewz","rewz"},{"tweakz","tweakz"},{"mixupz","mixupz"},{"ghostz","ghostz"},
 {"backz","backz"},{"snapz","snapz"},{"zapz","zapz"},{"scribz","scribz"},
 {"gridz","gridz"},{"slidez","slidez"},{"buzz","buzz"},{"lockz","lockz"},
 {"askz","askz"},{"oopsz","oopsz"},{"fullsend","fullsend"},{"ogz","ogz"}
};
static const char *alias(const char *word){
 for(size_t i=0;i<sizeof(synonyms)/sizeof(synonyms[0]);i++)if(eqi(word,synonyms[i][0]))return synonyms[i][1];
 return word;
}
static int jsquote(Buf *out,const char *s){
 if(!one(out,'"'))return 0;
 for(;*s;s++){unsigned char c=(unsigned char)*s;
  if(c=='"'||c=='\\'){if(!one(out,'\\')||!one(out,(char)c))return 0;}
  else if(c=='\n'){if(!adds(out,"\\n"))return 0;}
  else if(c=='\r'){if(!adds(out,"\\r"))return 0;}
  else if(c=='\t'){if(!adds(out,"\\t"))return 0;}
  else if(c<32){return 0;}
  else if(!one(out,(char)c))return 0;
 }
 return one(out,'"');
}
static int isname(char c){return asciiletter(c)||c=='_'||c=='-'||c=='.'||(c>='0'&&c<='9');}
/* Parse instruction heads, not prose values. Values remain unchanged, including
   route strings and identifiers. */
static int head(const char *line,char *dest,size_t cap,const char **value){
 const char *p=line;while(*p==' '||*p=='\t')p++;
 if(!*p||!strncmp(p,"//",2)||!strncmp(p,"/*",2)||*p=='}'||*p==')'||!strncmp(p,"::endz",6))return 0;
 if(*p=='|'&&p[1]==' '){p++;while(*p==' '||(*p>='0'&&*p<='9'))p++;if(*p=='|')p++;}
 if(!strncmp(p,":\"R-CJS:Canvas:",15)||!strncmp(p,":\"END:Canvas",12)||!strncmp(p,"R-CJS : Canvas",14)||!strncmp(p,"::finish padz",13)){
  if(cap<5)return -1;
  memcpy(dest,"padz",5);*value=p+strlen(p);return 1;
 }
 if(!strncmp(p,":\"",2))p+=2;
 if(!strncmp(p,"</:",3))return 0;
 if(!strncmp(p,"<:",2))p+=2;
 int quoted=(*p=='"');
 if(quoted)p++;
 if(*p=='#'&&strstr(p,"<~")){if(cap<5)return -1;memcpy(dest,"pinz",5);*value=p;return 1;}
 size_t n=0;
 while(isname(*p)&&n+1<cap)dest[n++]=lo(*p++);
 if(!n)return 0;
 dest[n]=0;
 if(quoted&&*p=='"')p++;
 if(!strcmp(dest,"r-cjs")){memcpy(dest,"padz",5);}
 *value=p;
 return 1;
}
static void count_state(const char *v, int *count){
 while(*v){if(*v>='0'&&*v<='9'){int n=0;while(*v>='0'&&*v<='9'){if(n<10000)n=n*10+(*v-'0');v++;}
   if(n>=1&&n<=10000){*count=n;return;}continue;}v++;}
}
static char *trim(char *s){while(*s==' '||*s=='\t'||*s=='\r')s++;
 size_t n=strlen(s);while(n&&(s[n-1]==' '||s[n-1]=='\t'||s[n-1]=='\r'))s[--n]=0;return s;
}
static int verify_gridlock(const char *s){
 int expected=1;int column=-1;const char *p=s;
 while(*p){const char *q=p;while(*q&&*q!='\n')q++;
  const char *start=p;while(start<q&&(*start==' '||*start=='\t'))start++;
  if(start<q&&*start=='|'){
   const char *v=start+1;while(v<q&&*v==' ')v++;int num=0;
   while(v<q&&*v>='0'&&*v<='9'){num=num*10+(*v-'0');v++;}
   if(num!=expected++){failure="GRIDLOCK line numbers must be sequential";return 0;}
   const char *a=v;while(a<q&&*a!='|')a++;if(a==q){failure="GRIDLOCK missing command separator";return 0;}
   const char *b=a+1;while(b<q&&*b!='|')b++;if(b==q){failure="GRIDLOCK missing value separator";return 0;}
   int loc=(int)(b-start);if(column>=0&&loc!=column){failure="GRIDLOCK separators must align in the same column";return 0;}
   column=loc;
  }
  p=*q?q+1:q;
 }
 return expected>1;
}
static int verify_quoted(const char *s){return has(s,"\"padz\"")&&has(s,">> (")&&has(s,")");}
static int verify_fliptag(const char *s){return has(s,"<:padz")&&has(s,"</:padz>")&&(!has(s,"<:livz")||has(s,"</:livz>"));}
static int verify_dialect(const char *raw,const char *norm,const char *dialect){
 if(eqi(dialect,"gridlock")&&!verify_gridlock(norm)){if(!failure)failure="Invalid GRIDLOCK table";return 0;}
 if(eqi(dialect,"quotedvault")&&!verify_quoted(norm)){failure="QUOTEDVAULT requires quoted commands and closing );";return 0;}
 if(eqi(dialect,"fliptag")&&!verify_fliptag(norm)){failure="FLIPTAG closing tags are required";return 0;}
 if(eqi(dialect,"lettershatter")&&!has(raw,"{\"S\"P\"I\"T\"}")){failure="LETTERSHATTER requires quoted keyword shards";return 0;}
 return 1;
}
static int compile_live(const char *dialect,const char *target,int history,Buf *out){
 /* No attempt to implement authorization client-side. This module requires
    the trusted published-page shell, which owns all protected OPEN operations. */
 if(!adds(out,"/* CJS18 native C11 output — trusted OPEN Living Source integration. */\n"))return 0;
 if(!adds(out,"export const CJS18 = Object.freeze({dialect:"))return 0;
 if(!jsquote(out,dialect)||!adds(out,",component:\"OPEN.LiveSource\",target:"))return 0;
 if(!jsquote(out,target)||!adds(out,",route:\"widget.data.route\",ui:\"original\",actions:[\"edit\",\"remix\",\"unpublish\",\"restore\",\"revision\",\"reload\"],history:"))return 0;
 char digits[16];int d=0,m=history;do{digits[d++]=(char)('0'+m%10);m/=10;}while(m);while(d--)if(!one(out,digits[d]))return 0;
 if(!adds(out,",skipHistory:\"unpublish\",editor:\"SourceGrid\",lazy:true,draggable:true,realtime:\"PageForge.WS\",security:\"OPEN.Trusted\",confirm:[\"unpublish\",\"revision\"],error:\"status-message\"});\n"))return 0;
 if(!adds(out,"export async function mountCJS18(){\n"))return 0;
 if(!adds(out,"  const widget=document.querySelector(CJS18.target);\n  if(!widget)throw new Error('OPEN Living Source trusted widget not found');\n  if(widget.id!=='open-live-widget')throw new Error('Unexpected Live Source target');\n  if(!widget.dataset.route?.startsWith('/'))throw new Error('OPEN route must be absolute');\n"))return 0;
 if(!adds(out,"  /* The original OPEN published shell owns auth, editing, history,\n     SourceGrid, WebSockets and the opaque-origin iframe. */\n"))return 0;
 if(!adds(out,"  const scriptUrl='/_open/livesource-public.js';\n  const present=Array.from(document.scripts).some(s=>{try{return new URL(s.src,location.href).pathname===scriptUrl;}catch{return false;}});\n"))return 0;
 if(!adds(out,"  if(!present){\n    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=scriptUrl;script.onload=resolve;script.onerror=()=>reject(new Error('OPEN trusted shell runtime unavailable'));document.head.append(script);});\n  }\n  return widget;\n}\n"))return 0;
 if(!adds(out,"export default function App(){return null;}\n"))return 0;
 if(!adds(out,"if(typeof document!=='undefined'){\n const launch=()=>{if(document.getElementById('open-live-widget'))mountCJS18().catch(error=>{const status=document.getElementById('open-live-status');if(status)status.textContent='CJS: '+error.message;});};\n if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',launch,{once:true});else launch();\n}\n"))return 0;
 return 1;
}
/* A bounded, intentionally non-Turing-complete UI IR for portable, safe CJS.
   This is NOT a JS eval: dynamic programs are compiled to declarative DOM code. */
typedef struct {char name[64];int value;} UiState;
typedef struct {char kind[16];char label[128];char bind[64];} UiElement;
typedef struct {char trigger[128];char state[64];int delta;} UiAction;
typedef struct {UiState states[32];UiElement elements[64];UiAction actions[64];int ns,ne,na;} UiProgram;
static int identifier(const char *s){
 if(!s||!(*s=='_'||asciiletter(*s)))return 0;
 for(s++;*s;s++)if(!(*s=='_'||asciiletter(*s)||(*s>='0'&&*s<='9')))return 0;
 return 1;
}
static int parse_int(const char *s,int *n){
 if(!s||!*s)return 0;
 int neg=0;while(*s==' '||*s=='\t')s++;
 if(*s=='-'){neg=1;s++;}
 if(!(*s>='0'&&*s<='9'))return 0;
 int v=0;
 while(*s>='0'&&*s<='9'){
  v=v*10+(*s-'0');if(v>1000000)return 0;s++;
 }
 while(*s==' '||*s=='\t')s++;
 if(*s)return 0;
 *n=neg?-v:v;return 1;
}
static int parse_assignment(char *text,char *name,size_t nameCap,int *value){
 char *arrow=strstr(text,"<-");if(!arrow)arrow=strchr(text,'=');
 if(!arrow){failure="State requires Name <- integer";return 0;}
 char *rhs=arrow+(*arrow=='='?1:2);*arrow=0;
 char *key=trim(text);if(!identifier(key)||strlen(key)>=nameCap){failure="Invalid state identifier";return 0;}
 if(!parse_int(trim(rhs),value)){failure="State initial value must be an integer in ±1000000";return 0;}
 memcpy(name,key,strlen(key)+1);return 1;
}
static int parse_action(char *text,UiAction *a){
 char *arrow=strstr(text,"->");if(!arrow){failure="Action requires Button -> State += integer";return 0;}
 *arrow=0;char *trigger=trim(text),*rhs=trim(arrow+2);
 if(!*trigger||strlen(trigger)>=sizeof a->trigger){failure="Invalid action trigger";return 0;}
 char *plus=strstr(rhs,"+=");int sign=1;
 if(!plus){plus=strstr(rhs,"-=");sign=-1;}
 if(!plus){failure="Action supports only State += n or State -= n";return 0;}
 *plus=0;char *state=trim(rhs);if(!identifier(state)||strlen(state)>=sizeof a->state){failure="Invalid action state";return 0;}
 int value;if(!parse_int(trim(plus+2),&value)){failure="Invalid action increment";return 0;}
 if(value<0||value>100000){failure="Action increment out of range";return 0;}
 memcpy(a->trigger,trigger,strlen(trigger)+1);memcpy(a->state,state,strlen(state)+1);a->delta=sign*value;return 1;
}
static int parse_render(char *payload,UiElement *node){
 char *p=trim(payload),word[32];size_t i=0;
 while(isname(*p)&&i+1<sizeof word)word[i++]=*p++;
 word[i]=0;p=trim(p);const char *kind=alias(word);
 if(eqi(kind,"sayz")){
  memcpy(node->kind,"text",5);
  if(eqi(p,"HW"))memcpy(node->label,"Hello World",12);
  else{
   if(!*p||strlen(p)>=sizeof node->label){failure="Text content missing or too long";return 0;}
   memcpy(node->label,p,strlen(p)+1);
  }
 }else if(eqi(kind,"tapz")){
  memcpy(node->kind,"button",7);
  if(!*p||strlen(p)>=sizeof node->label){failure="Button label missing or too long";return 0;}
  memcpy(node->label,p,strlen(p)+1);
 }else{failure="Render supports TXT/sayz or BTN/tapz declarations";return 0;}
 return 1;
}
static int parse_ui(const char *norm,UiProgram *program){
 const char *p=norm;
 while(*p){
  const char *e=strchr(p,'\n');size_t n=e?(size_t)(e-p):strlen(p);
  if(n>1023){failure="CJS UI line too long";return 0;}
  char raw[1024];memcpy(raw,p,n);raw[n]=0;
  char *line=trim(raw),cmd[128];const char *v="";
  int headStatus=head(line,cmd,sizeof cmd,&v);
  if(headStatus<0){failure="Invalid CJS command";return 0;}
  if(headStatus>0){
   const char *canonical=alias(cmd);
   if(eqi(canonical,"stash")||eqi(canonical,"spit")||eqi(canonical,"movez")||eqi(canonical,"flipz")){
    char payload[1024];
    const char *begin=strstr(v,"\"\"\"");
    if(begin){begin+=3;const char *end=strstr(begin,"\"\"\"");
     if(!end){failure="Unclosed triple-quoted CJS command";return 0;}
     size_t length=(size_t)(end-begin);if(length>=sizeof payload){failure="Oversize command";return 0;}
     memcpy(payload,begin,length);payload[length]=0;
    }else{
     while(*v==' '||*v=='='||*v==':'||*v=='<'||*v=='~'||*v=='-'||*v=='\t')v++;
     if((unsigned char)v[0]==0xe2&&(unsigned char)v[1]==0x86&&(unsigned char)v[2]==0x90){v+=3;while(*v==' ')v++;}
     if(strlen(v)>=sizeof payload){failure="Oversize command";return 0;}
     memcpy(payload,v,strlen(v)+1);
    }
    char *argument=trim(payload);
    if(eqi(canonical,"stash")){
     if(program->ns>=32){failure="Too many state bindings";return 0;}
     UiState *state=&program->states[program->ns];
     if(!parse_assignment(argument,state->name,sizeof state->name,&state->value))return 0;
     for(int i=0;i<program->ns;i++)if(!strcmp(program->states[i].name,state->name)){
      failure="Duplicate state declaration";return 0;
     }
     program->ns++;
    }else if(eqi(canonical,"spit")){
     if(program->ne>=64){failure="Too many UI elements";return 0;}
     if(!parse_render(argument,&program->elements[program->ne]))return 0;
     program->ne++;
    }else if(eqi(canonical,"movez")){
     if(program->na>=64){failure="Too many actions";return 0;}
     if(!parse_action(argument,&program->actions[program->na]))return 0;
     program->na++;
    }else if(eqi(canonical,"flipz")){
     /* An Update directive binds an already-rendered text element. */
     char *arrow=strstr(argument,"<-");if(!arrow){failure="Update requires TXT label <- State";return 0;}
     *arrow=0;char *state=trim(arrow+2),*label=trim(argument);
     if(!identifier(state)){failure="Invalid update state";return 0;}
     int matched=0;
     if(!strncmp(label,"TXT ",4))label+=4;
     if(!strncmp(label,"sayz ",5))label+=5;
     for(int i=0;i<program->ne;i++)if(!strcmp(program->elements[i].label,label)){
      if(strlen(state)>=sizeof program->elements[i].bind){failure="Update binding too long";return 0;}
      memcpy(program->elements[i].bind,state,strlen(state)+1);matched=1;
     }
     if(!matched){failure="Update target was not previously rendered";return 0;}
    }
   }
  }
  p=e?e+1:p+n;
 }
 if(!program->ne&&strstr(norm,"Canvas <~ Render <~ TXT HW")){
  memcpy(program->elements[0].kind,"text",5);
  memcpy(program->elements[0].label,"Hello World",12);
  program->ne=1;
 }
 if(!program->ne){failure="UI program must render at least one element";return 0;}
 for(int i=0;i<program->ne;i++)if(!strcmp(program->elements[i].kind,"text")&&!program->elements[i].bind[0]){
  for(int j=0;j<program->ns;j++)if(!strcmp(program->elements[i].label,program->states[j].name)){
   memcpy(program->elements[i].bind,program->states[j].name,strlen(program->states[j].name)+1);
   break;
  }
 }
 for(int i=0;i<program->na;i++){
  int foundState=0,foundButton=0;
  for(int j=0;j<program->ns;j++)if(!strcmp(program->states[j].name,program->actions[i].state))foundState=1;
  for(int j=0;j<program->ne;j++)if(!strcmp(program->elements[j].kind,"button")&&!strcmp(program->elements[j].label,program->actions[i].trigger))foundButton=1;
  if(!foundState||!foundButton){failure="Action refers to an undeclared state or button";return 0;}
 }
 for(int i=0;i<program->ne;i++)if(*program->elements[i].bind){
  int found=0;for(int j=0;j<program->ns;j++)if(!strcmp(program->states[j].name,program->elements[i].bind))found=1;
  if(!found){failure="Update refers to an undeclared state";return 0;}
 }
 return 1;
}
static int compile_simple(const char *norm,Buf *out){
 UiProgram program={0};if(!parse_ui(norm,&program))return 0;
 if(!adds(out,"/* Generated by the C11 CJS18 UI compiler. No eval or innerHTML. */\n"))return 0;
 if(!adds(out,"export const CJS_UI=Object.freeze({states:["))return 0;
 for(int i=0;i<program.ns;i++){
  if(i&&!adds(out,","))return 0;
  if(!adds(out,"["))return 0;
  if(!jsquote(out,program.states[i].name)||!adds(out,","))return 0;
  char tmp[16];int n=program.states[i].value,negative=n<0,k=0;
  if(negative)n=-n;
  do{tmp[k++]=(char)('0'+(n%10));n/=10;}while(n);
  if(negative&&!one(out,'-'))return 0;
  while(k--)if(!one(out,tmp[k]))return 0;
  if(!adds(out,"]"))return 0;
 }
 if(!adds(out,"],elements:["))return 0;
 for(int i=0;i<program.ne;i++){
  UiElement *element=&program.elements[i];
  if(i&&!adds(out,","))return 0;
  if(!adds(out,"{kind:"))return 0;
  if(!jsquote(out,element->kind)||!adds(out,",label:"))return 0;
  if(!jsquote(out,element->label)||!adds(out,",bind:"))return 0;
  if(!jsquote(out,element->bind)||!adds(out,"}"))return 0;
 }
 if(!adds(out,"],actions:["))return 0;
 for(int i=0;i<program.na;i++){
  UiAction *act=&program.actions[i];
  if(i&&!adds(out,","))return 0;
  if(!adds(out,"{trigger:"))return 0;
  if(!jsquote(out,act->trigger)||!adds(out,",state:"))return 0;
  if(!jsquote(out,act->state)||!adds(out,",delta:"))return 0;
  int n=act->delta,negative=n<0,k=0;char tmp[16];if(negative)n=-n;
  do{tmp[k++]=(char)('0'+(n%10));n/=10;}while(n);
  if(negative&&!one(out,'-'))return 0;
  while(k--)if(!one(out,tmp[k]))return 0;
  if(!adds(out,"}"))return 0;
 }
 if(!adds(out,"]});\n"))return 0;
 if(!adds(out,"export function mountCJS18(root=document.getElementById('root')){\n"))return 0;
 if(!adds(out," if(!root)throw Error('Missing #root');\n root.replaceChildren();\n const state=Object.create(null);for(const [name,initial] of CJS_UI.states)state[name]=initial;\n const dynamic=[];\n"))return 0;
 if(!adds(out," const refresh=()=>{for(const {element,node} of dynamic)node.textContent=element.label+': '+state[element.bind];};\n"))return 0;
 if(!adds(out," for(const element of CJS_UI.elements){\n  const node=document.createElement(element.kind==='button'?'button':(element.label==='Hello World'?'h1':'p'));\n  node.textContent=element.label;\n  if(element.kind==='button')node.addEventListener('click',()=>{for(const action of CJS_UI.actions)if(action.trigger===element.label){state[action.state]+=action.delta;}refresh();});\n  if(element.bind)dynamic.push({element,node});\n  root.append(node);\n }\n"))return 0;
 /* If a render is named after a state, display its initial value reactively. */
 if(!adds(out," for(const {element,node} of dynamic)if(!(element.bind in state))throw Error('Unknown state: '+element.bind);\n refresh();return root;\n}\nexport default mountCJS18;\n"))return 0;
 return 1;
}
#include "rich.c"
int cjs18_compile(const char *source,size_t length,char **javascript,size_t *out_length,const char **error){
 failure=NULL;if(javascript)*javascript=NULL;if(out_length)*out_length=0;
 if(!source||!javascript||!out_length||!error||length>MAX_SOURCE){if(error)*error="Invalid input or source exceeds 4 MiB";return 2;}
 if(memchr(source,0,length)){*error="Embedded NUL in CJS source";return 2;}
 /* Detect against a NUL-terminated bounded copy. */
 char *raw=malloc(length+1);if(!raw){*error="Out of memory";return 2;}
 memcpy(raw,source,length);raw[length]=0;
 const char *dialect=cjs18_detect(raw);
 if(eqi(dialect,"unknown")){free(raw);*error="Unknown CJS dialect; explicitly select one of 18 supported syntaxes";return 3;}
 Buf normalized={0};normalized.limit=MAX_SOURCE+1;if(!normalize(raw,length,&normalized)){free(raw);free(normalized.s);*error=failure?failure:"Source transformation failed";return 3;}
 if(!verify_dialect(raw,normalized.s,dialect)){free(raw);free(normalized.s);*error=failure;return 3;}
 const char *norm=normalized.s;
 int live=has(norm,"livz")||has(norm,"LiveSource")||has(norm,"livesource")||has(norm,"LIVESOURCE");
 if(!live&&!has(norm,"spit")&&!has(norm,"Render")&&!has(norm,"render")){
  free(raw);free(normalized.s);*error="No supported component found (livz/OPEN.LiveSource, TXT HW, or counter)";return 3;
 }
 char target[128]="#open-live-widget";int history=30;
 /* Every dialect feeds one canonical semantic model. */
 const char *p=norm;
 while(*p){const char *e=strchr(p,'\n');size_t n=e?(size_t)(e-p):strlen(p);
  if(n>1023){free(raw);free(normalized.s);*error="CJS line exceeds 1023 bytes";return 3;}
  char line[1024];memcpy(line,p,n);line[n]=0;char cmd[128];const char *value="";
  if(head(trim(line),cmd,sizeof cmd,&value)>0){const char *canon=alias(cmd);
   if(eqi(canon,"rewz")||eqi(canon,"history"))count_state(value,&history);
   if(eqi(canon,"pinz")&&*value==' '&&strstr(value,"#open-live-widget")){
    /* Validates target selector, never allows arbitrary injection into JS. */
    memcpy(target,"#open-live-widget",18);
   }
  }
  p=e?e+1:p+n;
 }
 if(live&&!has(norm,"#open-live-widget")){
  /* The page's published shell always names the widget explicitly. */
  if(!has(norm,"Canvas")&&!has(norm,"padz")){free(raw);free(normalized.s);*error="Missing Live Source target";return 3;}
 }
 int rich=!live&&(has(norm,"whenz")||has(norm,"spinzz")||has(norm,"nopez")||has(norm,"yupz")||has(norm,"sayz =")||has(norm,"tapz =")||has(norm,"spit =")||has(norm,"stylez")||has(norm,"headz"));
 Buf result={0};int ok=live?compile_live(dialect,target,history,&result):(rich?xr_compile(norm,dialect,&result):compile_simple(norm,&result));
 free(raw);free(normalized.s);
 if(!ok){free(result.s);*error=failure?failure:"Unable to generate JS output";return 2;}
 *javascript=result.s;*out_length=result.n;*error=NULL;return 0;
}
