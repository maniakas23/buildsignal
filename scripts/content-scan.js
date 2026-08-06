#!/usr/bin/env node
/**
 * Pre-deployment Content Scan
 * BuildSignal v1.1.0 / Build 110
 *
 * Scans source code for:
 *   – Beta language ("beta", "early access", "preview", etc.)
 *   – Fictional customer names ("Acme Corp", "Demo User", etc.)
 *   – Unsupported claims ("100% accurate", "guaranteed", etc.)
 *   – Simulated / placeholder data markers
 *   – Legacy pricing tier names
 *   – Old Kestovar domains
 *   – Placeholder values (YOUR_PREVIEW_DATABASE_ID, etc.)
 *   – Beta component references
 *
 * Usage:
 *   node scripts/content-scan.js [root_dir]
 *
 * Exit codes:
 *   0  – clean
 *   1  – errors found (blocks deploy)
 *   2  – warnings only
 */

const fs = require("fs");
const path = require("path");

// ─── Configuration ──────────────────────────────────────────

const DEFAULT_ROOT = path.resolve(__dirname, "..");
const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".toml",
]);

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /test-results/,
  /\.next/,
  /coverage/,
  /playwright-report/,
  /scripts\/content-scan\.js/, // don't scan self
];

// ─── Scan Rules ─────────────────────────────────────────────

const RULES = [
  {
    id: "beta-language",
    patterns: [
      /\bearly access\b/gi,
      /\bpreview feature\b/gi,
      /\bexperimental\b/gi,
      /\bcoming soon\b/gi,
      /\bnot yet available\b/gi,
      /\bunder development\b/gi,
      /\bcoming 2025\b/gi,
      /\bcoming 2026\b/gi,
      /\bbe the first\b/gi,
      /\breserve your spot\b/gi,
      /\bjoin the beta\b/gi,
      /\bcoming this\b/gi,
      /\blaunching\b/gi,
      /\bpre-launch\b/gi,
      /\bsneak peek\b/gi,
      /\bpreview now\b/gi,
      /\bget early access\b/gi,
    ],
    severity: "error",
    help: "Remove beta / pre-launch language. Use factual descriptions of current capabilities.",
  },
  {
    id: "fictional-customer",
    patterns: [
      /Acme Corp/gi,
      /Example Inc/gi,
      /Test Company/gi,
      /Demo Corp/gi,
      /Sample LLC/gi,
      /Fictional/gi,
      /Placeholder/gi,
      /Mock/gi,
    ],
    severity: "error",
    help: "Remove fictional customer names. Use real customer data or generic language.",
  },
  {
    id: "unsupported-claim",
    patterns: [
      /100% guaranteed/gi,
      /100% accurate/gi,
      /always accurate/gi,
      /never miss/gi,
      /perfect accuracy/gi,
      /unlimited/gi,
      /unlimited data/gi,
      /instant/gi,
      /instantly/gi,
      /real-time/gi,
      /real time/gi,
      /guaranteed results/gi,
      /best in class/gi,
      /industry leading/gi,
      /industry-leading/gi,
      /most accurate/gi,
      /only platform/gi,
    ],
    severity: "warning",
    help: "Remove unsupported superlative claims. Use factual, evidence-based language.",
  },
  {
    id: "simulated-data",
    patterns: [
      /simulated/gi,
      /mock data/gi,
      /fake data/gi,
      /placeholder data/gi,
      /test data/gi,
      /demo data/gi,
      /sample data/gi,
      /lorem ipsum/gi,
      /todo data/gi,
      /fixme data/gi,
    ],
    severity: "error",
    help: "Remove simulated / placeholder data markers. Use real data sources.",
  },
  {
    id: "pricing-tier",
    patterns: [
      /Starter\s*\/\s*Pro\s*\/\s*Enterprise/gi,
      /Starter\s*\/\s*Pro\s*\/\s*Business\s*\/\s*Enterprise/gi,
    ],
    severity: "error",
    help: "Use correct pricing tiers: Scout / Professional / Business / Enterprise.",
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
    help: "Replace all placeholder values with real configuration before deploying.",
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

// ─── Utilities ──────────────────────────────────────────────

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some((re) => re.test(filePath));
}

function isScanableFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSIONS.has(ext);
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const issues = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Find line numbers for each match
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            issues.push({
              rule: rule.id,
              severity: rule.severity,
              message: rule.help,
              line: i + 1,
              match: matches[0],
            });
          }
        }
      }
    }
  }

  return issues;
}

function scanDirectory(dir) {
  const allIssues = [];

  function walk(currentDir) {
    if (shouldIgnore(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!shouldIgnore(fullPath)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && isScanableFile(fullPath)) {
        const fileIssues = scanFile(fullPath);
        for (const issue of fileIssues) {
          allIssues.push({
            ...issue,
            file: path.relative(dir, fullPath),
          });
        }
      }
    }
  }

  walk(dir);
  return allIssues;
}

// ─── Main ───────────────────────────────────────────────────

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_ROOT;

  if (!fs.existsSync(rootDir)) {
    console.error(`Error: Directory does not exist: ${rootDir}`);
    process.exit(1);
  }

  console.log(`Scanning: ${rootDir}\n`);

  const issues = scanDirectory(rootDir);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  // Summary
  console.log(`Errors:   ${errors.length}`);
  console.log(`Warnings: ${warnings.length}\n`);

  // Detailed output
  if (errors.length > 0) {
    console.log("=== ERRORS ===\n");
    for (const issue of errors) {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    [${issue.rule}] ${issue.message}`);
      console.log(`    Match: "${issue.match}"`);
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log("=== WARNINGS ===\n");
    for (const issue of warnings) {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    [${issue.rule}] ${issue.message}`);
      console.log(`    Match: "${issue.match}"`);
      console.log();
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("All clear — no issues found.");
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log("FATAL: Content scan failed. Fix errors before deploying.");
    process.exit(1);
  }

  console.log("WARN: Content scan found warnings only.");
  process.exit(2);
}

main();
