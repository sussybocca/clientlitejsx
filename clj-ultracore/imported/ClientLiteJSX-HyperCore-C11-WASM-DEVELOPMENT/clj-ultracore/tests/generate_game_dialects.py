#!/usr/bin/env python3
"""Generate genuine dialect-encoded representations of one typed game program.
The common component semantics are intentionally identical in every fixture.
The compiler MUST parse the generated source; the test validates execution.
"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'examples/games'
DEST.mkdir(parents=True,exist_ok=True)
# command, argument, indentation. Blank = app header/end marker.
steps=[
 ('stash','score <- 0',4),('stash','time <- 60',4),('stash','gameover <- nopez',4),
 ('spit','lookz:',4),('sayz','"Score: " + score',8),('sayz','"Time Left: " + time',8),
 ('tapz','"CLICK ME":',8),('whenz','tapz:',12),('stash','score <- score + 1',16),('flipz','lookz',16),
 ('endz','',12),('whenz','gameover == nopez:',4),('spinzz','every 1000 ms:',8),
 ('stash','time <- time - 1',12),('whenz','time <= 0:',12),('stash','gameover <- yupz',16),
 ('spit','sayz = "GAME OVER. FINAL SCORE: " + score',16),('spit','tapz = "RESTART":',16),
 ('movez','backz',20),('endz','',16),('endz','',12),('endz','',8),('endz','',4)
]
names=['reverse-commands','reversed-jsx','backflow','upside-down','hypercjs','zipshot','ghostwire','lettershatter','arrowspine','mirrormouth','dotpulse','columnritual','fliptag','wiregrind','quotedvault','gridlock','bottomup','fullcircuit']

def shard(s):return '{"'+ '"'.join(s.upper())+'"}'

def arrow(s):return '['+'>'.join(s.upper())+']'
def mirror(s):return '⟪'+'|'.join(reversed(s.upper()))+'⟫'
def dotted(s):return '.'+'.'.join(s.upper())+'.'
def vert(s,indent):
 sp=' '*indent
 return sp+'@'+s[0].upper()+''.join('\n'+' '*(indent+1)+c.upper() for c in s[1:])+'\n'+sp+'='
for i,name in enumerate(names,1):
 if i==11:continue # The exact user-submitted program is kept unmodified.
 if i==1:header=':"R-CJS:Canvas:';footer=''
 elif i==2:header='<:Canvas';footer='</:Canvas>'
 elif i==3:header='R-CJS : Canvas';footer=''
 elif i==4:header='// backwards structural root\n';footer=':"END:Canvas'
 elif i==5:header=':"R-CJS:Canvas:\n// cjs-dialect:hypercjs';footer=''
 elif i==6:header=':"padz:';footer=''
 elif i==7:header='#root <~ padz <~ spit';footer=''
 elif i==8:header=shard('padz')+':';footer=''
 elif i==9:header=arrow('padz')+' => {';footer='}'
 elif i==10:header=mirror('padz');footer=''
 elif i==12:header=vert('padz',0).replace('=',' :',1);footer=''
 elif i==13:header='<:padz>';footer='</:padz>'
 elif i==14:header='padz <~ spit <~ sayz';footer=''
 elif i==15:header='"padz" >> (';footer=')'
 elif i==16:header='padz::';footer='::endz'
 elif i==17:header='// upside-down CJS declarations';footer='::finish padz'
 else:header='padz! #root';footer='endz'
 lines=[header]
 row=0
 for cmd,arg,indent in steps:
  if cmd=='endz':
   if i==2:line='</:endz>'
   elif i==4:line=':"endz'
   elif i==9:line='endz'
   elif i==16:line='::endz'
   else:line='endz'
   lines.append(' '*indent+line);continue
  if i in (1,4,5,6):line=':"'+cmd+'"""'+arg+'"""'
  elif i==2:line='<:'+cmd+'> '+arg
  elif i in (3,7,14):line=cmd+' <~ '+arg
  elif i==8:line=shard(cmd)+' : '+arg
  elif i==9:line=arrow(cmd)+' : '+arg
  elif i==10:line=mirror(cmd)+' ← '+arg
  elif i==12:
   if cmd in ('stash','whenz','spinzz','tapz'):
    line=vert(cmd,indent).lstrip(' ')+ ' '+arg
   else:line=cmd+' = '+arg
  elif i==13:line='<:'+cmd+'> '+arg
  elif i==15:line='"'+cmd+'" : '+arg+';'
  elif i==16:
   row+=1
   # ensure vertical separators align for variable command lengths; rich.c extracts the value between pipes.
   line=f'| {row:02d} | {cmd:<8} | {arg:<50} |'
  else:line=cmd+' = '+arg
  lines.append(' '*indent+line)
 if footer:lines.append(footer)
 (DEST/f'{i:02d}-{name}.clj').write_text('\n'.join(lines)+'\n')
print('Generated 17 dialect game representations plus exact user DOTPULSE source')
