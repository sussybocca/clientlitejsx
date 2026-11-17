import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const [home,tmp]=process.argv.slice(2);
const bytes=fs.readFileSync(path.join(home,'browser/cjs18-compiler.wasm'));
const {instance}=await WebAssembly.instantiate(bytes,{});
const w=instance.exports;const text=new TextDecoder(),enc=new TextEncoder();
for(let i=1;i<=18;i++){
 const name=String(i).padStart(2,'0');const source=fs.readFileSync(path.join(home,'examples',name+'.clj'),'utf8');
 w.cjs18_begin();const input=enc.encode(source);const ptr=w.cjs18_alloc(input.length);
 assert.ok(ptr);new Uint8Array(w.memory.buffer,ptr,input.length).set(input);
 const status=w.cjs18_run(ptr,input.length);
 const err=w.cjs18_error();
 assert.equal(status,0,err?text.decode(new Uint8Array(w.memory.buffer).subarray(err,err+100)):name);
 const output=Buffer.from(new Uint8Array(w.memory.buffer,w.cjs18_result(),w.cjs18_length()));
 const native=fs.readFileSync(path.join(tmp,name+'.mjs'));
 assert.equal(output.compare(native),0,'WASM/native output differs for '+name);
}
console.log('PASS 18 WASM compiler ↔ native C11 byte-for-byte comparisons');
