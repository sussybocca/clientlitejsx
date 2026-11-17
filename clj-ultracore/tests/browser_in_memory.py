#!/usr/bin/env python3
"""Browser UI interaction test when navigation to localhost is policy-blocked.
This never changes browser security settings and uses a real wasm32 binary.
"""
import asyncio,base64
from pathlib import Path
from playwright.async_api import async_playwright
home=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'],headless=True)
  page=await b.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  html=(home/'browser/index.html').read_text().replace('<script type="module" src="./studio.mjs"></script>','')
  await page.set_content(html)
  sources={f'{i:02}':(home/'examples'/f'{i:02}.clj').read_text() for i in range(1,19)}
  games={f'{i:02}':next((home/'examples/games').glob(f'{i:02}-*.clj')).read_text() for i in range(1,19)}
  binary=base64.b64encode((home/'browser/cjs18-compiler.wasm').read_bytes()).decode()
  await page.evaluate('''([sourceMap,gameMap,wasm])=>{
   window.fetch=async (resource)=>{
    const path=String(resource);
    if(path.includes('.wasm')){
     const bytes=Uint8Array.from(atob(wasm),c=>c.charCodeAt(0));
     return {ok:true,arrayBuffer:async()=>bytes.buffer};
    }
    const key=/([0-9]{2})(?:-[a-z-]+)?\\.clj/.exec(path)?.[1];
    const mapping=path.includes('/games/')?gameMap:sourceMap;
    return key&&mapping[key]?{ok:true,text:async()=>mapping[key]}:{ok:false,status:404};
   };
  }''',[sources,games,binary])
  loader=(home/'browser/compiler-loader.mjs').read_text().replace('export async function loadCJS18','async function loadCJS18').replace("new URL('./cjs18-compiler.wasm',import.meta.url)","'cjs18-compiler.wasm'")
  loader+='\nwindow.loadCJS18=loadCJS18;'
  await page.evaluate('(script)=>{(0,eval)(script)}',loader)
  studio=(home/'browser/studio.mjs').read_text().replace("import {loadCJS18} from './compiler-loader.mjs';",'const loadCJS18=window.loadCJS18;')
  await page.evaluate('(script)=>{(0,eval)(script)}',studio)
  await page.wait_for_function('document.getElementById("output").value.includes("OPEN.LiveSource")',timeout=3000)
  assert len(await page.locator('#dialect option').all())==18
  assert 'Compiled in WebAssembly' in await page.locator('#status').inner_text()
  for i in range(1,19):
   await page.locator('#dialect').select_option(f'{i:02}')
   await page.wait_for_function('(n)=>document.getElementById("status").textContent.includes("Compiled in WebAssembly")&&document.getElementById("dialect").value===n',arg=f'{i:02}',timeout=4000)
   out=await page.locator('#output').input_value()
   assert 'OPEN.LiveSource' in out,(i,out[:150])
  await page.locator('#hello').click()
  await page.wait_for_function('document.getElementById("output").value.includes("Hello World")')
  await page.locator('#counter').click()
  await page.wait_for_function('document.getElementById("output").value.includes("Add Score")')
  # Check the generated counter's real DOM behavior in a fresh opaque iframe.
  compiled=await page.locator('#output').input_value()
  other=await b.new_page()
  await other.set_content('<iframe id="isolated" sandbox="allow-scripts"></iframe>')
  await other.evaluate('x=>document.getElementById("isolated").srcdoc=x','<!doctype html><div id="root"></div><script type="module">'+compiled+'\nmountCJS18();</script>')
  frame=other.frame_locator('#isolated')
  await frame.locator('button').wait_for(timeout=4000)
  before=await frame.locator('p').inner_text(timeout=4000)
  await frame.locator('button').click(timeout=4000)
  after=await frame.locator('p').inner_text(timeout=4000)
  assert before=='Score: 0' and after=='Score: 1',(before,after)

  # This adds real WebAssembly compilation of 18 independent *typed* games.
  for i in range(1,19):
   await page.locator('#dialect').select_option(f'{i:02}')
   await page.locator('#game').click()
   await page.wait_for_function('document.getElementById("output").value.includes("CJS_ADVANCED")',timeout=4500)
   assert 'GAME OVER' in await page.locator('#output').input_value(),i
  await page.locator('#dialect').select_option('11')
  await page.locator('#game').click()
  await page.wait_for_function('document.getElementById("output").value.includes("CJS_ADVANCED")',timeout=4000)
  game_script=await page.locator('#output').input_value()
  game=await b.new_page()
  await game.set_content('<iframe id="isolated" sandbox="allow-scripts"></iframe>')
  source='''<!doctype html><div id="root"></div><script>window.setInterval=fn=>(window._tick=fn,1);window.clearInterval=()=>{};</script><script type="module">'''+game_script+'''\nmountCJS18();</script>'''
  await game.evaluate('x=>document.getElementById("isolated").srcdoc=x',source)
  gframe=game.frame_locator('#isolated')
  await gframe.get_by_role('button',name='CLICK ME').click(timeout=4500)
  await gframe.get_by_role('button',name='CLICK ME').click(timeout=4500)
  assert await gframe.locator('p').first.inner_text()=='Score: 2'
  await gframe.locator('body').evaluate('()=>{for(let i=0;i<60;i++)window._tick();}')
  assert await gframe.get_by_text('GAME OVER. FINAL SCORE: 2').count()==1
  await gframe.get_by_role('button',name='RESTART').click()
  assert await gframe.locator('p').first.inner_text()=='Score: 0'
  assert await gframe.get_by_text('Time Left: 60').count()==1
  await game.close()

  assert not errors,errors
  print('PASS Browser: 18 presets + 18 typed games through WASM, click, 60 timer ticks, restart, isolated preview')
  await b.close()
asyncio.run(main())
