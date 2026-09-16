import path from 'node:path';
import { ROOT_URL } from './config.js';

export function flattenToc(node, parent = '') {
  const pages = [];
  for (const item of node.items ?? []) {
    const href = item.href ? new URL(item.href.replace(/^\//, ''), ROOT_URL).href : null;
    if (href && href.startsWith(ROOT_URL)) {
      const relative = href.slice(ROOT_URL.length).replace(/\/$/, '') || 'index';
      pages.push({ href: relative, url: href, title: item.toc_title ?? relative });
    }
    if (item.children) pages.push(...flattenToc({ items: item.children }, item.href ?? parent));
  }
  return [...new Map(pages.map((page) => [page.url, page])).values()];
}

export function outputPath(page) {
  const normalized = page.href.replace(/[^a-zA-Z0-9._/-]/g, '_').replace(/\/+$/, '');
  return path.join(normalized || 'index') + '.md';
}