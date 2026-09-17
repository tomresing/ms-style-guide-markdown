import { parseHTML } from 'linkedom';
import YAML from 'yaml';

function metaValue(document, name) {
  return document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content') ?? null;
}

function textValue(html, key) {
  const match = html.match(new RegExp(`${key}\\s*:\\s*([^\\n<]+)`, 'i'));
  return match?.[1]?.trim() || null;
}

export function extractMetadata(html, pageUrl) {
  const { document } = parseHTML(html);
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? pageUrl;
  const summary = metaValue(document, 'description') ?? null;

  const metadata = {
    title: metaValue(document, 'title') ?? document.title ?? null,
    summary,
    canonical_url: canonicalUrl,
    ms_date: metaValue(document, 'ms.date') ?? textValue(html, 'ms.date'),
    updated_at: metaValue(document, 'updated_at') ?? textValue(html, 'updated_at')
  };
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value));
}

export function serializeFrontmatter(metadata, content) {
  return `---\n${YAML.stringify(metadata)}---\n\n${content.trim()}\n`;
}