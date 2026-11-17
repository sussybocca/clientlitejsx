/* CJS18 typed component/event compiler, C11 + freestanding wasm32.
 * Shared frontend for the 18 syntaxes. No eval, dynamic Function, or JS parser.
 * Unlike the original integer-only UI grammar, this compiles booleans, arithmetic,
 * comparisons, string expressions, nested conditions, timer loops and event scopes.
 * This is intentionally a bounded language subset, not arbitrary JavaScript. */
#define XR_MAX_OPS 256
#define XR_MAX_STATES 64
#define XR_MAX_DEPTH 32

typedef enum {XR_ROOT,XR_DECL,XR_SET,XR_TEXT,XR_BUTTON,XR_IF,XR_TIMER,XR_CLICK,XR_RESET,XR_REFRESH,XR_STYLE,XR_HEADING,XR_EXPLICIT} XrType;
typedef struct {XrType type;int parent,indent,line,ms;char name[96],expr[512],label[160],trigger[160];} XrOp;
typedef struct {char name[96],initial[512];} XrState;
typedef struct {XrOp op[XR_MAX_OPS];XrState state[XR_MAX_STATES];int count,nstate;} XrProgram;
static char xr_failure[256];
static void xr_error(const char *msg,int line){
 int n=0;const char *prefix="CJS18 typed compiler at line ";while(prefix[n]&&n<140){xr_failure[n]=prefix[n];n++;}
 int places[12],z=0;int t=line;do{places[z++]=t%10;t/=10;}while(t&&z<12);
 while(z)xr_failure[n++]=(char)('0'+places[--z]);
 xr_failure[n++]=':';xr_failure[n++]=' ';for(int i=0;msg[i]&&n<252;i++)xr_failure[n++]=msg[i];xr_failure[n]=0;failure=xr_failure;
}
static int xr_copy(char *dst,size_t cap,const char *s){size_t n=strlen(s);if(n>=cap)return 0;memcpy(dst,s,n+1);return 1;}
static char *xr_skip(char *s){while(*s==' '||*s=='\t'||*s=='\r')s++;return s;}
static void xr_low(char *s){for(;*s;s++)*s=lo(*s);}
static char *xr_unwrap(char *s){
 s=xr_skip(s);
 while(*s=='='||*s==':'||*s=='<'||*s=='~'||*s==' '||*s=='\t')s++;
 if((unsigned char)s[0]==0xe2&&(unsigned char)s[1]==0x86&&(unsigned char)s[2]==0x90)s+=3;
 s=xr_skip(s);
 if(*s=='|'||*s=='>'){s++;s=xr_skip(s);}
 if(!strncmp(s,"\"\"\"",3)){
  s+=3;char *end=strstr(s,"\"\"\"");if(end)*end=0;
 }
 s=trim(s);
 size_t len=strlen(s);
 while(len&&(s[len-1]==';'||s[len-1]=='|'||s[len-1]=='>'))s[--len]=0;
 return trim(s);
}
static int xr_stateidx(const XrProgram *p,const char *name){
 for(int i=0;i<p->nstate;i++){if(eqi(p->state[i].name,name))return i;}
 return -1;
}
static int xr_push(XrProgram *p,XrType type,int parent,int indent,int line,const char *payload){
 if(p->count>=XR_MAX_OPS){xr_error("Too many instructions (256 maximum)",line);return -1;}
 int n=p->count++;XrOp *o=&p->op[n];memset(o,0,sizeof *o);o->type=type;o->parent=parent;o->indent=indent;o->line=line;
 if(!xr_copy(o->expr,sizeof o->expr,payload)){xr_error("Instruction is too long",line);return -1;}return n;
}
/* Expression grammar: literals, state identifiers, boolean and arithmetic operators.
 * Every identifier must resolve to a declared state; no arbitrary JS is injected. */
