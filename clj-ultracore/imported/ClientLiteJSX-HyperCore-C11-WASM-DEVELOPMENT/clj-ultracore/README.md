# ClientLiteJSX (CLJ) — UltraCore 18-Dialect Compiler

**Native C11 + browser WebAssembly · 18 source dialects · 5 letter encodings · 3 ultra-compact variants**

This directory is the standalone, **Node.js-free compiler and browser Studio** for the supported subset of CLJ. The public project name is **ClientLiteJSX (CLJ)**. It preserves the original ClientLiteJSX repository; this release is an additive compiler package, not a replacement for all historical CLJ functionality.

> **Scope, not hype:** The included `cjs18-compiler.wasm` really compiles the provided 18 dialect fixtures, the 18 score/timer games, and the CLJ-authored styled UIs. It is **not** a full general-purpose JSX/TSX/JavaScript compiler. The actual OPEN authenticated LiveSource backend and existing legacy CLJ features remain separate. WASM here runs the C compiler **inside the browser** and produces browser JS; it does not turn arbitrary CLJ programs into executable WASM application binaries.


## HyperCore v0.3 — memory, compiler, and browser speed expansion

This ZIP now includes an original C11 pooled allocator, reusable large-block free lists, arenas, explicit-root incremental generational GC, an exact-input WASM compilation cache, a native incremental project builder, streaming WASM loading, optional worker compilation, native/WASM memory tests, and generated UI DOM reuse. **Read [`docs/HYPERCORE.md`](docs/HYPERCORE.md) for exact capabilities, new commands, limits, and how to build the `.wasm` file from C.**

- [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md): implemented vs partially supported vs future research features.
- [`docs/BENCHMARKS.md`](docs/BENCHMARKS.md): measured baseline comparisons with limitations.
- [`docs/RELEASE_NOTES.md`](docs/RELEASE_NOTES.md): precise source changes and tests.

**Release gate:** This remains a **verified development build**, not an 80–90%+ completion certificate for every research feature. All old CLJ examples and functionality in this standalone release are retained; the legacy CLJ/OPEN backend is not replaced.

## Fastest way to try it

1. Download/clone this repository and enter `clj-ultracore`.
2. Run `python3 -m http.server 8000 --bind 127.0.0.1` or `sh scripts/serve.sh 8000`.
3. Open **http://127.0.0.1:8000/browser/index.html** in Firefox/Chrome.
4. Select one of the 18 dialects and press **COMPILE CJS**. Choose **Score + 60s Game** to see the identical game across dialects, or **Styled CLJ Game** to try 16 custom layouts written in CLJ.
5. The page loads `browser/cjs18-compiler.wasm` and compiles **locally, without Node.js, npm, Babel, or a compilation server**. The preview iframe is isolated (`sandbox="allow-scripts"`).

Serve via HTTP, not `file://`, because browser ES modules and WASM fetches are commonly restricted on file URLs.

## Compile a `.clj` program on Ubuntu

```sh
sudo apt install build-essential clang lld python3
sh scripts/build.sh
./bin/cjs18 detect examples/games/11-dotpulse.clj
./bin/cjs18 compile examples/games/11-dotpulse.clj /tmp/game.mjs
./bin/cjs18 check examples/games/11-dotpulse.clj
```

**CLI syntax:** `cjs18 detect INPUT.clj`, `cjs18 compile INPUT.clj OUTPUT.mjs`, `cjs18 check INPUT.clj`, or `cjs18 version`.

The C11 sources are in `src/`. `sh scripts/build.sh` creates `bin/cjs18`, `browser/cjs18-compiler.wasm` and `cjs18-compiler.wasm`. Compiling the compiler from C uses Clang's `--target=wasm32`; **running the prebuilt WASM requires only a browser with WebAssembly support**.

## Embed CLJ compilation in an HTML page

```html
<!doctype html>
<html lang="en"><meta charset="utf-8">
<body>
  <main id="root"></main>
  <script type="module">
    import {loadCJS18} from './browser/compiler-loader.mjs';
    const compiler = await loadCJS18();
    const source = ':"R-CJS:Canvas:\n    :"Render"""TXT HW"""';
    const generated = compiler.compile(source);
    // To execute generated code, import it as a module in an isolated,
    // explicitly controlled preview; do NOT give untrusted code privileged DOM access.
    console.log(generated);
  </script>
</body></html>
```

For a complete **precompiled** browser page, see `examples/ui/standalone/index.html`. All generated modules export `mountCJS18(root)` for supported UI programs.

## Make your own game UI *in CLJ*

This release adds **CLJ-authored UI styling**, rather than forcing the generic white paragraphs/buttons from the earlier prototype. Use `stylez` (or dotted `.S.T.Y.L.E.Z.`) to style `padz` (canvas), `headz` (heading), `sayz` (text), and `tapz` (buttons). Each declaration uses `target <- "CSS-property:value;..."`. Styles compile into DOM `style.setProperty` calls; no `innerHTML` or `eval` is used.

