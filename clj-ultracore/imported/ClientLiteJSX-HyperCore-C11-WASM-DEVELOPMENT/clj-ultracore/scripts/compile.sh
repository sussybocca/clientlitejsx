#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if [ "$#" -ne 2 ]; then echo 'Usage: ./scripts/compile.sh INPUT.clj OUTPUT.mjs' >&2; exit 2; fi
[ -x "$ROOT/bin/cjs18" ] || sh "$ROOT/scripts/build.sh"
exec "$ROOT/bin/cjs18" compile "$1" "$2"
