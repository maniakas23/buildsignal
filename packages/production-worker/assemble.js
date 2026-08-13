#!/usr/bin/env node
/**
 * BuildSignal Worker Assembler
 * Concatenates part1 + part2 into a single deployable ES module
 */

const fs = require("fs");
const path = require("path");

const part1 = fs.readFileSync(path.join(__dirname, "buildsignal-worker-v1.5.0.part1.js"), "utf-8");
const part2 = fs.readFileSync(path.join(__dirname, "buildsignal-worker-v1.5.0.part2.js"), "utf-8");

// Remove duplicate export default from part2 and merge
const part2Clean = part2
  .replace(/export\s+default\s*\{[^}]*\};?\s*$/, "")
  .trim();

// Remove duplicate helper definitions that exist in both parts
const part1Lines = part1.split("\n");
const part2Lines = part2Clean.split("\n");

// Find where part1's export default starts
let exportDefaultIndex = part1Lines.findIndex(l => l.trim().startsWith("export default"));
if (exportDefaultIndex === -1) exportDefaultIndex = part1Lines.length;

// Combine: part1 up to export default, part2 functions, then merged export default
const combined = [
  ...part1Lines.slice(0, exportDefaultIndex),
  "",
  part2Clean,
  "",
  "export default {",
  "  async fetch(request, env, ctx) {",
  "    return handleRequest(request, env);",
  "  },",
  "  async scheduled(event, env, ctx) {",
  "    const db = env.DB;",
  "    await runIngestion(db, env);",
  "    await runNormalization(db, env);",
  "    await runWakeCountyIngestion(db, env);",
  "    await runPatternDetection(db, env);",
  "    await runIntelligence(db, env);",
  "    await runStaleCheck(db, env);",
  "  },",
  "};",
].join("\n");

console.log(combined);
