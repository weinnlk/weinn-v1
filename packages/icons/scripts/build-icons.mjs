import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

// Generate TSX icon components from raw SVGs.
run('npx svgr --config-file svgr.config.cjs raw --out-dir src');

// Rename generated files to match exported Icon* component names.
// SVGR names files based on SVG filenames (e.g., arrow-back.svg -> ArrowBack.tsx),
// but our template exports Icon-prefixed names (e.g., export function IconArrowBack).
const srcDir = path.join(process.cwd(), 'src');
for (const file of fs.readdirSync(srcDir)) {
  if (!file.endsWith('.tsx')) continue;
  if (file === 'index.tsx' || file === 'types.tsx' || file === 'index.ts' || file === 'types.ts') continue;

  const fullPath = path.join(srcDir, file);
  const contents = fs.readFileSync(fullPath, 'utf8');
  const match = contents.match(/export function\s+(Icon\w+)\s*\(/);
  if (!match) continue;
  const exportName = match[1];
  const desiredFile = `${exportName}.tsx`;
  if (file === desiredFile) continue;

  const desiredPath = path.join(srcDir, desiredFile);
  if (fs.existsSync(desiredPath)) {
    fs.unlinkSync(fullPath);
    continue;
  }

  fs.renameSync(fullPath, desiredPath);
}

// Generate barrel exports.
run('node scripts/generate-index.mjs');
