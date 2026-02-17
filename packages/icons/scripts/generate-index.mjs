import fs from 'node:fs';
import path from 'node:path';

const pkgRoot = path.resolve(process.cwd());
const iconsSrcDir = path.join(pkgRoot, 'src');

const entries = fs.readdirSync(iconsSrcDir, { withFileTypes: true });

const iconFiles = entries
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .filter((name) => name.endsWith('.tsx'))
  .filter((name) => name !== 'index.tsx')
  .filter((name) => name !== 'types.tsx')
  .filter((name) => name !== 'index.ts')
  .filter((name) => name !== 'types.ts')
  .sort((a, b) => a.localeCompare(b));

const lines = [];
lines.push(`export type { WeInnIconProps } from './types';`);

const seenExports = new Set();

for (const file of iconFiles) {
  const base = file.replace(/\.tsx$/, '');
  const fullPath = path.join(iconsSrcDir, file);
  const contents = fs.readFileSync(fullPath, 'utf8');
  const match = contents.match(/export function\s+(\w+)\s*\(/);
  if (!match) {
    throw new Error(`Could not find exported icon function name in ${file}`);
  }
  const exportName = match[1];

  if (!exportName.startsWith('Icon')) continue;
  if (seenExports.has(exportName)) continue;
  seenExports.add(exportName);

  lines.push(`export { ${exportName} } from './${base}';`);
}

lines.push('');

fs.writeFileSync(path.join(iconsSrcDir, 'index.ts'), lines.join('\n'), 'utf8');
