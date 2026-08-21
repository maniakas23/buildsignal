# WAVE 1 — CHARLOTTE / CARY GATE RECONFIRMATION — Phase 20

Date: 2026-08-21. Read-only rechecks only. Both remain **GATED — NOT DEPLOYED**.

## Charlotte (recheck)
- Prior sprint egress canary failed 0/6.
- Read-only recheck this session: Charlotte ArcGIS endpoints still failing
  (gis.charlottenc.gov query: no response body within timeout; ODP rezonings service:
  HTTP 400 "Invalid URL").
- No Charlotte provider config in the deployed worker (verified: WAVE1_PROVIDER_CONFIG
  contains only the 9 approved Wave 1A/1B providers).
- No Charlotte schedule rows in provider_polling_schedule (verified by full-table dump).
- **Charlotte remains GATED. Do not deploy until the egress canary passes.**

## Cary (recheck)
- Town of Cary open-data portal reachable (catalog API: 79 datasets; ArcGIS hub services
  listing responds) — unchanged from prior sprint's hub-only finding (65 records,
  hub-level only, not approved for this wave).
- No Cary provider config deployed; no Cary schedule rows.
- **Cary remains GATED (not part of approved Wave 1A/1B).**

## Deployment-scope attestation
Deployed surface contains exactly: 6 Durham + 1 SCDOT + 2 NCDOT provider configs,
shadow-table write path, normalization mappings, observability patch, and the
placeholder fix. No Charlotte/Cary code or data anywhere in the deployment.
