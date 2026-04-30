# ClientLite JSX Framework License (CLJ-L)
## Version 1.0.0 — Copyright © 2026 sussybocca

---

## Preamble

This license governs the use, modification, and distribution of the ClientLite JSX Framework ("CLJ" or "the Software"), located at https://github.com/sussybocca/clientlitejsx/tree/CLJ.

By using, copying, or distributing any part of this Software, you agree to all terms and conditions of this license.

---

## 1. Definitions

- **"The Software"** — The complete ClientLite JSX Framework codebase.
- **"Developer"** — sussybocca, the original creator and maintainer.
- **"compiler.js"** — The core compiler module (`lib/compiler.js`) and all associated compiler files.
- **"power.js"** — The UI transform engine module (`lib/power.js`).
- **"Other Components"** — All remaining files in the Software not specifically named above.
- **"Override"** — A locally modified version of a file that takes precedence over the original.
- **"Private Repository"** — A source code repository not accessible to the general public.

---

## 2. General Use

The Software is **free to use** for personal, educational, and commercial purposes. No payment or royalty is required.

---

## 3. power.js — Permissive Distribution

`power.js` is licensed under the following terms:

### 3.1 Allowed
- ✅ Copy, modify, and distribute `power.js` freely.
- ✅ Include in **public repositories**.
- ✅ Include in **private repositories**.
- ✅ Share with coworkers, collaborators, or any third party.
- ✅ Use in commercial products.

### 3.2 Requirements
- 📎 You **must** provide clear attribution to **sussybocca**.
- 📎 You **must** include a link to the original repository: `https://github.com/sussybocca/clientlitejsx/tree/CLJ`.
- 📎 Attribution must be visible in your project's README, license file, or source code comments.

**Example attribution:**
This project uses power.js from ClientLite JSX by sussybocca
(https://github.com/sussybocca/clientlitejsx/tree/CLJ)

text

---

## 4. compiler.js — Restricted Distribution

`compiler.js` is licensed under the following terms:

### 4.1 Allowed
- ✅ Use privately in any project.
- ✅ Store in **private repositories only**.
- ✅ Modify for private use.

### 4.2 Prohibited
- ❌ **May NOT be included in public repositories.**
- ❌ **May NOT be publicly distributed or displayed.**
- ❌ **May NOT be copied or redistributed** in any form that is accessible to the general public.
- ❌ **May NOT be shared** with anyone other than authorized developers of your project.

### 4.3 Exception
- The Developer (sussybocca) may view or access compiler.js in any context as the original author.

---

## 5. Other Components — Restricted Use

All other files in the Software (excluding `power.js` and `compiler.js`) are subject to the following:

### 5.1 Prohibited
- ❌ **May NOT be copied.**
- ❌ **May NOT be redistributed.**
- ❌ **May NOT be included in any other project**, public or private.

### 5.2 Exception — Overrides
You may create and use **overrides** of Other Components under the following conditions:

1. **License Declaration Required** — You must create a license or notice file stating:
   - Which component(s) you have overridden.
   - The command used to perform the override.
   - Explicit acknowledgment that the override is permitted under the CLJ-L license.

   **Example override notice:**
OVERRIDE NOTICE
File: server.js
Command: clj lib-swap on
This file is a modified override permitted under CLJ-L v1.0.0
Original: https://github.com/sussybocca/clientlitejsx/tree/CLJ

text

2. **Modifications Required** — You may NOT copy code verbatim. Overridden files **must contain visible, meaningful modifications** to the original code.

3. **Transparency Required** — The complete overridden file(s) must be viewable/inspectable (not obfuscated or minified beyond recognition).

4. **No Redistribution** — Overrides are for your local use only and may not be redistributed as part of another project or framework.

---

## 6. False Declarations

Falsely claiming permission or providing incorrect override declarations is a violation of this license. While the Developer may not immediately detect all violations, such actions constitute a breach of terms and may result in:

- Revocation of usage rights.
- Public notice of violation.
- Legal remedies as permitted by applicable law.

---

## 7. Termination

Any violation of this license automatically terminates your rights to use, copy, modify, or distribute the Software. Upon termination, you must destroy all copies of the Software in your possession.

---

## 8. Disclaimer of Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE DEVELOPER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY ARISING FROM THE USE OF THE SOFTWARE.

---

## 9. Contact & Repository

- **Developer:** sussybocca
- **Repository:** https://github.com/sussybocca/clientlitejsx/tree/CLJ
- **License Version:** 1.0.0

---

## Quick Reference

| Component | Use | Copy | Modify | Public Repo | Private Repo | Share | Redistribute |
|-----------|-----|------|--------|-------------|--------------|-------|--------------|
| power.js | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| compiler.js | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Other Files | ✅ | ❌ | ✅* | ❌ | ✅* | ❌ | ❌ |

*\*Only via override with license declaration and visible modifications.*

---

*End of License*
