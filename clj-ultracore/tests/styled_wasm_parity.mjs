import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bytes=fs.readFileSync(path.join(root,'browser/cjs18-compiler.wasm'));
const {instance}=await WebAssembly.instantiate(bytes,{});
const e=instance.exports,encoder=new TextEncoder(),decoder=new TextDecoder();
let checked=0;
for(const sourceFile of fs.readdirSync(path.join(root,'examples/ui')).filter(f=>f.endsWith('.clj'))){
 const source=fs.readFileSync(path.join(root,'examples/ui',sourceFile),'utf8');
 const input=encoder.encode(source);
 e.cjs18_begin();const ptr=e.cjs18_alloc(input.length);
 assert.ok(ptr,sourceFile+' allocation');
 new Uint8Array(e.memory.buffer,ptr,input.length).set(input);
 assert.equal(e.cjs18_run(ptr,input.length),0,sourceFile+' compiles in WASM');
 const compiled=decoder.decode(new Uint8Array(e.memory.buffer,e.cjs18_result(),e.cjs18_length()));
 const native=fs.readFileSync(path.join(root,'examples/ui/compiled',sourceFile.replace(/\.clj$/,'.mjs')),'utf8');
 assert.equal(compiled,native,sourceFile+' byte parity');
 checked++;
}
console.log('PASS '+checked+'/16 CLJ authored UI themes compiled identically in native C and WASM');