import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMetadata, serializeFrontmatter } from '../src/metadata.js';

test('extracts Microsoft metadata and serializes YAML frontmatter', () => {
  const html = '<html><head><title>Example</title><meta name="description" content="Desc"></head><body>ms.date: 2026-07-02T00:00:00.0000000Z<br>updated_at: 2026-07-06T19:24:00.0000000Z</body></html>';
  const metadata = extractMetadata(html, 'https://example.test/page');
  assert.equal(metadata.ms_date, '2026-07-02T00:00:00.0000000Z');
  assert.match(serializeFrontmatter(metadata, '# Example'), /^---\ntitle: Example/);
});