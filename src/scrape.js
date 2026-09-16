import fs from 'node:fs/promises';
import path from 'node:path';
import { CONCURRENCY, OUTPUT_DIR, ROOT_URL, TOC_URL } from './config.js';
import { convertPage } from './convert.js';
import { fetchText, mapWithConcurrency } from './fetch.js';
import { flattenToc, outputPath } from './toc.js';

async function writeFileSafe(root, relativePath, content) {
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error(`Unsafe output path: ${relativePath}`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf8');
}

export async function scrape() {
  const toc = JSON.parse(await fetchText(TOC_URL));
  const pages = flattenToc(toc);
  if (!pages.length) throw new Error('TOC contained no pages');
  await fs.mkdir(path.dirname(OUTPUT_DIR), { recursive: true });
  const staging = await fs.mkdtemp(path.join(path.dirname(OUTPUT_DIR), '.ms-style-guide-'));
  try {
    await mapWithConcurrency(pages, async (page) => {
      const content = await convertPage(await fetchText(new URL(page.href, ROOT_URL).href), page);
      await writeFileSafe(staging, outputPath(page), content);
    }, CONCURRENCY);
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
    await fs.rename(staging, OUTPUT_DIR);
    return { count: pages.length };
  } catch (error) {
    await fs.rm(staging, { recursive: true, force: true });
    throw error;
  }
}