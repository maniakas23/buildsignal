# BUILDSIGNAL V301 REPRODUCIBILITY REPORT (Phase 10)

**Date:** 2026-08-21 · Performed on a COPY. Artifact never touched. **No deploy performed.**

| Check | Tool | Result |
|---|---|---|
| Byte integrity of copy | SHA-256 | identical (235,691 chars) |
| ES module syntax | `node --check` | ✅ PASS |
| Bundle parse/link | `esbuild --bundle --format=esm --platform=neutral` | ✅ PASS (rebundled 235,915 bytes; delta is re-emission of already-bundled input + appended dead code) |
| Deploy | — | ❌ NOT PERFORMED (forbidden) |

Caveats: (1) artifact is the deployed bundle, not original TypeScript — no upstream source exists (core drift finding); (2) dead code after the sourcemap comment parses cleanly and is unreachable — left untouched; (3) byte-identical redeploy would reproduce production but is forbidden and untested by design.

**Verdict: STATIC REPRODUCIBILITY CONFIRMED** — syntactically valid, self-contained, bundle-clean. Runtime reproducibility by identity (it IS the running bytes).
