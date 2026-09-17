import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { getEncoding } from 'js-tiktoken';
import { CONCURRENCY, OUTPUT_DIR } from './config.js';
import { fetchText, mapWithConcurrency } from './fetch.js';

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const SAMPLE_QUOTAS = { 'a-z-word-list-term-collections': 40, default: 2 };
const TOKEN_ENCODING = 'o200k_base';
const INPUT_COST_USD_PER_MILLION_TOKENS = 2.5;
const tokenizer = getEncoding(TOKEN_ENCODING);

export function countText(text) {
  const characters = [...text].length;
  const words = text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return {
    characters,
    words,
    estimated_tokens: tokenizer.encode(text).length
  };
}

export function addCounts(left, right) {
  return Object.fromEntries(Object.keys(left).map((key) => [key, left[key] + right[key]]));
}

function subtractCounts(left, right) {
  return Object.fromEntries(Object.keys(left).map((key) => [key, left[key] - right[key]]));
}

function costFor(counts) {
  return counts.estimated_tokens * INPUT_COST_USD_PER_MILLION_TOKENS / 1_000_000;
}

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(filePath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(filePath);
  }
  return files;
}

function categoryFor(filePath, contentDir) {
  const relativePath = path.relative(contentDir, filePath);
  const parts = relativePath.split(path.sep);
  return parts.length > 1 ? parts[0] : 'root';
}

export function selectSampleFiles(files, contentDir = OUTPUT_DIR) {
  const categories = new Map();
  for (const filePath of files) {
    const category = categoryFor(filePath, contentDir);
    const categoryFiles = categories.get(category) ?? [];
    categoryFiles.push(filePath);
    categories.set(category, categoryFiles);
  }

  return [...categories.entries()].flatMap(([category, categoryFiles]) => {
    const quota = SAMPLE_QUOTAS[category] ?? SAMPLE_QUOTAS.default;
    return categoryFiles.slice(0, quota);
  });
}

function pageMetadata(content, filePath) {
  const match = content.match(FRONTMATTER);
  if (!match) throw new Error(`Missing frontmatter in ${filePath}`);
  const metadata = YAML.parse(match[1]);
  if (!metadata?.canonical_url) throw new Error(`Missing canonical_url in ${filePath}`);
  return metadata;
}

export async function countContent({ contentDir = OUTPUT_DIR, fetch = fetchText, concurrency = Math.min(CONCURRENCY, 2) } = {}) {
  const files = await markdownFiles(contentDir);
  const sampleFiles = selectSampleFiles(files, contentDir);
  const markdownPages = await Promise.all(files.map(async (filePath) => ({
    path: path.relative(process.cwd(), filePath),
    category: categoryFor(filePath, contentDir),
    markdown: countText(await fs.readFile(filePath, 'utf8'))
  })));
  const sampledPages = await mapWithConcurrency(sampleFiles, async (filePath) => {
    const markdown = await fs.readFile(filePath, 'utf8');
    const metadata = pageMetadata(markdown, filePath);
    const html = await fetch(metadata.canonical_url);
    return {
      path: path.relative(process.cwd(), filePath),
      category: categoryFor(filePath, contentDir),
      url: metadata.canonical_url,
      markdown: countText(markdown),
      html: countText(html)
    };
  }, concurrency);

  const markdownTotal = markdownPages.reduce((counts, page) => addCounts(counts, page.markdown), countText(''));
  const sampleHtml = sampledPages.reduce((counts, page) => addCounts(counts, page.html), countText(''));
  const categoryCounts = new Map();
  for (const page of markdownPages) categoryCounts.set(page.category, (categoryCounts.get(page.category) ?? 0) + 1);
  const categorySamples = new Map();
  for (const page of sampledPages) {
    const sample = categorySamples.get(page.category) ?? { count: 0, html: countText(''), tokens: [] };
    sample.count += 1;
    sample.html = addCounts(sample.html, page.html);
    sample.tokens.push(page.html.estimated_tokens);
    categorySamples.set(page.category, sample);
  }
  const estimatedHtml = [...categoryCounts].reduce((counts, [category, count]) => {
    const sample = categorySamples.get(category);
    const average = Object.fromEntries(Object.keys(sample.html).map((key) => [key, sample.html[key] / sample.count]));
    return addCounts(counts, Object.fromEntries(Object.keys(average).map((key) => [key, Math.round(average[key] * count)])));
  }, countText(''));
  const variance = [...categoryCounts].reduce((total, [category, count]) => {
    const sample = categorySamples.get(category);
    if (sample.count < 2) return total;
    const mean = sample.tokens.reduce((sum, value) => sum + value, 0) / sample.count;
    const squaredDeviation = sample.tokens.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    return total + count ** 2 * (squaredDeviation / (sample.count - 1)) / sample.count;
  }, 0);
  const margin = Math.round(1.96 * Math.sqrt(variance));

  return {
    files: files.length,
    sampled_files: sampledPages.length,
    html_savings: `${Math.round((1 - sampledPages.length / files.length) * 100)}% fewer page fetches than a full comparison`,
    token_encoding: TOKEN_ENCODING,
    input_cost_assumption: `$${INPUT_COST_USD_PER_MILLION_TOKENS} per million input tokens`,
    totals: { markdown: markdownTotal, html_sample: sampleHtml, html_estimated: estimatedHtml },
    difference: subtractCounts(markdownTotal, estimatedHtml),
    html_token_spread_proxy: {
      note: 'Approximate 95% margin from within-category sample variation; deterministic samples are not formal confidence intervals',
      margin_tokens: margin,
      estimated_range: [estimatedHtml.estimated_tokens - margin, estimatedHtml.estimated_tokens + margin]
    },
    projected_input_cost: {
      markdown_usd: costFor(markdownTotal),
      raw_html_usd: costFor(estimatedHtml),
      savings_usd: costFor(estimatedHtml) - costFor(markdownTotal),
      savings_percent: Math.round((1 - markdownTotal.estimated_tokens / estimatedHtml.estimated_tokens) * 100)
    },
    pages: sampledPages
  };
}