```cjs
.P.A.D.Z.:
    .S.T.Y.L.E.Z. = padz <- "background:#10152e;color:#efffff;padding:32px;border-radius:22px;display:grid;gap:12px"
    .S.T.Y.L.E.Z. = headz <- "color:#73f5cc;font-size:34px;font-weight:800"
    .S.T.Y.L.E.Z. = tapz <- "background:#73f5cc;color:#10152e;padding:16px;border-radius:12px;cursor:pointer"
    .S.P.I.T. = .H.E.A.D.Z. = "NEON SCORE ARENA"
    .S.T.A.S.H. = .S.C.O.R.E. <- 0
    .S.P.I.T. = .S.A.Y.Z. = "Score: " + .S.C.O.R.E.
    .T.A.P.Z. = "CLICK ME":
        .W.H.E.N.Z. = .T.A.P.Z.:
            .S.T.A.S.H. = .S.C.O.R.E. <- .S.C.O.R.E. + 1
        .E.N.D.Z.
.E.N.D.Z.
```

See `examples/ui/neon-score-arena.clj` for the **complete** styled timer game and 15 more selectable designs in `examples/ui/`. This initial safe CSS subset accepts selected presentation properties (colors, spacing, typography, layout, border, etc.). Unknown CSS properties and external/executable CSS are rejected instead of silently ignored.

## 18 dialects

| # | Dialect | Example | Category |
|--:|---------|---------|----------|
| 01 | Reverse Commands | `examples/01.clj` | Original |
| 02 | Reversed JSX | `examples/02.clj` | Original |
| 03 | Backflow CJS | `examples/03.clj` | Original |
| 04 | Upside-Down CJS | `examples/04.clj` | Original |
| 05 | HyperCJS | `examples/05.clj` | Original / compact |
| 06 | ZIPSHOT | `examples/06.clj` | 90% target |
| 07 | GHOSTWIRE | `examples/07.clj` | 90% target |
| 08 | LETTERSHATTER | `examples/08.clj` | 90% target |
| 09 | ARROWSPINE | `examples/09.clj` | Encoded words |
| 10 | MIRRORMOUTH | `examples/10.clj` | Encoded words |
| 11 | DOTPULSE | `examples/11.clj` | Encoded words + gameplay |
| 12 | COLUMNRITUAL | `examples/12.clj` | Vertical keywords |
| 13 | FLIPTAG | `examples/13.clj` | Reversed JSX |
| 14 | WIREGRIND | `examples/14.clj` | Reverse dataflow |
| 15 | QUOTEDVAULT | `examples/15.clj` | Quoted commands |
| 16 | GRIDLOCK | `examples/16.clj` | Strict columns |
| 17 | BOTTOMUP | `examples/17.clj` | Bottom-first declarations |
| 18 | FULLCIRCUIT | `examples/18.clj` | Explicit controls |

The `examples/games/` directory has **18 versions of one actual score-and-timer application**. The compiled gameplay behavior is checked for parity, including 60 timer ticks, button clicks, game-over, and restart. `examples/compact/` contains the three most compact presets.

## Five ways to spell a keyword

All five spellings below represent `stash` (state) in their respective contexts:

```text
{"S"T"A"S"H"}      quotation shards
[S>T>A>S>H]        arrow letters
⟪H|S|A|T|S⟫        mirror letters (reversed)
.S.T.A.S.H.        dot stitching
@S                 vertical columns (each letter on its own indented line)
 T
 A
 S
 H
```

Find runnable samples in `examples/encodings/` and `examples/games/`. Classic keywords and aliases such as `padz`, `spit`, `stash`, `tapz`, `movez`, `whenz`, `nopez`, `yupz` can map to the same internal semantics. Exact punctuation/indentation requirements depend on the dialect and are enforced during parsing.

## Tests

```sh
sh scripts/test.sh
```

This builds the native C compiler and WASM, runs the release examples and security checks, tests 18 dialects for equivalent gameplay with Node **only if it is available as an optional test runner**, and compares native C vs WASM compiler output. The compiler and the browser Studio itself **do not require Node**.

## Publishing this on GitHub Pages

Publish the `CLJ` branch (or your chosen site source) through repository **Settings → Pages**. When this folder is served, open `/clj-ultracore/browser/index.html`. The standalone site depends only on static files. Do not assume Pages is enabled until configured in GitHub settings.

## Optional ZIP source upload

You can upload a ZIP under `clj-ultracore/releases/archives/` and push it to the `CLJ` branch. The included GitHub Actions workflow (`.github/workflows/clj-import-zip.yml`) then **safely extracts files into** `clj-ultracore/imported/<archive-name>/` and commits them. It never executes ZIP contents, never blindly overwrites the compiler, rejects symlinks and traversal paths, and caps archive entries/uncompressed size. GitHub Actions must have permission to write contents and workflows must be enabled for this to work.

A ZIP attached to a GitHub Release is **not** the same as a ZIP committed under that directory; this workflow watches committed ZIPs. You can also trigger it manually via Actions → **CLJ Import Release ZIP** and enter a path already committed to the repo.

## Compatibility and security

- This release includes the *language compiler*, Studio, and examples; it does not silently replace the existing CLJ/OPEN backend.
- `livz` / `OPEN.LiveSource` expressions produce descriptors for the trusted OPEN published-page shell. Actual authentication, revisions, and server APIs are not recreated in the standalone browser Studio.
- Browser previews are sandboxed; don't expose privileged origin tokens or cookies to untrusted generated programs.
- CSS rules are validated. Unknown syntax fails closed instead of silently ignoring advanced statements.
- The 70%/90% simplification percentages are **design targets**, not measured benchmarks across arbitrary programs.

## License

Consult the existing repository's `LICENSE.md`. The new release should follow that project's distribution terms; no license is invented here.
