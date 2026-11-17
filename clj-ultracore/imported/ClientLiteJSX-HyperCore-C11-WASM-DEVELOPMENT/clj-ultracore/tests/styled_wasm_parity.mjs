import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bytes=fs.readFileSync(path.join(root,'browser/cjs18-compiler.wasm'));
const {instance}=await WebAssembly.instantiate(bytes,{});
const exports=instance.exports;const encoder=new TextEncoder(),decoder=new TextDecoder();
let checked=0;
for(const sourceFile of fs.readdirSync(path.join(root,'examples/ui')).filter(f=>f.endsWith('.clj'))){
 const source=fs.readFileSync(path.join(root,'examples/ui',sourceFile),'utf8');
 const sourceBytes=encoder.encode(source);
 exports.cjs18_begin();const ptr=exports.cjs18_alloc(sourceBytes.length);
 assert.ok(ptr,sourceFile+' allocation');
 new Uint8Array(exports.memory.buffer,ptr,sourceBytes.length).set(sourceBytes);
 const status=exports.cjs18_run(ptr,sourceBytes.length);
 assert.equal(status,0,sourceFile+' compiles through WASM');
 const compiled=decoder.decode(new Uint8Array(exports.memory.buffer, exports.cjs18_result(),exports.cjs18_length()));
 const native=fs.readFileSync(path.join(root,'examples/ui/compiled',sourceFile.replace(/\.clj$/,'.mjs')),'utf8');
 assert.equal(compiled,native,sourceFile+' native/WASM byte parity');
 checked++;
}
console.log(`PASS ${checked}/${checked} CLJ authored UI themes compile identically with native C and WASM`);
