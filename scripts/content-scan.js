const fs = require("fs");
const path = require("path");

const BETA_PATTERNS = [
  /\\bbeta\\b/gi,
  /\\balpha\\b/gi,
  /\\bearly access\\b/gi,
  /\\bpreview\\b/gi,
  /\\bexperimental\\b/gi,
  /\\bcoming soon\\b/gi,
  /\\bnot yet available\\b/gi,
  /\\bunder development\\b/gi,
];

const FICTIONAL_PATTERNS = [
  /Acme Corp/gi,
  /Example Inc/gi,
  /Test Company/gi,
  /Demo Corp/gi,
  /Sample LLC/gi,
  /Fictional/gi,
  /Placeholder/gi,
  /Mock/gi,
];

const UNSUPPORTED_PATTERNS = [
  /100% guaranteed/gi,
  /always accurate/gi,
  /never miss/gi,
  /perfect/gi,
  /unlimited/gi,
];

const SIMULATED_PATTERNS = [
  /simulated/gi,
  /mock data/gi,
  /fake data/gi,
  /placeholder data/gi,
  /test data/gi,
  /demo data/gi,
  /sample data/gi,
  /lorem ipsum/gi,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const errors = [];
  const warnings = [];

  for (const pattern of BETA_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push(`Beta language: "${matches[0]}" at ${filePath}`);
    }
  }

  for (const pattern of FICTIONAL_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push(`Fictional customer: "${matches[0]}" at ${filePath}`);
    }
  }

  for (const pattern of UNSUPPORTED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      warnings.push(`Unsupported claim: "${matches[0]}" at ${filePath}`);
    }
  }

  for (const pattern of SIMULATED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push(`Simulated data: "${matches[0]}" at ${filePath}`);
    }
  }

  return { errors, warnings };
}

function scanDirectory(dir) {
  const results = { errors: [], warnings: [] };
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git") {
        const subResults = scanDirectory(fullPath);
        results.errors.push(...subResults.errors);
        results.warnings.push(...subResults.warnings);
      }
    } else if (/\.(tsx?|jsx?|md)$/.test(file)) {
      const fileResults = scanFile(fullPath);
      results.errors.push(...fileResults.errors);
      results.warnings.push(...fileResults.warnings);
    }
  }

  return results;
}

const rootDir = process.argv[2] || ".";
const results = scanDirectory(rootDir);

console.log(`Content scan results for ${rootDir}:`);
console.log(`Errors: ${results.errors.length}`);
console.log(`Warnings: ${results.warnings.length}`);

if (results.errors.length > 0) {
  console.log("\nErrors:");
  for (const error of results.errors) {
    console.log(`  - ${error}`);
  }
}

if (results.warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of results.warnings) {
    console.log(`  - ${warning}`);
  }
}

if (results.errors.length > 0) {
  process.exit(1);
}

console.log("\nContent scan passed!");
