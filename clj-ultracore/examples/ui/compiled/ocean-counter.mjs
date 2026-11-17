/* CJS18 typed C11 compiler: 18 dialects, no eval. */
export const CJS_ADVANCED=Object.freeze({dialect:"dotpulse",initial:Object.freeze({"score":0,"time":60,"gameover":false})});
export function mountCJS18(root=document.getElementById('root'),scheduler=globalThis){
 if(!root)throw Error('Missing #root');
 const initial=CJS_ADVANCED.initial;
 const state=Object.assign(Object.create(null),initial);
 let disposed=false;const timers=[];
function applyDesign(node,kind){
if(kind==="padz") {
node.style.setProperty("background","#062b35");
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
node.style.setProperty("color","#77ffec");
node.style.setProperty("font-size","32px");
node.style.setProperty("font-weight","800");
}
if(kind==="sayz") {
node.style.setProperty("background","#175d6c");
node.style.setProperty("color","#ffffff");
node.style.setProperty("padding","16px");
node.style.setProperty("border-radius","12px");
node.style.setProperty("font-size","22px");
}
if(kind==="tapz") {
node.style.setProperty("background","#77ffec");
node.style.setProperty("color","#062b35");
node.style.setProperty("padding","14px");
node.style.setProperty("border-radius","10px");
node.style.setProperty("font-size","18px");
node.style.setProperty("font-weight","800");
node.style.setProperty("cursor","pointer");
}
}
applyDesign(root,'padz');
function render(){if(disposed)return root;root.replaceChildren();
if(true){
 const n=document.createElement("h1");n.textContent=String("OCEAN COUNTDOWN");
applyDesign(n,"headz");
root.append(n);}
if(true){
 const n=document.createElement("p");n.textContent=String("Score: "+state["score"]);
applyDesign(n,"sayz");
root.append(n);}
if(true){
 const n=document.createElement("p");n.textContent=String("Time Left: "+state["time"]);
applyDesign(n,"sayz");
root.append(n);}
if(true){
 const n=document.createElement("button");n.textContent=String("CLICK ME");
applyDesign(n,"tapz");
n.addEventListener('click',()=>{if(disposed)return;
state["score"]=state["score"]+1;
render();});
root.append(n);}
if((state["time"]<=0)&&true){
 const n=document.createElement("p");n.textContent=String("GAME OVER. FINAL SCORE: "+state["score"]);
applyDesign(n,"sayz");
root.append(n);}
if((state["time"]<=0)&&true){
 const n=document.createElement("button");n.textContent=String("RESTART");
applyDesign(n,"tapz");
n.addEventListener('click',()=>{if(disposed)return;
Object.assign(state,initial);
render();});
root.append(n);}
return root;}
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
