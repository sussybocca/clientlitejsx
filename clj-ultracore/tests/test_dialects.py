#!/usr/bin/env python3
"""CJS18 native parser, full 18-fixture parity, WASM, and fail-safe tests."""
from pathlib import Path
import subprocess,json,tempfile,sys,os,re
here=Path(__file__).resolve().parents[1]
openroot=here.parents[3]
binary=here/'bin/cjs18'
core=here.parent/'build/cjs-native'
allnames=['reverse-commands','reversed-jsx','backflow','upside-down','hypercjs','zipshot','ghostwire','lettershatter','arrowspine','mirrormouth','dotpulse','columnritual','fliptag','wiregrind','quotedvault','gridlock','bottomup','fullcircuit']
count=0
def check(cond,label):
 global count
 if not cond:raise AssertionError(label)
 count+=1

def run(*cmd,check_success=True,**kw):
 r=subprocess.run([str(x) for x in cmd],text=True,capture_output=True,**kw)
 if check_success and r.returncode:raise AssertionError((cmd,r.returncode,r.stdout,r.stderr))
 return r

assert binary.exists()
assert core.exists()
with tempfile.TemporaryDirectory() as tmp:
 tmp=Path(tmp)
 results=[]
 for i,dialect in enumerate(allnames,1):
  source=here/'examples'/f'{i:02}.clj'
  check(source.exists(),f'{i} fixture present')
  check(run(binary,'detect',source).stdout.strip()==dialect,f'{i}: dialect autodetection')
  destination=tmp/f'{i:02}.mjs'
  run(binary,'compile',source,destination)
  check(destination.exists() and destination.stat().st_size>100,f'{i}: C11 compilation')
  result=run('node','--input-type=module','-e',f"import {{CJS18}} from {json.dumps(destination.as_uri())}; console.log(JSON.stringify(CJS18))")
  obj=json.loads(result.stdout)
  check(obj['component']=='OPEN.LiveSource' and obj['target']=='#open-live-widget',f'{i}: preserved target')
  check(obj['security']=='OPEN.Trusted' and obj['history']==30 and obj['draggable'],f'{i}: widget policies')
  check(obj['actions']==['edit','remix','unpublish','restore','revision','reload'],f'{i}: actions')
  check(len(obj['confirm'])==2 and obj['editor']=='SourceGrid' and obj['realtime']=='PageForge.WS',f'{i}: history/editor/events')
  results.append(obj)
  native=tmp/f'{i:02}-core.mjs'
  run(core,'clj',source,native)
  check(native.read_bytes()==destination.read_bytes(),f'{i}: integrated native CLJ parity')
 for item in results[1:]:
  data=dict(item);data.pop('dialect')
  base=dict(results[0]);base.pop('dialect')
  check(data==base,'all dialects share identical observable component config')
 # CJS source ambiguity must not harm traditional JS dialect.
 legacy=here.parent/'examples/native-custom-cjs/src/App.clj'
 if legacy.exists():
  check(run(binary,'detect',legacy).stdout.strip()=='unknown','legacy source is never misclassified')
 # Fail-closed output safety; invalid source must not destroy an earlier build.
 cases={
 'shards':'{"P"A"D"Z}:\n {"S"P"I"T}"""livz #open-live-widget"""',
 'mirror':'⟪Z|D|A|P⟪\n ⟪T|I|P|S⟫ ← livz',
 'vertical':'@P\n A\n   D\n Z\n:\n  @S\n   P\n   I\n   T\n  :',
 'fliptag':'<:padz><:livz></:padz>',
 'gridlock':'padz::\n| 03 | spit | livz |\n::endz',
 'unknown':'this is not CJS code'
 }
 for label,source in cases.items():
  bad=tmp/(label+'.clj');bad.write_text(source)
  preserved=tmp/'preserve.mjs';preserved.write_text('SAFE OUTPUT')
  r=run(binary,'compile',bad,preserved,check_success=False)
  check(r.returncode!=0,f'{label}: invalid source rejected')
  check(preserved.read_text()=='SAFE OUTPUT',f'{label}: existing output preserved')
 # Actual standalone C11-generated app UI.
 hello=tmp/'hello.clj';hello.write_text(':"R-CJS:Canvas:\n    :"Render"""TXT HW"""')
 counter=tmp/'counter.clj';counter.write_text(':"R-CJS:Canvas:\n    :"State"""Score <- 0"""\n    :"Render"""BTN Add Score"""\n    :"Action"""Add Score -> Score += 1"""\n    :"Render"""TXT Score"""')
 for source in (hello,counter):
  js=tmp/(source.stem+'.mjs');run(binary,'compile',source,js)
  check(run('node','--check',js).returncode==0,source.stem+' generated JS checks')
  check('document.createElement' in js.read_text(),source.stem+' generates real DOM program')
 # Five independent encoded-keyword spellings compile to the same live CJS IR.
 encodings=[
  ':{unused}',
  '{"S"T"A"S"H"}',
  '[S>T>A>S>H]',
  '⟪H|S|A|T|S⟫',
  '.S.T.A.S.H.',
  '@S\n T\n A\n S\n H'
 ]
 outputs=[]
 for i,keyword in enumerate(encodings[1:],1):
  assign=':' if i==1 else ':' if i==2 else ' ← ' if i==3 else ' = ' if i==4 else '\n='
  source=':"R-CJS:Canvas:\n'+keyword+assign+' Clicks <- 7\n    :"spit"""tapz Tap Here"""\n    :"movez"""Tap Here -> Clicks += 3"""\n    :"spit"""sayz Clicks"""'
  if i==1:source=source.replace(keyword+assign+' Clicks <- 7',keyword+'"""Clicks <- 7"""')
  file=tmp/f'encoding-{i}.clj';file.write_text(source)
  out=tmp/f'encoding-{i}.mjs'
  run(binary,'compile',file,out)
  result=run('node','--input-type=module','-e',f"import {{CJS_UI}} from {json.dumps(out.as_uri())};console.log(JSON.stringify(CJS_UI))")
  cfg=json.loads(result.stdout)
  check(cfg['states']==[['Clicks',7]],'encoded keyword creates custom state')
  check(cfg['actions']==[{'trigger':'Tap Here','state':'Clicks','delta':3}],'encoded keyword creates custom action')
  check(cfg['elements'][-1]['bind']=='Clicks','automatic display binding')
  outputs.append(cfg)
 check(all(item==outputs[0] for item in outputs),'all five keyword encodings produce the same typed UI AST')
 # The browser-facing frontend MUST be freestanding C WASM, and compile exactly
 # the same generated source as the Linux C11 executable.
 js_script=here/'tests/wasm_equivalence.mjs'
 run('node',js_script,here,tmp)
 check(True,'18 WebAssembly output equivalence checks executed')
print(f'PASS CJS18: {count} native assertions plus 18 WASM/native byte comparisons')
