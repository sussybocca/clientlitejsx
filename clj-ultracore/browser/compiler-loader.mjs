/** CJS18 compiler, written in C11 and compiled to browser-native WebAssembly.
 * No npm, Node.js, Babel, eval, or network compilation service.
 */
let instancePromise;
export async function loadCJS18(url=new URL('./cjs18-compiler.wasm',import.meta.url)){
  if(!instancePromise){instancePromise=(async()=>{
    const response=await fetch(url);
    if(!response.ok)throw new Error(`Compiler WASM HTTP ${response.status}`);
    const wasm=await WebAssembly.instantiate(await response.arrayBuffer(),{});
    const e=wasm.instance.exports;
    const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
    if(!e.cjs18_begin||!e.cjs18_run||!e.memory)throw Error('Invalid CJS18 WASM exports');
    const readCString=ptr=>{
      if(!ptr)return '';
      const bytes=new Uint8Array(e.memory.buffer);
      if(ptr>=bytes.length)throw Error('Invalid WASM error pointer');
      let end=ptr;while(end<bytes.length&&bytes[end]&&end-ptr<8192)end++;
      return decoder.decode(bytes.subarray(ptr,end));
    };
    return Object.freeze({
      compile(source){
        if(typeof source!=='string')throw TypeError('CJS source must be a string');
        const bytes=encoder.encode(source);
        if(!bytes.length||bytes.length>1048576)throw RangeError('CJS source must be 1..1048576 bytes');
        e.cjs18_begin();
        const ptr=e.cjs18_alloc(bytes.length);
        if(!ptr)throw Error('CJS18 WASM memory allocation failed');
        new Uint8Array(e.memory.buffer,ptr,bytes.length).set(bytes);
        const status=e.cjs18_run(ptr,bytes.length);
        if(status)throw Error(`CJS18 compiler error: ${readCString(e.cjs18_error())}`);
        const output=e.cjs18_result(),n=e.cjs18_length();
        if(!output||n>524288||output+n>e.memory.buffer.byteLength)throw Error('Invalid WASM output buffer');
        return decoder.decode(new Uint8Array(e.memory.buffer,output,n).slice());
      }
    });
  })().catch(e=>{instancePromise=undefined;throw e;});}
  return instancePromise;
}
