#!/usr/bin/env python3
"""Safely unpack a committed CLJ source ZIP into an isolated repo subdirectory.
Never executes archive contents; explicit allowlist and uncompressed byte limit.
"""
import argparse, re, sys, zipfile
from pathlib import Path, PurePosixPath

def extract(archive: Path, destination: Path):
    if not archive.is_file() or archive.suffix.lower() != '.zip':
        raise ValueError('Archive must be an existing .zip')
    if archive.stat().st_size > 25 * 1024 * 1024:
        raise ValueError('Compressed ZIP exceeds 25 MiB')
    with zipfile.ZipFile(archive) as z:
        entries = z.infolist()
        if len(entries) > 1000: raise ValueError('Too many archive entries')
        if sum(i.file_size for i in entries) > 100 * 1024 * 1024:
            raise ValueError('Uncompressed archive exceeds 100 MiB')
        checked=[]
        for info in entries:
            raw=info.filename
            path=PurePosixPath(raw)
            if (not raw or '\x00' in raw or '\\' in raw or raw.startswith('/')
                or not path.parts or any(part in ('..','.','') for part in path.parts)
                or re.match(r'^[A-Za-z]:',raw)):
                raise ValueError('Unsafe ZIP path: '+raw)
            mode=(info.external_attr >> 16) & 0o170000
            if mode == 0o120000: raise ValueError('ZIP symlink rejected: '+raw)
            if mode not in (0,0o100000,0o040000): raise ValueError('Unsupported archive entry: '+raw)
            checked.append((info, path))
        destination.mkdir(parents=True, exist_ok=True)
        base=destination.resolve()
        for info, path in checked:
            target=destination.joinpath(*path.parts)
            if not target.resolve().is_relative_to(base):
                raise ValueError('ZIP escape detected: '+info.filename)
            if info.is_dir():target.mkdir(parents=True, exist_ok=True);continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with z.open(info) as src, target.open('wb') as dst:
                remaining=info.file_size
                while remaining:
                    block=src.read(min(1024*1024,remaining))
                    if not block:raise ValueError('Truncated entry: '+info.filename)
                    dst.write(block);remaining-=len(block)
    return len(checked)

if __name__ == '__main__':
    p=argparse.ArgumentParser();p.add_argument('zip');p.add_argument('destination');args=p.parse_args()
    try:
        n=extract(Path(args.zip),Path(args.destination));print('Extracted',n,'entries safely')
    except Exception as e:
        print('CLJ ZIP extraction rejected:',e,file=sys.stderr);sys.exit(1)
