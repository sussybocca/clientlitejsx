import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';
const file=process.argv[2];assert.ok(file);
const {mountCJS18}=await import(pathToFileURL(path.resolve(file)).href);
let created=0,replacements=0,handlers=0;
class Element {
 constructor(tag){this.tag=tag;this.textContent='';this.children=[];this.events={};this.styles={};this.style={setProperty:(name,value)=>{this.styles[name]=value;}};}
 replaceChildren(...items){replacements++;this.children=items;}
 append(...items){this.children.push(...items);}
 addEventListener(name,fn){handlers++;this.events[name]=fn;}
}
globalThis.document={createElement:(tag)=>{created++;return new Element(tag);}};
const root=new Element('main');const timers=[];
mountCJS18(root,{setInterval(fn,ms){timers.push(fn);return timers.length;},clearInterval(id){}});
const initCreates=created,initReplacements=replacements,initHandlers=handlers;
for(let i=0;i<10;i++)timers[0]();
assert.equal(replacements,initReplacements,'static structure must not be replaced');
assert.equal(created,initCreates,'no new DOM elements needed for timer');
assert.equal(handlers,initHandlers,'no repeated event listeners');
const btn=root.children.find(e=>e.tag==='button'&&e.textContent==='CLICK ME');
btn.events.click();assert.equal(root.cjs18.state.score,1);
assert.equal(replacements,initReplacements,'click must update text, not recreate DOM');
for(let i=10;i<60;i++)timers[0]();
assert.equal(root.cjs18.state.gameover,true);
assert.ok(replacements>initReplacements,'game-over changes component structure');
const overCreates=created;
root.children.find(e=>e.tag==='button'&&e.textContent==='RESTART').events.click();
assert.equal(root.cjs18.state.time,60);
assert.equal(root.cjs18.state.gameover,false);
for(let i=0;i<10;i++)timers[0]();
assert.equal(created,overCreates,'all previously visited nodes should be reusable');
root.cjs18.dispose();
console.log('PASS HyperRuntime: persistent DOM nodes, event listeners, minimal state updates, game-over conditional transitions');
