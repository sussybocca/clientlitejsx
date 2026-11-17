# Optional CLJ source ZIP imports

Upload or commit a `.zip` file directly into this directory on the `CLJ` branch. The [CLJ Import Release ZIP](../../../.github/workflows/clj-import-zip.yml) GitHub Action validates it, rejects unsafe archive paths and symlinks, and extracts files into `clj-ultracore/imported/<archive-name>/`.

**This importer never executes archive contents and does not overwrite the published `clj-ultracore/src/` compiler.** It is for future source archives; it does not turn an arbitrary uploaded ZIP into a trusted compiler release.

You can also use Actions → CLJ Import Release ZIP → Run workflow and enter a committed path such as `clj-ultracore/releases/archives/source-v1.zip`.

Limits: up to 25 MiB compressed, 100 MiB uncompressed, and 1,000 entries. Check the extracted files and GitHub Actions result before depending on them.
