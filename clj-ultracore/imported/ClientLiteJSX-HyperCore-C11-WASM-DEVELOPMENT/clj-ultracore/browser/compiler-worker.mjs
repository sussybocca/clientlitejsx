/* Optional one-worker CLJ compilation. The C WASM compiler remains isolated from
 * the UI thread. No eval, Function, or server-side compilation is used. */
import {loadCJS18} from './compiler-loader.mjs';
let compilerPromise;
self.onmessage=async(event)=>{
 const {id,source,stats}=event.data??{};
 if(!Number.isSafeInteger(id))return;
 try{
  compilerPromise??=loadCJS18();
  const compiler=await compilerPromise;
  const javascript=compiler.compile(source);
  self.postMessage({id,ok:true,javascript,stats:stats?compiler.stats():undefined});
 }catch(error){self.postMessage({id,ok:false,error:String(error?.message??error)});}
};
