#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '../public/docs-index.json');
const OUTPUT = path.join(__dirname, '../public/llms.txt');

const docs = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
docs.sort((a, b) => a.path.localeCompare(b.path));

let out = `# Rulebricks Documentation

> Decision automation platform for visual rule modeling and business logic.

`;

for (const doc of docs) {
  out += `## ${doc.title}\n`;
  out += `${doc.path}\n\n`;
  out += `${doc.description}\n\n`;
  out += `${doc.content}\n\n`;
}

fs.writeFileSync(OUTPUT, out);
console.log(`✓ ${OUTPUT} (${docs.length} pages)`);
