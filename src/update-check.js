import fs from 'node:fs/promises';
import path from 'node:path';
import { STATE_FILE, WHATS_NEW_URL } from './config.js';
import { fetchText } from './fetch.js';
import { extractMetadata } from './metadata.js';
import { scrape } from './scrape.js';

async function readState() {
  try { return JSON.parse(await fs.readFile(STATE_FILE, 'utf8')); } catch { return null; }
}

export async function checkForUpdates({ force = false } = {}) {
  const metadata = extractMetadata(await fetchText(WHATS_NEW_URL), WHATS_NEW_URL);
  if (!metadata.ms_date && !metadata.updated_at) throw new Error('What\'s new page has no update metadata');
  const observed = { url: WHATS_NEW_URL, ms_date: metadata.ms_date ?? null, updated_at: metadata.updated_at ?? null };
  const previous = await readState();
  const changed = force || !previous || previous.ms_date !== observed.ms_date || previous.updated_at !== observed.updated_at;
  if (changed) {
    const result = await scrape();
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, `${JSON.stringify({ ...observed, checked_at: new Date().toISOString(), page_count: result.count }, null, 2)}\n`);
    return { changed: true, ...result };
  }
  return { changed: false, count: previous.page_count ?? 0 };
}