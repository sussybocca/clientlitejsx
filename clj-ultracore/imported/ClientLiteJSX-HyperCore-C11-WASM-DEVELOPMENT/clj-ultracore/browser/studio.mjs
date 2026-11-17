import {loadCJS18} from './compiler-loader.mjs';
import {createHyperCoreWorker} from './compiler-client.mjs';
const $=id=>document.getElementById(id);
const editor=$('source'),output=$('output'),status=$('status'),list=$('dialect'),preview=$('preview');
const dialects=['Reverse Commands','Reversed JSX','Backflow CJS','Upside-Down CJS','HyperCJS',
  'ZIPSHOT','GHOSTWIRE','LETTERSHATTER','ARROWSPINE','MIRRORMOUTH','DOTPULSE','COLUMNRITUAL',
  'FLIPTAG','WIREGRIND','QUOTEDVAULT','GRIDLOCK','BOTTOMUP','FULLCIRCUIT'];
for(let i=0;i<18;i++){
 const o=document.createElement('option');o.value=String(i+1).padStart(2,'0');o.textContent=`${String(i+1).padStart(2,'0')} · ${dialects[i]}`;list.append(o);
}
let compiler;
let generation=0;
let workerCompiler;
try {workerCompiler=createHyperCoreWorker();} catch { /* fallback to direct WASM compilation */ }
async function sample(token=++generation){
 const res=await fetch('../examples/'+list.value+'.clj',{cache:'no-store'});
 if(!res.ok)throw Error(`Cannot load sample (${res.status})`);
 const text=await res.text();if(token!==generation)return false;
 editor.value=text;status.textContent=`Sample ${list.value} loaded · edit and compile using WASM`;return true;
}
function safePreview(script){
 // OPEN.LiveSource requires OPEN's *trusted* published shell. Never run a
 // privileged source widget in an untrusted editor iframe.
 if(script.includes('component:"OPEN.LiveSource"')){
  preview.srcdoc='<!doctype html><meta charset="utf-8"><style>body{font:15px system-ui;background:#071813;color:#c3ead3;padding:24px}</style><h2>Trusted OPEN shell required</h2><p>The C compiler generated the same Living Source component. Its editing, auth, revisions and WebSocket behavior are provided by the existing OPEN published-page shell and cannot be previewed in this sandbox.</p>';
  return;
 }
 // Generated standalone browser UI always uses DOM APIs, not HTML strings.
 // This iframe has an opaque origin and no access to OPEN cookies or parent DOM.
 const html='<!doctype html><meta charset="utf-8"><style>body{font:16px system-ui;color:#e1f8ea;background:#091b15;padding:18px}button{padding:10px;background:#185a42;color:white;border:1px solid #419c71;border-radius:8px;margin-right:12px}output{font-size:20px}</style><div id="root"></div>';
 const embedded=script.replace(/<\/script/gi,'<\\/script');
 preview.srcdoc=html+`<script type="module">${embedded}\nmountCJS18();<\/script>`;
}
async function compile(token=generation){
 try{
  if(!workerCompiler&&!compiler)compiler=await loadCJS18();
  if(token!==generation)return;
  const start=performance.now();
  const result=workerCompiler?await workerCompiler.compile(editor.value,{stats:true}):{javascript:compiler.compile(editor.value),stats:compiler.stats()};
  if(token!==generation)return;
  const script=result.javascript,elapsed=(performance.now()-start).toFixed(2);
  output.value=script;safePreview(script);status.textContent=`✓ Compiled in WebAssembly · ${elapsed} ms · ${new TextEncoder().encode(script).length} output bytes`;
  const metrics=result.stats;
  if(metrics)$('telemetry').textContent=`C/WASM memory peak: ${metrics.peakAllocatedBytes.toLocaleString()} B · free-list reuses: ${metrics.allocationsReused} · reusable memory: ${metrics.reusableBytes.toLocaleString()} B · compiler cache hits: ${metrics.cacheHits} · WASM linear memory: ${(metrics.linearMemoryBytes/1048576).toFixed(1)} MiB`;
 }catch(e){output.value='';preview.srcdoc='';status.textContent='✕ '+e.message;}
}
$('compile').addEventListener('click',compile);
list.addEventListener('change',()=>{const token=++generation;sample(token).then(ok=>{if(ok)compile(token);}).catch(e=>status.textContent=e.message);});
$('download').addEventListener('click',()=>{
 if(!output.value)return;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([output.value],{type:'text/javascript'}));a.download=`cjs18-${list.value}.mjs`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
});
$('game').addEventListener('click',async()=>{
 const token=++generation;
 const slugs=['reverse-commands','reversed-jsx','backflow','upside-down','hypercjs','zipshot','ghostwire','lettershatter','arrowspine','mirrormouth','dotpulse','columnritual','fliptag','wiregrind','quotedvault','gridlock','bottomup','fullcircuit'];
 const slug=slugs[Number(list.value)-1];
 try{
  const response=await fetch('../examples/games/'+list.value+'-'+slug+'.clj',{cache:'no-store'});
  if(!response.ok)throw Error('Game source missing: HTTP '+response.status);
  const source=await response.text();if(token!==generation)return;
  editor.value=source;await compile(token);
 }catch(error){status.textContent='✕ '+error.message;}
});
$('hello').addEventListener('click' ,()=>{generation++;editor.value=':\"R-CJS:Canvas:\n    :\"Render\"\"\"TXT HW\"\"\"';compile();});
$('counter').addEventListener('click',()=>{generation++;editor.value=':\"R-CJS:Canvas:\n    :\"State\"\"\"Score <- 0\"\"\"\n    :\"Render\"\"\"BTN Add Score\"\"\"\n    :\"Action\"\"\"Add Score -> Score += 1\"\"\"\n    :\"Render\"\"\"TXT Score\"\"\"';compile();});
{const token=++generation;sample(token).then(ok=>{if(ok)compile(token);}).catch(e=>status.textContent=e.message);}

// These layouts are authored in .clj, compiled by the C WASM frontend.
const designs=['neon-score-arena','retro-terminal','sunset-clicker','cyber-dashboard','violet-simulator','ocean-counter','golden-arcade','desert-score','mint-console','rose-timer','night-sky','ember-clicker','forest-progress','monochrome-ui','ice-lab','rainbow-game'];
const designList=$('theme');
for(const item of designs){const option=document.createElement('option');option.value=item;option.textContent=item.replaceAll('-',' ');designList.append(option);}
$('styled').addEventListener('click',async()=>{
 const token=++generation;
 try{
  const response=await fetch('../examples/ui/'+designList.value+'.clj',{cache:'no-store'});
  if(!response.ok)throw new Error('Cannot load CLJ UI '+response.status);
  const source=await response.text();if(token!==generation)return;
  editor.value=source;await compile(token);
 }catch(error){status.textContent='✕ '+error.message;}
});