typedef struct {const char *s;size_t pos;const XrProgram *program;Buf out;int err;} XrExpr;
static void xr_ws(XrExpr *p){while(p->s[p->pos]==' '||p->s[p->pos]=='\t')p->pos++;}
static int xr_eat(XrExpr *p,const char *token){xr_ws(p);size_t n=strlen(token);if(!strncmp(p->s+p->pos,token,n)){p->pos+=n;return 1;}return 0;}
static int xr_emit_expr(XrExpr *p,int level);
static int xr_primary(XrExpr *p){
 xr_ws(p);const char *s=p->s;size_t i=p->pos;
 if(s[i]=='('){p->pos++;if(!one(&p->out,'(')||!xr_emit_expr(p,0)||!xr_eat(p,")")||!one(&p->out,')'))return 0;return 1;}
 if(s[i]=='\"'||s[i]=='\''){
  char quote=s[i++],literal[512];size_t k=0;int closed=0;
  while(s[i]){if(s[i]==quote){i++;closed=1;break;}
   char c=s[i++];if(c=='\\'){if(!s[i])return 0;char next=s[i++];
    if(next=='n')c='\n';else if(next=='t')c='\t';else if(next=='r')c='\r';else if(next==quote)c=quote;else if(next=='\\')c='\\';else return 0;
   }
   if(k+1>=sizeof literal)return 0;
   literal[k++]=c;
  }
  if(!closed)return 0;
  literal[k]=0;p->pos=i;return jsquote(&p->out,literal);
 }
 if(s[i]>='0'&&s[i]<='9'){
  size_t start=i;while(s[i]>='0'&&s[i]<='9')i++;
  if(s[i]=='.'){i++;if(!(s[i]>='0'&&s[i]<='9'))return 0;while(s[i]>='0'&&s[i]<='9')i++;}
  if(i-start>16)return 0;
  p->pos=i;return append(&p->out,s+start,i-start);
 }
 if(asciiletter(s[i])||s[i]=='_'){
  char ident[128];size_t k=0;
  while(asciiletter(s[i])||(s[i]>='0'&&s[i]<='9')||s[i]=='_'){
   if(k+1>=sizeof ident)return 0;
   ident[k++]=lo(s[i++]);
  }
  ident[k]=0;p->pos=i;
  if(!strcmp(ident,"yupz")||!strcmp(ident,"true"))return adds(&p->out,"true");
  if(!strcmp(ident,"nopez")||!strcmp(ident,"false"))return adds(&p->out,"false");
  int idx=xr_stateidx(p->program,ident);if(idx<0)return 0;
  if(!adds(&p->out,"state["))return 0;
  if(!jsquote(&p->out,p->program->state[idx].name))return 0;
  return one(&p->out,']');
 }
 return 0;
}
static int xr_unary(XrExpr *p){
 if(xr_eat(p,"!")){if(!one(&p->out,'!'))return 0;return xr_unary(p);}
 if(xr_eat(p,"-")){if(!one(&p->out,'-'))return 0;return xr_unary(p);}
 if(xr_eat(p,"+")){if(!one(&p->out,'+'))return 0;return xr_unary(p);}
 return xr_primary(p);
}
static int xr_mul(XrExpr *p){if(!xr_unary(p))return 0;
 for(;;){const char *op=NULL;if(xr_eat(p,"*"))op="*";else if(xr_eat(p,"/"))op="/";else if(xr_eat(p,"%"))op="%";else break;
 if(!adds(&p->out,op)||!xr_unary(p))return 0;}return 1;}
static int xr_add(XrExpr *p){if(!xr_mul(p))return 0;
 for(;;){const char *op=NULL;if(xr_eat(p,"+"))op="+";else if(xr_eat(p,"-"))op="-";else break;
 if(!adds(&p->out,op)||!xr_mul(p))return 0;}return 1;}
static int xr_rel(XrExpr *p){if(!xr_add(p))return 0;
 for(;;){const char *op=NULL;if(xr_eat(p,"<="))op="<=";else if(xr_eat(p,">="))op=">=";else if(xr_eat(p,"<"))op="<";else if(xr_eat(p,">"))op=">";else break;
 if(!adds(&p->out,op)||!xr_add(p))return 0;}return 1;}
static int xr_eq(XrExpr *p){if(!xr_rel(p))return 0;
 for(;;){const char *op=NULL;if(xr_eat(p,"=="))op="===";else if(xr_eat(p,"!="))op="!==";else break;
 if(!adds(&p->out,op)||!xr_rel(p))return 0;}return 1;}
