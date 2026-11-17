# CLJ portability and compatibility

The `cjs18-compiler.wasm` **is the compiler**, not a general-purpose executable package for arbitrary JavaScript. The browser still uses JavaScript for DOM rendering and browser APIs.

Supported in this release: 18 supplied dialect forms, five keyword encodings, native C/WASM parity for the included games, typed state/booleans/arithmetic, click events, nested conditionals, timer loops, reset/dispose, and CLJ-owned CSS presentation subset.

Not claimed: full JSX/TSX parity, arbitrary `async`/fetch/WebSocket app code, arbitrary HTML hierarchy, native recompilation of the OPEN backend, 80–90% general language completeness, or performance superiority to all JS compilers.

Original CLJ/OPEN functionality is preserved in the existing repository. No authenticated edit permissions are granted by CLJ compile output.
