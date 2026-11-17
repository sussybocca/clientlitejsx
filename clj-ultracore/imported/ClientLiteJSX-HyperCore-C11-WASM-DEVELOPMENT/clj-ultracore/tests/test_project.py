from pathlib import Path
import tempfile,subprocess,os,time
base=Path(__file__).resolve().parents[1]
exe=base/'bin/clj-hyper-build'
assert exe.exists()
with tempfile.TemporaryDirectory() as temp:
    project=Path(temp)/'src';project.mkdir();out=Path(temp)/'out'
    (project/'a.clj').write_text('// clj-dep: b.clj\n:"R-CJS:Canvas:\n    :"Render"""TXT HW"""\n')
    (project/'b.clj').write_text(':"R-CJS:Canvas:\n    :"Render"""TXT HW"""\n')
    def run(ok=True):
        r=subprocess.run([str(exe),str(project),str(out)],text=True,capture_output=True)
        if ok:assert r.returncode==0,(r.stdout,r.stderr)
        else:assert r.returncode!=0,(r.stdout,r.stderr)
        return r.stdout
    assert '2 compiled' in run()
    file=out/'a.mjs';assert file.exists();original=file.read_bytes();mtime=file.stat().st_mtime_ns
    assert '0 compiled' in run() and file.stat().st_mtime_ns==mtime
    (project/'b.clj').write_text(':"R-CJS:Canvas:\n    :"Render"""BTN CLICK"""\n')
    assert '2 compiled' in run()  # dependency-aware invalidation
    assert file.read_bytes()==original # equivalent output, no invented differences
    (project/'b.clj').write_text('INVALID CLJ !!!')
    run(False)
    assert (out/'b.mjs').exists()
    (project/'a.clj').write_text(':"R-CJS:Canvas:\n    :"Render"""TXT HW"""\n')
    (project/'b.clj').unlink()
    assert '1 compiled' in run()
    assert not (out/'b.mjs').exists()
    (project/'a.clj').write_text('// clj-dep: ../../etc/passwd\n:"R-CJS:Canvas:\n    :"Render"""TXT HW"""\n')
    run(False)
print('PASS HyperProject: content-addressed builds, cache reuse, recursive invalidation, failure safety, deleted output cleanup, unsafe dependency rejection')
