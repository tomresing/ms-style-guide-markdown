import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenToc, outputPath } from '../src/toc.js';

test('flattens nested TOC pages and deduplicates URLs', () => {
  const pages = flattenToc({ items: [{ href: 'welcome/', children: [{ href: 'welcome/whats-new', toc_title: "What's new" }] }, { href: 'welcome/whats-new' }] });
  assert.deepEqual(pages.map((page) => page.href), ['welcome', 'welcome/whats-new']);
  assert.equal(outputPath(pages[1]), 'welcome/whats-new.md');
});