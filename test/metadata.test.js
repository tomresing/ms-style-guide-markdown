import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMetadata, serializeFrontmatter } from '../src/metadata.js';
import { convertPage } from '../src/convert.js';

test('extracts Microsoft metadata without redundant YAML fields', () => {
  const html = '<html><head><title>Example</title><meta name="description" content="Desc"><meta name="source_path" content="styleguide/example.md"></head><body>ms.date: 2026-07-02T00:00:00.0000000Z<br>updated_at: 2026-07-06T19:24:00.0000000Z</body></html>';
  const metadata = extractMetadata(html, 'https://example.test/style-guide/example');

  assert.equal(metadata.ms_date, '2026-07-02T00:00:00.0000000Z');
  assert.equal(metadata.summary, 'Desc');
  assert.equal(metadata.description, undefined);
  assert.equal(metadata.author, undefined);
  assert.equal(metadata.topic, undefined);
  assert.equal(metadata.section_path, undefined);
  assert.equal(metadata.slug, undefined);
  assert.equal(metadata.source_path, undefined);
  assert.match(serializeFrontmatter(metadata, '# Example'), /^---\ntitle: Example/);
});

test('convertPage strips footer boilerplate and keeps the article body', async () => {
  const html = `
  <html><head>
    <title>Rules</title>
    <link rel="canonical" href="https://learn.microsoft.com/en-us/style-guide/rules" />
    <meta name="description" content="Rules guidance" />
    <meta name="source_path" content="/style-guide/rules" />
  </head>
  <body>
    <main>
      <h1>Rules</h1>
      <p>Lead with the main rule.</p>
    </main>
    <div class="feedback">
      <h2>Feedback</h2>
      <p>Was this page helpful?</p>
    </div>
    <div class="footer">Last updated on 2025-04-14</div>
  </body></html>`;

  const output = await convertPage(html, { url: 'https://learn.microsoft.com/en-us/style-guide/rules' });

  assert.match(output, /^title: Rules$/m);
  assert.doesNotMatch(output, /Microsoft Style Guide/m);
  assert.match(output, /Lead with the main rule\./);
  assert.doesNotMatch(output, /## Feedback|Was this page helpful\?|Last updated on/i);
  assert.doesNotMatch(output, /^topic:|^section_path:|^slug:|^source_path:/m);
});

test('convertPage preserves article feedback sections', async () => {
  const html = `
  <html><head><title>Editorial guidance</title></head><body><main>
    <h2>Feedback</h2>
    <p>Collect feedback before publishing.</p>
  </main></body></html>`;

  const output = await convertPage(html, { url: 'https://example.test/feedback' });

  assert.match(output, /## Feedback/);
  assert.match(output, /Collect feedback before publishing\./);
});

test('convertPage removes a standalone last-updated footer', async () => {
  const html = `
  <html><head><title>Rules</title></head><body><main>
    <h1>Rules</h1>
    <p>Lead with the main rule.</p>
    <hr />
    <p>- Last updated on 2025-04-14</p>
  </main></body></html>`;

  const output = await convertPage(html, { url: 'https://example.test/rules' });

  assert.match(output, /Lead with the main rule\./);
  assert.doesNotMatch(output, /Last updated on/i);
});

test('convertPage preserves article content that starts with a Markdown divider', async () => {
  const html = `
  <html><head>
    <title>Abort, Abortion - Microsoft Style Guide</title>
    <meta name="description" content="Term guidance" />
  </head>
  <body><main>
    <h1>Abort, Abortion</h1>
    <p>Never use <em>abortion.</em></p>
    <p>Use <em>abort</em> for a technical audience.</p>
  </main></body></html>`;

  const output = await convertPage(html, { url: 'https://learn.microsoft.com/en-us/style-guide/a-z-word-list-term-collections/a/abort-abortion' });

  assert.match(output, /^title: Abort, Abortion$/m);
  assert.match(output, /Never use \*abortion\.\*/);
  assert.match(output, /Use \*abort\* for a technical audience\./);
  assert.doesNotMatch(output, /^---\s*\n---/m);
  assert.doesNotMatch(output, /\n---\s*\n?$/);
});