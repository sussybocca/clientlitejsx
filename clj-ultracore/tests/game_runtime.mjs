import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.argv[2];
if(!modulePath)throw Error('Pass compiled module path');
const {mountCJS18,CJS_ADVANCED}=await import(pathToFileURL(modulePath).href);
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.textContent='';}
 replaceChildren(...children){this.children=children;}
 append(...children){this.children.push(...children);}
 addEventListener(name,fn){this.events[name]=fn;}
 click(){assert.equal(this.tag,'button');assert.equal(typeof this.events.click,'function');this.events.click();}
}
const intervals=[];
const scheduler={setInterval(fn,ms){intervals.push({fn,ms,active:true});return intervals.length;},clearInterval(id){intervals[id-1].active=false;}};
globalThis.document={createElement(tag){return new Element(tag);}};
const root=new Element('main');
mountCJS18(root,scheduler);
const api=root.cjs18;
assert.deepEqual(Object.keys(CJS_ADVANCED.initial).sort(),['gameover','score','time']);
assert.equal(api.state.score,0);assert.equal(api.state.time,60);assert.equal(api.state.gameover,false);
assert.equal(intervals.length,1);assert.equal(intervals[0].ms,1000);
const btn=name=>{const b=root.children.find(n=>n.tag==='button'&&n.textContent===name);assert.ok(b,`Button ${name} missing`);return b;};
const text=()=>root.children.map(n=>n.textContent);
assert.ok(text().includes('Score: 0'));assert.ok(text().includes('Time Left: 60'));
btn('CLICK ME').click();btn('CLICK ME').click();btn('CLICK ME').click();
assert.equal(api.state.score,3);assert.ok(text().includes('Score: 3'));
for(let i=0;i<59;i++)intervals[0].fn();
assert.equal(api.state.time,1);assert.equal(api.state.gameover,false);assert.ok(!text().some(s=>s.startsWith('GAME OVER')));
intervals[0].fn();
assert.equal(api.state.time,0);assert.equal(api.state.gameover,true);
assert.ok(text().includes('GAME OVER. FINAL SCORE: 3'));
intervals[0].fn();intervals[0].fn();assert.equal(api.state.time,0,'Timer must stop changing state at game-over');
btn('RESTART').click();
assert.equal(api.state.score,0);assert.equal(api.state.time,60);assert.equal(api.state.gameover,false);
assert.ok(!text().some(s=>s.startsWith('GAME OVER')));intervals[0].fn();assert.equal(api.state.time,59);
api.dispose();assert.equal(intervals[0].active,false);intervals[0].fn();assert.equal(api.state.time,59);
console.log('PASS gameplay: typed state, nested events, click, 60 timed ticks, conditionals, game over, restart, dispose');
