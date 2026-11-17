import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
const home=path.resolve(import.meta.dirname,'..');
const names=['reverse-commands','reversed-jsx','backflow','upside-down','hypercjs','zipshot','ghostwire','lettershatter','arrowspine','mirrormouth','dotpulse','columnritual','fliptag','wiregrind','quotedvault','gridlock','bottomup','fullcircuit'];
const wasmBytes=fs.readFileSync(path.join(home,'browser/cjs18-compiler.wasm'));
const {instance}=await WebAssembly.instantiate(wasmBytes,{});
const w=instance.exports,enc=new TextEncoder(),dec=new TextDecoder('utf-8');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cjs18-typed-'));
let baseline=null;
try{
 for(let i=0;i<18;i++){
  const name=names[i],src=path.join(home,'examples/games',`${String(i+1).padStart(2,'0')}-${name}.clj`);
  assert.ok(fs.existsSync(src),`Missing real gameplay example ${name}`);
  const source=fs.readFileSync(src,'utf8');
  const target=path.join(tmp,`game-${i+1}.mjs`);
  assert.equal(execFileSync(path.join(home,'bin/cjs18'),['detect',src],{encoding:'utf8'}).trim(),name,'dialect recognition');
  execFileSync(path.join(home,'bin/cjs18'),['compile',src,target]);
  execFileSync('node',['--check',target]);
  const native=fs.readFileSync(target,'utf8');
  w.cjs18_begin();const input=enc.encode(source);const ptr=w.cjs18_alloc(input.length);
  assert.ok(ptr);new Uint8Array(w.memory.buffer,ptr,input.length).set(input);
  const status=w.cjs18_run(ptr,input.length);
  if(status){const start=w.cjs18_error(),bytes=new Uint8Array(w.memory.buffer);let end=start;while(bytes[end]&&end<bytes.length)end++;throw Error(`${name}: ${dec.decode(bytes.subarray(start,end))}`);}
  const compiled=dec.decode(new Uint8Array(w.memory.buffer,w.cjs18_result(),w.cjs18_length()));
  assert.equal(compiled,native,`Native/WASM code differs for ${name}`);
  const unified=native.replace(/dialect:"[^"]+"/,'dialect:"unified"');
  if(!baseline)baseline=unified;
  assert.equal(unified,baseline,`Gameplay output differs for ${name}`);
  const ran=spawnSync('node',[path.join(home,'tests/game_runtime.mjs'),target],{encoding:'utf8'});
  assert.equal(ran.status,0,`${name}: ${ran.stderr||ran.stdout}`);
  console.log(`PASS ${String(i+1).padStart(2,'0')} ${name}: C11=WASM, syntax valid, identical semantics, game played to completion`);
 }
 // Malformed expressions and undeclared names must never generate runnable arbitrary JS.
 const bad=[
  'padz! #root\nstash score <- 0\nsayz = score + process.exit(1)',
  'padz! #root\nstash score <- 0\nwhenz = missing > 0:\n sayz = "broken"',
  'padz! #root\nstash score <- nopez && hack()\nsayz = score',
  'padz! #root\nstash score <- 0\nsayz = "ok"; alert(1)',
  'padz! #root\nstash score <- 0\nspinzz = every 2 ms:\n  sayz = score',
  'padz! #root\nstash score <- 0\nsayz = score + missing'
 ];
 for(const source of bad){
  w.cjs18_begin();const input=enc.encode(source),ptr=w.cjs18_alloc(input.length);new Uint8Array(w.memory.buffer,ptr,input.length).set(input);
  assert.notEqual(w.cjs18_run(ptr,input.length),0,`Malformed program unexpectedly compiled: ${source}`);
 }
 console.log('PASS six malformed/unsafe typed programs rejected by native WASM');
 console.log('PASS 18/18 gameplay dialects with identical compiled logic and actual runtime behavior');
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
