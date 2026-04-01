/**
 * Orchestrate all data fetching scripts.
 * Each fetch runs independently — failure in one doesn't affect others.
 */

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const SCRIPTS_DIR = resolve(import.meta.dirname ?? '.', '.');

const scripts = [
  { name: 'Weather', file: 'fetch-weather.ts' },
  { name: 'News', file: 'fetch-news.ts' },
];

async function main(): Promise<void> {
  console.log('=== Artemis II Data Fetch ===');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const script of scripts) {
    console.log(`--- ${script.name} ---`);
    try {
      execSync(`npx tsx ${resolve(SCRIPTS_DIR, script.file)}`, {
        stdio: 'inherit',
        timeout: 60000,
      });
      results.push({ name: script.name, success: true });
    } catch (err) {
      const message = (err as Error).message;
      console.error(`ERROR: ${script.name} failed: ${message}\n`);
      results.push({ name: script.name, success: false, error: message });
    }
    console.log('');
  }

  console.log('=== Fetch Summary ===');
  for (const r of results) {
    console.log(`  ${r.success ? 'OK' : 'FAIL'} ${r.name}${r.error ? ': ' + r.error : ''}`);
  }

  const failures = results.filter(r => !r.success).length;
  if (failures === results.length) {
    console.error('\nAll fetches failed!');
    process.exit(1);
  }

  if (failures > 0) {
    console.warn(`\n${failures}/${results.length} fetches failed (partial data available).`);
  }
}

main();
