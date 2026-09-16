import { Defuddle } from 'defuddle/node';
import { extractMetadata, serializeFrontmatter } from './metadata.js';

function removeLeadingFrontmatter(content) {
  return content.replace(/^\s*---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
}

export async function convertPage(html, page) {
  const result = await Defuddle(html, page.url, { markdown: true });
  const metadata = {
    ...extractMetadata(html, page.url),
    title: result.title || page.title,
    source_url: page.url
  };
  return serializeFrontmatter(metadata, removeLeadingFrontmatter(result.contentMarkdown ?? result.content ?? ''));
}