static int xr_and(XrExpr *p){if(!xr_eq(p))return 0;while(xr_eat(p,"&&")){if(!adds(&p->out,"&&")||!xr_eq(p))return 0;}return 1;}
static int xr_emit_expr(XrExpr *p,int level){(void)level;if(!xr_and(p))return 0;
 while(xr_eat(p,"||")){if(!adds(&p->out,"||")||!xr_and(p))return 0;}return 1;}
static int xr_expression(const XrProgram *program,const char *s,Buf *result,int line){
 XrExpr p={0};p.s=s;p.program=program;
 if(!xr_emit_expr(&p,0)){free(p.out.s);xr_error("Invalid expression, unknown state, or unsupported operator",line);return 0;}
 xr_ws(&p);if(p.s[p.pos]){free(p.out.s);xr_error("Unexpected token following expression",line);return 0;}
 int ok=append(result,p.out.s,p.out.n);free(p.out.s);return ok;
}
static int xr_literal(const char *value){
 if(!strcmp(value,"true")||!strcmp(value,"false")||!strcmp(value,"yupz")||!strcmp(value,"nopez"))return 1;
 if(value[0]=='\"'||value[0]=='\'')return 1;
 if(value[0]=='-'||value[0]=='+')value++;
 if(!(*value>='0'&&*value<='9'))return 0;
 for(;*value;value++){if(!(*value>='0'&&*value<='9')&&*value!='.')return 0;}
 return 1;
}
static int xr_assign(XrProgram *p,int oi,char *value,int declarable){
 char *arrow=strstr(value,"<-");if(!arrow)arrow=strstr(value,"+=");if(!arrow)arrow=strstr(value,"-=");
 if(!arrow){xr_error("Expected variable <- expression (or += / -=)",p->op[oi].line);return 0;}
 char operator=arrow[0];*arrow=0;char *name=trim(value),*rhs=trim(arrow+2);xr_low(name);
 if(!identifier(name)||strlen(name)>=sizeof p->state[0].name||!strlen(rhs)){xr_error("Invalid variable or missing expression",p->op[oi].line);return 0;}
 if(!xr_copy(p->op[oi].name,sizeof p->op[oi].name,name))return 0;
 if(operator=='+'||operator=='-'){
  char buf[512];size_t n=strlen(name),m=strlen(rhs);if(n+m+4>=sizeof buf){xr_error("Expression too long",p->op[oi].line);return 0;}
  memcpy(buf,name,n);buf[n]=' ';buf[n+1]=operator;buf[n+2]=' ';memcpy(buf+n+3,rhs,m+1);
  if(!xr_copy(p->op[oi].expr,sizeof p->op[oi].expr,buf))return 0;
 }else if(!xr_copy(p->op[oi].expr,sizeof p->op[oi].expr,rhs))return 0;
 int exists=xr_stateidx(p,name);
 if(exists<0){
  if(!declarable){xr_error("Assignment refers to an undeclared state",p->op[oi].line);return 0;}
  if(p->nstate>=XR_MAX_STATES){xr_error("Too many state variables",p->op[oi].line);return 0;}
  if(!xr_literal(rhs)){xr_error("Initial state must be a number, string, or boolean literal",p->op[oi].line);return 0;}
  XrState *st=&p->state[p->nstate++];xr_copy(st->name,sizeof st->name,name);xr_copy(st->initial,sizeof st->initial,rhs);
  p->op[oi].type=XR_DECL;
 }else p->op[oi].type=XR_SET;
 return 1;
}
/* Read a line's head after one of the 18 dialect syntactic prefixes. */
static int xr_head(char *line,char *cmd,size_t cap,char **tail){
 char *p=xr_skip(line);
 if(!*p||!strncmp(p,"//",2)||!strncmp(p,"/*",2)||!strncmp(p,"*/",2))return 0;
 if(!strncmp(p,"::endz",6)||!strncmp(p,"::finish",8)){xr_copy(cmd,cap,"endz");*tail=p+6;return 1;}
 if(*p=='|'&&p[1]==' '){p++;while(*p==' '||(*p>='0'&&*p<='9'))p++;if(*p=='|')p++;p=xr_skip(p);}
 if(!strncmp(p,":\"R-CJS:Canvas:",15)||!strncmp(p,"R-CJS : Canvas",14)||!strncmp(p,":\"END:Canvas",12)){
  xr_copy(cmd,cap,"padz");*tail=p+strlen(p);return 1;}
 if(!strncmp(p,":\"",2))p+=2;
 if(!strncmp(p,"</:",3))return 0;
 if(!strncmp(p,"<:",2))p+=2;
 if(*p=='\"')p++;
 if(*p=='#'&&strstr(p,"<~")){xr_copy(cmd,cap,"pinz");*tail=p;return 1;}
 int n=0;while((asciiletter(*p)||*p=='-'||*p=='.'||*p=='_'||(*p>='0'&&*p<='9'))&&n+1<(int)cap)cmd[n++]=lo(*p++);
 cmd[n]=0;if(!n)return 0;
 if(*p=='\"'&&strncmp(p,"\"\"\"",3))p++;
 if(!strcmp(cmd,"r-cjs"))xr_copy(cmd,cap,"padz");
 *tail=p;return 1;
}
static int xr_is_end(char *s){s=xr_skip(s);return !strncmp(s,"endz",4)||!strncmp(s,"::endz",6)||!strncmp(s,"</:",3)||!strcmp(s,"}")||!strcmp(s,")")||!strncmp(s,"::finish",8);}
static int xr_parse(const char *source,XrProgram *p){
 const char *ptr=source;int stack[XR_MAX_DEPTH],sp=0,lineNo=0;
 while(*ptr){lineNo++;const char *end=strchr(ptr,'\n');size_t n=end?(size_t)(end-ptr):strlen(ptr);
  if(n>1023){xr_error("Line exceeds 1023 bytes",lineNo);return 0;}
  char raw[1024];memcpy(raw,ptr,n);raw[n]=0;
  ptr=end?end+1:ptr+n;
  int indent=0;while(raw[indent]==' '||raw[indent]=='\t')indent+=1;
  char *line=trim(raw);if(!*line||!strncmp(line,"//",2)||!strncmp(line,"/*",2)||!strncmp(line,"*/",2))continue;
  if(xr_is_end(line)){while(sp&&p->op[stack[sp-1]].indent>indent)sp--;
    if(sp&&p->op[stack[sp-1]].indent==indent)sp--;
    continue;}
  while(sp&&p->op[stack[sp-1]].indent>=indent)sp--;
  int parent=sp?p->op[stack[sp-1]].parent>=-1?stack[sp-1]:-1:-1;
  char cmd[128],stableCanon[128];char *value=NULL;if(!xr_head(line,cmd,sizeof cmd,&value)){
   xr_error("Unknown statement (nothing is silently ignored)",lineNo);return 0;}
  const char *canon=alias(cmd);char *arg=xr_unwrap(value);
  if(!strcmp(canon,"padz")||!strcmp(canon,"lookz")||!strcmp(canon,"pinz")||!strcmp(canon,"snagz"))continue;
  if(!strcmp(canon,"endz"))continue;
  if(!strcmp(canon,"spit")){
   if(!*arg||!strncmp(arg,"lookz",5)||!strncmp(arg,"ui",2))continue;
   if(!strncmp(arg,"sayz",4)||!strncmp(arg,"text",4)||!strncmp(arg,"txt",3)||!strncmp(arg,"tapz",4)||!strncmp(arg,"button",6)||!strncmp(arg,"btn",3)||!strncmp(arg,"headz",5)){
    char nested[128];char *rest;if(!xr_head(arg,nested,sizeof nested,&rest)){xr_error("Invalid render component",lineNo);return 0;}
    if(!xr_copy(stableCanon,sizeof stableCanon,alias(nested))){xr_error("Component command too long",lineNo);return 0;}canon=stableCanon;arg=xr_unwrap(rest);
   }else{
    /* Reverse Commands syntax: :\"spit\"\"\"sayz Score\"\"\" */
    char nested[128];char *rest;if(xr_head(arg,nested,sizeof nested,&rest)&&(!strcmp(alias(nested),"sayz")||!strcmp(alias(nested),"tapz")||!strcmp(alias(nested),"headz"))){if(!xr_copy(stableCanon,sizeof stableCanon,alias(nested))){xr_error("Component command too long",lineNo);return 0;}canon=stableCanon;arg=xr_unwrap(rest);}
    else {xr_error("Render must specify a text or button component",lineNo);return 0;}
   }
  }
  if(!strcmp(canon,"stash")||!strcmp(canon,"bagz")){
   int idx=xr_push(p,XR_SET,parent,indent,lineNo,"");if(idx<0)return 0;
   if(!xr_assign(p,idx,arg,parent<0))return 0;
   continue;
  }
  if(!strcmp(canon,"sayz")||!strcmp(canon,"headz")){
   int idx=xr_push(p,!strcmp(canon,"headz")?XR_HEADING:XR_TEXT,parent,indent,lineNo,arg);if(idx<0)return 0;continue;
  }
  if(!strcmp(canon,"stylez")){
   char *arrow=strstr(arg,"<-");
   if(!arrow){xr_error("stylez requires target <- quoted CSS declarations",lineNo);return 0;}
   *arrow=0;char *target=trim(arg),*rules=trim(arrow+2);xr_low(target);
   if(strcmp(target,"padz")&&strcmp(target,"sayz")&&strcmp(target,"tapz")&&strcmp(target,"headz")){
     xr_error("Style target must be padz, sayz, tapz, or headz",lineNo);return 0;
   }
   int idx=xr_push(p,XR_STYLE,parent,indent,lineNo,rules);if(idx<0)return 0;
   if(!xr_copy(p->op[idx].name,sizeof p->op[idx].name,target)){xr_error("Style target too long",lineNo);return 0;}
   continue;
  }
  if(!strcmp(canon,"tapz")){
   int idx=xr_push(p,XR_BUTTON,parent,indent,lineNo,arg);if(idx<0)return 0;
   if(!xr_copy(p->op[idx].label,sizeof p->op[idx].label,arg)){xr_error("Button label too long",lineNo);return 0;}
   size_t k=strlen(p->op[idx].label);if(k&&p->op[idx].label[k-1]==':')p->op[idx].label[k-1]=0;
   if(sp>=XR_MAX_DEPTH){xr_error("Nesting too deep",lineNo);return 0;}stack[sp++]=idx;continue;
  }
  if(!strcmp(canon,"whenz")){
   int parentButton=-1;for(int i=sp-1;i>=0;i--)if(p->op[stack[i]].type==XR_BUTTON){parentButton=stack[i];break;}
   XrType type=(eqi(arg,"tapz")||eqi(arg,"tapz:")||eqi(arg,"button")||eqi(arg,"click"))&&parentButton>=0?XR_CLICK:XR_IF;
   int idx=xr_push(p,type,parent,indent,lineNo,arg);if(idx<0)return 0;
   if(sp>=XR_MAX_DEPTH){xr_error("Nesting too deep",lineNo);return 0;}stack[sp++]=idx;continue;
  }
  if(!strcmp(canon,"spinzz")){
   char *every=arg;
   if(!strncmp(every,"every",5))every=xr_skip(every+5);
   int interval=0;if(!(*every>='0'&&*every<='9')){xr_error("Timer expects every N ms",lineNo);return 0;}
   while(*every>='0'&&*every<='9'){interval=interval*10+(*every++-'0');if(interval>600000)break;}
   every=xr_skip(every);
   if(interval<10||interval>600000||strncmp(every,"ms",2)){xr_error("Timer interval must be 10..600000 milliseconds",lineNo);return 0;}
   int idx=xr_push(p,XR_TIMER,parent,indent,lineNo,"");if(idx<0)return 0;p->op[idx].ms=interval;
   if(sp>=XR_MAX_DEPTH){xr_error("Nesting too deep",lineNo);return 0;}stack[sp++]=idx;continue;
  }
  if(!strcmp(canon,"flipz")){int idx=xr_push(p,XR_REFRESH,parent,indent,lineNo,arg);if(idx<0)return 0;continue;}
  if(!strcmp(canon,"movez")||!strcmp(canon,"backz")){
   if(!strcmp(canon,"backz")||eqi(arg,"backz")||eqi(arg,"backz:")){
    if(xr_push(p,XR_RESET,parent,indent,lineNo,"")<0)return 0;
    continue;
   }
   int idx=xr_push(p,XR_EXPLICIT,parent,indent,lineNo,arg);if(idx<0)return 0;continue;
  }
  xr_error("Unsupported statement in typed mode",lineNo);return 0;
 }
 if(!p->count){xr_error("No typed instructions",1);return 0;}
 return 1;
}
static int xr_value(const XrProgram *p,const char *v,Buf *out,int line,int quotedFallback){
 char value[512];if(!xr_copy(value,sizeof value,v)){xr_error("Oversized expression",line);return 0;}
 char *s=trim(value);size_t n=strlen(s);while(n&&s[n-1]==':')s[--n]=0;s=trim(s);
 if(eqi(s,"HW"))return jsquote(out,"Hello World");
 if(quotedFallback){
  /* The legacy label syntax accepts unquoted text, but an identifier matching
   * a state remains a reactive expression. */
  if(xr_stateidx(p,s)<0&&s[0]!='\"'&&s[0]!='\''&&s[0]!='-'&&!(s[0]>='0'&&s[0]<='9')&&!strstr(s," + "))return jsquote(out,s);
 }
 return xr_expression(p,s,out,line);
}
/* CLJ-authored UI styling. CSS rules are parsed and emitted as safe DOM
 * setProperty calls, not as markup or executable JavaScript. */
