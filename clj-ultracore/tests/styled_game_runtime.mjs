import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const path=process.argv[2];if(!path)throw Error('Pass generated game module');
const {mountCJS18}=await import(pathToFileURL(resolve(path)).href);
class Element{
 constructor(tag){this.tag=tag;this.textContent='';this.children=[];this.events={};this.styles={};this.style={setProperty:(k,v)=>{this.styles[k]=v}};}
 replaceChildren(...children){this.children=children;}
 append(...children){this.children.push(...children);}
 addEventListener(event,callback){this.events[event]=callback;}
}
const timers=[];
const scheduler={setInterval(fn,ms){timers.push({fn,ms,active:true});return timers.length;},clearInterval(id){timers[id-1].active=false}};
globalThis.document={createElement:tag=>new Element(tag)};
const root=new Element('main');mountCJS18(root,scheduler);
const api=root.cjs18;
assert.match(root.styles.background,/gradient|#/);
assert.equal(root.styles['border-radius'],'24px');
assert.ok(root.children.some(e=>e.tag==='h1'&&e.textContent.includes('NEON')));
assert.ok(root.children.some(e=>e.tag==='p'&&e.styles.background));
const btn=()=>root.children.find(e=>e.tag==='button'&&e.textContent==='CLICK ME');
assert.ok(btn().styles.background);
btn().events.click();assert.equal(api.state.score,1);
for(let i=0;i<60;i++)timers[0].fn();assert.equal(api.state.gameover,true);
root.children.find(e=>e.tag==='button'&&e.textContent==='RESTART').events.click();
assert.equal(api.state.time,60);assert.equal(api.state.gameover,false);
api.dispose();assert.equal(timers[0].active,false);
console.log('PASS styled CLJ game: real generated custom UI + click + timer + restart + cleanup');
