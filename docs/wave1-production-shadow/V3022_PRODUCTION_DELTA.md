# v302.2 production delta (deployed 2026-08-21, deployment b4fd36f3408845faaf230cfc120988d0)
# Base: candidates/parts/candidate.part00-24.js (v302-shadow, sha256 04ea7c52...c588)
# Final deployed build: 241,342 bytes, sha256 e0dcb19ae7af3769e713fa6ea9c883eb3044fa1768c16f0a23a563e27a68b3e6
#
# Patch A (observability, v302.1): in executeIngestionRun normalization catch block,
# after `console.error("Normalization error:", normErr);` insert:
#   try {
#     await d1Run(db, `UPDATE ingestion_runs SET error = ?, errorDetails = ? WHERE id = ?`, [String(normErr && normErr.message || normErr).slice(0, 400), String(normErr && normErr.stack || "").slice(0, 900), runId]);
#   } catch (e2) {
#   }
#
# Patch B (pre-existing v301 defect fix, v302.2): canonical INSERT statement
# `INSERT INTO ${targetTable} (...23 columns...) VALUES (?, ...22..., ?)` had only
# 22 placeholders for 23 columns/values. Add one placeholder -> 23 total.
# This defect existed in v301 and silently blocked ALL normalization in production.
