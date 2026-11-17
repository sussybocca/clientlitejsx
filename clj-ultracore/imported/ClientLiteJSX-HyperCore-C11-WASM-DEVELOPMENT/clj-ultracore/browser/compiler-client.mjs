/** Async worker API; separate from synchronous loadCJS18 for compatibility. */
export function createHyperCoreWorker(){
 if(typeof Worker!=='function')throw Error('Module Workers are not available');
 const worker=new Worker(new URL('./compiler-worker.mjs',import.meta.url),{type:'module'});
 const pending=new Map();let serial=0,closed=false;
 worker.onmessage=event=>{
  const {id,ok,javascript,error,stats}=event.data??{};
  const item=pending.get(id);if(!item)return;
  pending.delete(id);
  ok?item.resolve({javascript,stats}):item.reject(new Error(error||'Compiler worker error'));
 };
 worker.onerror=event=>{
  for(const item of pending.values())item.reject(new Error('CLJ worker failed: '+(event.message||'unknown')));
  pending.clear();
 };
 return Object.freeze({
  compile(source,{stats=false}={}){
   if(closed)return Promise.reject(new Error('CLJ worker already disposed'));
   const id=++serial;
   return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.postMessage({id,source,stats});});
  },
  dispose(){if(closed)return;closed=true;worker.terminate();for(const item of pending.values())item.reject(new Error('CLJ worker disposed'));pending.clear();}
 });
}
