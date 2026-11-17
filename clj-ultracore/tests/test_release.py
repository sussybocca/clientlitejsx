#!/usr/bin/env python3
"""Release-level compiler and safety tests, no Node dependency."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess, os, zipfile, sys
here=Path(__file__).resolve().parents[1]
exe=here/'bin/cjs18'
assert exe.is_file()
assert (here/'browser/cjs18-compiler.wasm').read_bytes()[:4]==b'\x00asm'
assert (here/'browser/cjs18-compiler.wasm').read_bytes()==(here/'cjs18-compiler.wasm').read_bytes()
checks=0
with TemporaryDirectory() as tmp:
    tmp=Path(tmp)
    for folder,expected in [('examples',18),('examples/games',18),('examples/ui',16),('examples/encodings',5),('examples/compact',3)]:
        source=here/folder
        files=[p for p in source.glob('*.clj') if not (folder=='examples/games' and p.name.startswith('score-timer'))]
        assert len(files)>=expected,(folder,len(files))
        for idx,file in enumerate(files):
            result=subprocess.run([str(exe),'compile',str(file),str(tmp/f'out{checks}.mjs')],text=True,capture_output=True)
            assert result.returncode==0,(file,result.stderr)
            data=(tmp/f'out{checks}.mjs').read_text()
            assert 'mountCJS18' in data or 'OPEN.LiveSource' in data,file
            checks+=1
    ui=here/'examples/ui/neon-score-arena.clj'
    out=tmp/'ui.mjs';subprocess.run([str(exe),'compile',str(ui),str(out)],check=True,capture_output=True)
    result=out.read_text()
    assert 'applyDesign' in result and 'linear-gradient' in result and 'h1' in result
    assert 'Score: ' in result and 'setInterval' in result and 'CLICK ME' in result
    checks+=1
    invalid=['stylez = padz <- "width:1px;position:fixed;behavior:url(javascript:bad)"',
             'stylez = padz <- "background:url(http://bad.example/)"',
             'stylez = padz <- "made-up-property:stuff"']
    for rule in invalid:
        f=tmp/'bad.clj';f.write_text('padz! #root\nstash score <- 0\n'+rule+'\nsayz = score')
        dest=tmp/'protected.mjs';dest.write_text('PRESERVE')
        run=subprocess.run([str(exe),'compile',str(f),str(dest)],capture_output=True,text=True)
        assert run.returncode!=0,run.stdout+run.stderr
        assert dest.read_text()=='PRESERVE'
        checks+=1
print('PASS CLJ release native assertions:',checks)
