// GTA VI Platinum Compendium & Tracker - Build Entrypoint for make.fun (Node 22)
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(`[makefun build] Target output directory: ${out}`);

mkdirSync(out, { recursive: true });

console.log(`[makefun build] Copying app/ assets...`);
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });

mkdirSync(join(out, 'screenshots'), { recursive: true });
const screenshotsDir = join(here, 'screenshots');

if (existsSync(screenshotsDir)) {
  const screenshotFiles = readdirSync(screenshotsDir).filter(f => /\.(png|jpe?g)$/i.test(f));
  console.log(`[makefun build] Found ${screenshotFiles.length} screenshot(s): ${screenshotFiles.join(', ')}`);
  if (screenshotFiles.length !== 4) {
    throw new Error(`Expected exactly 4 screenshots, found ${screenshotFiles.length}`);
  }
  cpSync(screenshotsDir, join(out, 'screenshots'), { recursive: true });
} else {
  throw new Error(`Screenshots directory does not exist: ${screenshotsDir}`);
}

console.log(`[makefun build] Building dossier.json with makefun-frontend...`);
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`[makefun build] Dossier generated successfully at ${join(out, 'dossier.json')} (${Buffer.byteLength(dossier, 'utf8')} bytes)`);
