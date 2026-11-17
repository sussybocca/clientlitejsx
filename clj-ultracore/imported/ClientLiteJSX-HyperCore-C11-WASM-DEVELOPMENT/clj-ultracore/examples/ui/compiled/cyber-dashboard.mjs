/* CJS18 typed C11 compiler: 18 dialects, no eval. */
export const CJS_ADVANCED=Object.freeze({dialect:"dotpulse",initial:Object.freeze({"score":0,"time":60,"gameover":false})});
export function mountCJS18(root=document.getElementById('root'),scheduler=globalThis){
 if(!root)throw Error('Missing #root');
 const initial=CJS_ADVANCED.initial;
 const state=Object.assign(Object.create(null),initial);
 let disposed=false;const timers=[];
function applyDesign(node,kind){
if(kind==="padz") {
node.style.setProperty("background","#0c1830");
node.style.setProperty("color","#ffffff");
node.style.setProperty("padding","30px");
node.style.setProperty("border-radius","22px");
node.style.setProperty("min-height","400px");
node.style.setProperty("max-width","720px");
node.style.setProperty("display","grid");
node.style.setProperty("gap","12px");
node.style.setProperty("font-family","system-ui");
}
if(kind==="headz") {
node.style.setProperty("color","#68e0ff");
node.style.setProperty("font-size","32px");
node.style.setProperty("font-weight","800");
}
if(kind==="sayz") {
node.style.setProperty("background","#1c3b68");
node.style.setProperty("color","#ffffff");
node.style.setProperty("padding","16px");
node.style.setProperty("border-radius","12px");
node.style.setProperty("font-size","22px");
}
if(kind==="tapz") {
node.style.setProperty("background","#68e0ff");
node.style.setProperty("color","#0c1830");
node.style.setProperty("padding","14px");
node.style.setProperty("border-radius","10px");
node.style.setProperty("font-size","18px");
node.style.setProperty("font-weight","800");
node.style.setProperty("cursor","pointer");
}
}
applyDesign(root,'padz');
const nodes=new Map();let active=[];
function render(){if(disposed)return root;const next=[];
if(true){
 let n=nodes.get(4);if(!n){n=document.createElement("h1");nodes.set(4,n);
applyDesign(n,"headz");
}const txt=String("CYBER DASHBOARD");if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if(true){
 let n=nodes.get(8);if(!n){n=document.createElement("p");nodes.set(8,n);
applyDesign(n,"sayz");
}const txt=String("Score: "+state["score"]);if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if(true){
 let n=nodes.get(9);if(!n){n=document.createElement("p");nodes.set(9,n);
applyDesign(n,"sayz");
}const txt=String("Time Left: "+state["time"]);if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if(true){
 let n=nodes.get(10);if(!n){n=document.createElement("button");nodes.set(10,n);
applyDesign(n,"tapz");
n.addEventListener('click',()=>{if(disposed)return;
state["score"]=state["score"]+1;
render();});
}const txt=String("CLICK ME");if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if((state["time"]<=0)&&true){
 let n=nodes.get(19);if(!n){n=document.createElement("p");nodes.set(19,n);
applyDesign(n,"sayz");
}const txt=String("GAME OVER. FINAL SCORE: "+state["score"]);if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if((state["time"]<=0)&&true){
 let n=nodes.get(20);if(!n){n=document.createElement("button");nodes.set(20,n);
applyDesign(n,"tapz");
n.addEventListener('click',()=>{if(disposed)return;
Object.assign(state,initial);
render();});
}const txt=String("RESTART");if(n.textContent!==txt)n.textContent=txt;next.push(n);}
if(active.length!==next.length||next.some((n,i)=>n!==active[i]))root.replaceChildren(...next);active=next;return root;}
timers.push(scheduler.setInterval(()=>{if(disposed)return; if((state["gameover"]===false)&&true){
state["time"]=state["time"]-1;
if(state["time"]<=0){
state["gameover"]=true;
}
}render();},1000));
render();const api={state,render,reset(){Object.assign(state,initial);render();},dispose(){if(disposed)return;disposed=true;for(const id of timers)scheduler.clearInterval(id);}};
Object.defineProperty(root,'cjs18',{value:api,configurable:true});return root;
}
export default mountCJS18;
