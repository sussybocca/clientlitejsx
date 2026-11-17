/** ClientLiteJSX HyperCore: C11 WebAssembly compiler browser interface.
 * No Node.js, npm, or compilation service required. */
const instances = new Map();
export async function loadCJS18(url=new URL('./cjs18-compiler.wasm',import.meta.url)) {
  const key=String(url);
  if (!instances.has(key)) {
    const loading=(async()=>{
      const response=await fetch(key);
      if(!response.ok)throw Error(`CLJ WASM HTTP ${response.status}`);
      let wasm;
      // Streaming avoids waiting for the entire binary when the server sends the right MIME.
      if(WebAssembly.instantiateStreaming && response.headers?.get('content-type')?.includes('application/wasm')) {
        try { wasm=await WebAssembly.instantiateStreaming(Promise.resolve(response.clone()),{}); }
        catch { wasm=await WebAssembly.instantiate(await response.arrayBuffer(),{}); }
      } else wasm=await WebAssembly.instantiate(await response.arrayBuffer(),{});
      const e=wasm.instance.exports;
      const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
      for(const fn of ['cjs18_begin','cjs18_alloc','cjs18_run','cjs18_result','cjs18_length','cjs18_error']) {
        if(typeof e[fn]!=='function')throw Error('Invalid CLJ compiler WASM export: '+fn);
      }
      if(!(e.memory instanceof WebAssembly.Memory))throw Error('Missing compiler linear memory');
      const readCString=ptr=>{
        if(!ptr)return '';
        const view=new Uint8Array(e.memory.buffer);
        if(ptr>=view.length)throw Error('Invalid CLJ error pointer');
        let end=ptr;
        while(end<view.length && view[end] && end-ptr<8192)end++;
        return decoder.decode(view.subarray(ptr,end));
      };
      return Object.freeze({
        compile(source){
          if(typeof source!=='string')throw TypeError('CLJ source must be a string');
          const bytes=encoder.encode(source);
          if(!bytes.length||bytes.length>4*1048576)throw RangeError('CLJ source must be 1..4194304 bytes');
          e.cjs18_begin();
          const ptr=e.cjs18_alloc(bytes.length);
          if(!ptr)throw Error('CLJ compiler WASM memory allocation failed');
          // Reacquire buffer after allocation: memory.grow detaches old views.
          if(ptr+bytes.length>e.memory.buffer.byteLength)throw Error('Invalid WASM input allocation');
          new Uint8Array(e.memory.buffer,ptr,bytes.length).set(bytes);
          const status=e.cjs18_run(ptr,bytes.length);
          if(status)throw Error(`CLJ compiler error: ${readCString(e.cjs18_error())}`);
          const out=e.cjs18_result(),n=e.cjs18_length();
          const view=new Uint8Array(e.memory.buffer); // growth-safe: fresh view
          if(!out||n>2*1048576||out+n>view.length)throw Error('Invalid CLJ WASM output buffer');
          return decoder.decode(view.subarray(out,out+n).slice());
        },
        stats(){return Object.freeze({
          cacheHits:Number(e.cjs18_cache_hits?.()??0),
          peakAllocatedBytes:Number(e.cjs18_memory_peak?.()??0),
          allocationsReused:Number(e.cjs18_memory_reuses?.()??0),
          reusableBytes:Number(e.cjs18_memory_reusable?.()??0),
          linearMemoryBytes:e.memory.buffer.byteLength
        });}
      });
    })().catch(error=>{instances.delete(key);throw error;});
    instances.set(key,loading);
  }
  return instances.get(key);
}