static int xr_css_allowed(const char *property){
 static const char *allow[]={"background","background-color","color","padding","margin","border","border-color","border-radius","font-size","font-weight","font-family","line-height","letter-spacing","text-align","display","gap","min-height","max-width","width","box-shadow","text-shadow","cursor","opacity","justify-content","align-items","grid-template-columns","flex-direction","transition","outline","outline-offset","overflow","position","top","left","right","bottom"};
 for(size_t i=0;i<sizeof(allow)/sizeof(allow[0]);i++)if(!strcmp(property,allow[i]))return 1;
 return 0;
}
static int xr_emit_style(Buf *out,const XrOp *o){
 char rules[512];if(!xr_copy(rules,sizeof rules,o->expr))return 0;
 char *p=trim(rules);size_t n=strlen(p);
 if(n<2||!((*p=='"'&&p[n-1]=='"')||(*p=='\''&&p[n-1]=='\''))){xr_error("stylez requires quoted CSS",o->line);return 0;}
 p[n-1]=0;p++;if(!*p){xr_error("stylez is empty",o->line);return 0;}
 if(!adds(out,"if(kind==="))return 0;
 if(!jsquote(out,o->name)||!adds(out,") {\n"))return 0;
 for(char *item=p;item&&*item;){char *next=strchr(item,';');if(next)*next=0;
  char *decl=trim(item);if(*decl){char *colon=strchr(decl,':');if(!colon){xr_error("Invalid stylez declaration (property:value)",o->line);return 0;}
   *colon=0;char *prop=trim(decl),*value=trim(colon+1);
   if(!xr_css_allowed(prop)||!*value||strlen(value)>240){xr_error("Unknown CSS property or invalid style value",o->line);return 0;}
   for(const char *q=value;*q;q++)if(*q=='<'||*q=='>'||*q=='{'||*q=='}'||*q=='\\'){xr_error("Unsafe characters in style value",o->line);return 0;}
   if(strstr(value,"url(")||strstr(value,"@import")||strstr(value,"expression(")||strstr(value,"javascript:")||strstr(value,"data:")){xr_error("External or executable CSS is not allowed in stylez",o->line);return 0;}
   if(!adds(out,"node.style.setProperty(" )||!jsquote(out,prop)||!one(out,',')||!jsquote(out,value)||!adds(out,");\n"))return 0;
  }
  item=next?next+1:NULL;
 }
 return adds(out,"}\n");
}
static int xr_emit_int(Buf *out,int n){char tmp[16];int i=0;if(n<0){if(!one(out,'-'))return 0;n=-n;}do{tmp[i++]=(char)('0'+n%10);n/=10;}while(n);while(i--)if(!one(out,tmp[i]))return 0;return 1;}
static int xr_emit_explicit(const XrProgram *p,Buf *out,const XrOp *o){
 char raw[512];if(!xr_copy(raw,sizeof raw,o->expr))return 0;
 char *arrow=strstr(raw,"->");if(!arrow){xr_error("Explicit action requires Label -> State += N",o->line);return 0;}
 *arrow=0;char *body=trim(arrow+2);char *sign=strstr(body,"+=");int minus=0;
 if(!sign){sign=strstr(body,"-=");minus=1;}
 if(!sign){xr_error("Explicit action requires += or -=",o->line);return 0;}
 *sign=0;char *name=trim(body);xr_low(name);if(xr_stateidx(p,name)<0){xr_error("Action references an unknown state",o->line);return 0;}
 if(!adds(out,"state["))return 0;
 if(!jsquote(out,name)||!adds(out,"]"))return 0;
 if(!adds(out,minus?"-=":"+="))return 0;
 return xr_expression(p,trim(sign+2),out,o->line)&&adds(out,";\n");
}
static int xr_emit_actions(const XrProgram *p,Buf *out,int parent,int depth){
 if(depth>XR_MAX_DEPTH)return 0;
 for(int i=0;i<p->count;i++)if(p->op[i].parent==parent){const XrOp *o=&p->op[i];
  if(o->type==XR_SET){
   if(!adds(out,"state["))return 0;
   if(!jsquote(out,o->name)||!adds(out,"]="))return 0;
   if(!xr_expression(p,o->expr,out,o->line)||!adds(out,";\n"))return 0;
  }else if(o->type==XR_RESET){if(!adds(out,"Object.assign(state,initial);\n"))return 0;
  }else if(o->type==XR_IF){
   if(!adds(out,"if("))return 0;
   if(!xr_value(p,o->expr,out,o->line,0)||!adds(out,"){\n"))return 0;
   if(!xr_emit_actions(p,out,i,depth+1)||!adds(out,"}\n"))return 0;
  }else if(o->type==XR_CLICK){if(!xr_emit_actions(p,out,i,depth+1))return 0;
  }else if(o->type==XR_EXPLICIT){
   if(!xr_emit_explicit(p,out,o))return 0;
  }
 }
 return 1;
}
static int xr_ancestor_if(const XrProgram *p,Buf *out,int oi,int stopAtEvent){
 int ancestors[XR_MAX_DEPTH],n=0,j=p->op[oi].parent;
 while(j>=0&&n<XR_MAX_DEPTH){
  if(p->op[j].type==XR_TIMER||p->op[j].type==XR_CLICK){if(stopAtEvent)break;}
  if(p->op[j].type==XR_IF)ancestors[n++]=j;
  j=p->op[j].parent;
 }
 for(int k=n-1;k>=0;k--){if(!adds(out,"("))return 0;
  if(!xr_value(p,p->op[ancestors[k]].expr,out,p->op[ancestors[k]].line,0)||!adds(out,")&&"))return 0;
 }
 return adds(out,"true");
}
static int xr_button_has_actions(const XrProgram *p,int bi,int node){
 int parent=p->op[node].parent;while(parent>=0){if(parent==bi)return 1;parent=p->op[parent].parent;}return 0;
}
static int xr_compile(const char *norm,const char *dialect,Buf *out){
 XrProgram *p=malloc(sizeof *p);if(!p){failure="Out of memory";return 0;}
 memset(p,0,sizeof *p);
 int ok=xr_parse(norm,p);if(!ok){free(p);return 0;}
 /* Validate all non-literal expressions before emitting a partial program. */
 Buf header={0};
 ok=adds(out,"/* CJS18 typed C11 compiler: 18 dialects, no eval. */\nexport const CJS_ADVANCED=Object.freeze({dialect:")&&jsquote(out,dialect)&&adds(out,",initial:Object.freeze({");
 for(int i=0;ok&&i<p->nstate;i++){
  if(i)ok=one(out,',');
  if(!ok)break;
  ok=jsquote(out,p->state[i].name)&&one(out,':')&&xr_expression(p,p->state[i].initial,out,1);
 }
 if(ok)ok=adds(out,"})});\nexport function mountCJS18(root=document.getElementById('root'),scheduler=globalThis){\n if(!root)throw Error('Missing #root');\n const initial=CJS_ADVANCED.initial;\n const state=Object.assign(Object.create(null),initial);\n let disposed=false;const timers=[];\n");
 int styled=0;for(int i=0;i<p->count;i++)if(p->op[i].type==XR_STYLE)styled++;
 if(ok&&styled){
  ok=adds(out,"function applyDesign(node,kind){\n");
  for(int i=0;ok&&i<p->count;i++)if(p->op[i].type==XR_STYLE)ok=xr_emit_style(out,&p->op[i]);
  if(ok)ok=adds(out,"}\napplyDesign(root,'padz');\n");
 }
 if(ok)ok=adds(out,"const nodes=new Map();let active=[];\nfunction render(){if(disposed)return root;const next=[];\n");
 int elems=0;
 for(int i=0;ok&&i<p->count;i++)if(p->op[i].type==XR_TEXT||p->op[i].type==XR_BUTTON||p->op[i].type==XR_HEADING){
  const XrOp *o=&p->op[i];elems++;
  ok=adds(out,"if(")&&xr_ancestor_if(p,out,i,1)&&adds(out,"){\n let n=nodes.get(")&&xr_emit_int(out,i)&&adds(out,");if(!n){n=document.createElement(");
  if(!ok)break;
  ok=jsquote(out,o->type==XR_TEXT?"p":o->type==XR_HEADING?"h1":"button")&&adds(out,");nodes.set(")&&xr_emit_int(out,i)&&adds(out,",n);\n");
  if(ok&&styled)ok=adds(out,"applyDesign(n,")&&jsquote(out,o->type==XR_TEXT?"sayz":o->type==XR_HEADING?"headz":"tapz")&&adds(out,");\n");
  if(o->type==XR_BUTTON&&ok){
   ok=adds(out,"n.addEventListener('click',()=>{if(disposed)return;\n");
   if(ok)ok=xr_emit_actions(p,out,i,0);
   /* Extra scoped CLICK children are handled by xr_emit_actions's recursion. */
   for(int k=0;ok&&k<p->count;k++)if(p->op[k].type==XR_EXPLICIT&&!xr_button_has_actions(p,i,k)){
    const char *arrow=strstr(p->op[k].expr,"->");if(!arrow)continue;
    char trigger[160];size_t length=(size_t)(arrow-p->op[k].expr);if(length>=sizeof trigger)continue;
    memcpy(trigger,p->op[k].expr,length);trigger[length]=0;
    if(!eqi(trim(trigger),trim((char*)o->label)))continue;
    ok=xr_emit_explicit(p,out,&p->op[k]);break;
   }
   if(ok)ok=adds(out,"render();});\n");
  }
  if(ok)ok=adds(out,"}const txt=String(")&&xr_value(p,o->type!=XR_BUTTON?o->expr:o->label,out,o->line,o->type==XR_BUTTON||!strstr(o->expr," + "))&&adds(out,");if(n.textContent!==txt)n.textContent=txt;next.push(n);}\n");
 }
 if(ok&&!elems){xr_error("No text or button has been rendered",1);ok=0;}
 if(ok)ok=adds(out,"if(active.length!==next.length||next.some((n,i)=>n!==active[i]))root.replaceChildren(...next);active=next;return root;}\n");
 for(int i=0;ok&&i<p->count;i++)if(p->op[i].type==XR_TIMER){
  const XrOp *o=&p->op[i];
  ok=adds(out,"timers.push(scheduler.setInterval(()=>{if(disposed)return; if(")&&xr_ancestor_if(p,out,i,0)&&adds(out,"){\n");
  if(ok)ok=xr_emit_actions(p,out,i,0);
  if(ok)ok=adds(out,"}render();},")&&xr_emit_int(out,o->ms)&&adds(out,"));\n");
 }
 if(ok)ok=adds(out,"render();const api={state,render,reset(){Object.assign(state,initial);render();},dispose(){if(disposed)return;disposed=true;for(const id of timers)scheduler.clearInterval(id);}};\nObject.defineProperty(root,'cjs18',{value:api,configurable:true});return root;\n}\nexport default mountCJS18;\n");
 free(header.s);free(p);return ok;
}
