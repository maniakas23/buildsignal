# Wave 1 shadow candidate build

`candidate-v302-shadow.js` — recovered v301 artifact + 17 additive patches
(Wave 1A/1B provider configs, normalization mappings, shadow-table eligibility routing,
geometry guard). SHA-256: 04ea7c52322a059834dd7afb5896d2a693985a92efbfc33e4c4d11f4a094c588
241,071 bytes. Full drift audit: WAVE1_SOURCE_DRIFT_AUDIT.md in the sprint output bundle.
Deployed to production in SHADOW mode on 2026-08-21 under the Wave 1A/1B production shadow
certification sprint. Rollback = redeploy the byte-exact v301 artifact from
`packages/production-worker-v301/parts/` (verified assemble.js path).
