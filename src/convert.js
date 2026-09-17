import { Defuddle } from 'defuddle/node';
import { extractMetadata, serializeFrontmatter } from './metadata.js';

function stripFooterBoilerplate(content) {
  const withoutFrontmatter = content.replace(/^\s*---\s*\n(?=[\w-]+\s*:)[\s\S]*?\n---\s*\n?/, '').trim();
  if (!withoutFrontmatter) return '';

  return withoutFrontmatter
    .replace(/\n+##\s*Feedback\s*\n+Was this page helpful\?\s*\n+(?:Yes|No)?\s*\n+---\s*\n+\\?-\s*Last updated on[^\n]*$/i, '')
    .replace(/\n+---\s*\n+\\?-\s*Last updated on[^\n]*$/i, '')
    .replace(/^---\s*\n+/, '')
    .replace(/\n+---\s*$/, '')
    .trim();
}

function cleanTitle(title) {
  return title?.replace(/\s+-\s+Microsoft Style Guide\s*$/i, '').trim() || title;
}

export async function convertPage(html, page) {
  const result = await Defuddle(html, page.url, { markdown: true });
  const body = stripFooterBoilerplate(result.contentMarkdown ?? result.content ?? '');
  const metadata = {
    ...extractMetadata(html, page.url),
    title: cleanTitle(result.title || page.title)
  };
  return serializeFrontmatter(metadata, body);
}