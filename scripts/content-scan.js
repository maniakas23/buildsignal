#!/usr/bin/env node
/**
 * Content Scan — BuildSignal Emergency Regression Recovery
 *
 * Scans source code for prohibited patterns:
 *   - Beta-language ("Private Beta", "Early Access", "Beta User")
 *   - Fictional customers (fake company names, fake person names, fake ROI claims)
 *   - Unsupported claims ("SOC 2", "ISO 27001", "99.9% SLA", "GDPR Ready")
 *   - Simulated data presented as real (hardcoded metrics, fake counts, $0M claims)
 *
 * Exit code: 0 if clean, 1 if violations found.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const EXTS = [".ts", ".tsx", ".js", ".jsx", ".html", ".toml"];
const SKIP = ["node_modules", "dist", ".git", "archive", "packages/kestovar-engine", "packages/signalcore", "docs", "test-results", "sprints", "scripts", "public-launch-readiness-milestone.md", "product-market-fit-sprint.md"];

const RULES = [
  {
    id: "beta-language",
    patterns: [
      /Private Beta/gi,
      /Early Access/gi,
      /Beta User/gi,
      /Beta Customer/gi,
      /Beta Pricing/gi,
      /Closed Beta/gi,
      /Beta Mode/gi,
      /beta mode/gi,
    ],
    severity: "error",
    help: "Remove all beta language. The product is public. Use 'Released', 'Public', or 'GA' instead.",
  },
  {
    id: "fictional-customer",
    patterns: [
      /Summit Construction/gi,
      /Metro Builders/gi,
      /Allied Contractors/gi,
      /Michael R\.?/gi,
      /Sarah L\.?/gi,
      /David K\.?/gi,
      /"win rate increased\s+\d+%"/gi,
      /ROI was clear within/gi,
      /helped us identify.*\$\d+M/gi,
    ],
    severity: "error",
    help: "Remove all fictional testimonials, names, companies, and ROI claims. Replace with real evidence or generic descriptions.",
  },
  {
    id: "unsupported-claim",
    patterns: [
      /SOC 2\s*(Compliant|Certified)?/gi,
      /ISO 27001\s*(Certified)?/gi,
      /GDPR\s*Ready/gi,
      /99\.9%\s*Uptime\s*SLA/gi,
      /99\.99%\s*Uptime/gi,
      /ISO 27001/gi,
    ],
    severity: "error",
    help: "Remove unsupported certification claims. Only claim what has been formally audited and verified.",
  },
  {
    id: "simulated-data",
    patterns: [
      /\$\d{2,3}K\s*MRR/gi,
      /\$\d{1,3}M\s*ARR/gi,
      /\d{1,3},\d{3}\s*signals\s*processed/gi,
      /\d{1,3},\d{3}\s*events\s*detected/gi,
      /\d{1,3},\d{3}\s*companies\s*(tracked|monitoring)/gi,
      /\d{1,3},\d{3}\s*opportunities\s*identified/gi,
      /\d{1,3}\.\d{1,2}%\s*confidence\s*score/gi,
      /avg response.*\d{1,2}ms/gi,
      /uptime\s*\d{2}\.\d{2}%/gi,
    ],
    severity: "warning",
    help: "Replace hardcoded metrics with live data or clearly label as 'Not yet populated'.",
  },
  {
    id: "pricing-tier",
    patterns: [
      /Starter\s*Plan/gi,
      /Pro\s*Plan/gi,
      /Starter\s*\/\s*Pro/gi,
      /\$49/g,
      /\$149/g,
      /\$199/g,
      /\$499\/(mo|month)/gi,
    ],
    severity: "error",
    help: "Use correct pricing tiers: Scout ($99) / Professional ($249) / Business ($599) / Enterprise (Custom). Remove all references to Starter, Pro, $49, $149, $199, $499.",
    skipFiles: ["wrangler.toml"],
  },
  {
    id: "old-kestovar-domain",
    patterns: [
      /kestovar\.direct/gi,
      /kestovar\.preview/gi,
      /kestovar\.dev/gi,
      /kestovar\.local/gi,
      /kestovar\.test/gi,
    ],
    severity: "error",
    help: "Use canonical Kestovar domain: api.kestovar.buildsignal.com only.",
  },
  {
    id: "placeholder-value",
    patterns: [
      /YOUR_PREVIEW_DATABASE_ID/gi,
      /YOUR_DATABASE_ID/gi,
      /PLACEHOLDER_/gi,
      /TODO:/gi,
      /FIXME:/gi,
      /XXX:/gi,
    ],
    severity: "error",
    help: "Replace all placeholder values with real configuration before deploying. (wrangler.toml preview section is allowed — deploy.sh validates it separately.)",
    skipFiles: ["wrangler.toml"],
  },
  {
    id: "beta-component",
    patterns: [
      /BetaFeedback/gi,
      /BetaWalkthrough/gi,
      /BetaAccessGate/gi,
      /SampleIntelligenceWalkthrough/gi,
      /BetaPricing/gi,
      /EarlyAccessPricing/gi,
    ],
    severity: "error",
    help: "Remove all beta components and references. Use production-ready alternatives.",
  },
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(ROOT, full);
    if (SKIP.some((s) => rel.includes(s))) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (stat.isFile() && EXTS.includes(path.extname(entry))) {
      yield full;
    }
  }
}

let errors = 0;
let warnings = 0;
const findings = [];

for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const rel = path.relative(ROOT, file);
  const basename = path.basename(rel);

  for (const rule of RULES) {
    if (rule.skipFiles && rule.skipFiles.some((sf) => basename.includes(sf))) continue;
    for (const pattern of rule.patterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pattern.test(line)) {
          const finding = {
            rule: rule.id,
            severity: rule.severity,
            file: rel,
            line: i + 1,
            text: line.trim().slice(0, 120),
            help: rule.help,
          };
          findings.push(finding);
          if (rule.severity === "error") errors++;
          else warnings++;
          // Reset lastIndex for global regex
          pattern.lastIndex = 0;
        }
      }
    }
  }
}

// Print findings grouped by rule
for (const rule of RULES) {
  const ruleFindings = findings.filter((f) => f.rule === rule.id);
  if (ruleFindings.length === 0) continue;
  console.log(`\n[${rule.id.toUpperCase()}] ${ruleFindings.length} finding(s) — ${rule.severity}`);
  console.log(`  ${ruleFindings[0].help}`);
  for (const f of ruleFindings) {
    console.log(`  ${f.file}:${f.line}  ${f.text}`);
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`Scan complete: ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  console.log(`RESULT: FAILED — fix errors before deploying.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`RESULT: PASSED (with warnings — review before deploying).`);
  process.exit(0);
} else {
  console.log(`RESULT: CLEAN — no prohibited content found.`);
  process.exit(0);
}
