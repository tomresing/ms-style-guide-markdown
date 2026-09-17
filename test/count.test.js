import test from 'node:test';
import assert from 'node:assert/strict';
import { addCounts, countText, selectSampleFiles } from '../src/count.js';

test('counts characters, words, and estimated tokens', () => {
  const counts = countText('One two\nthree!');
  assert.deepEqual({
    characters: counts.characters,
    words: counts.words
  }, {
    characters: 14,
    words: 3
  });
  assert.ok(counts.estimated_tokens > 0);
});

test('counts Unicode characters and contractions as words', () => {
  const counts = countText("Café user's guide");
  assert.deepEqual({
    characters: counts.characters,
    words: counts.words
  }, {
    characters: 17,
    words: 3
  });
  assert.ok(counts.estimated_tokens > 0);
});

test('adds count objects', () => {
  assert.deepEqual(addCounts(countText('one'), countText('two three')), {
     characters: 12,
    words: 3,
    estimated_tokens: countText('one').estimated_tokens + countText('two three').estimated_tokens
  });
});

test('selects a weighted sample by content category', () => {
  const files = [
    '/content/a-z-word-list-term-collections/one.md',
    '/content/a-z-word-list-term-collections/two.md',
    '/content/a-z-word-list-term-collections/three.md',
    '/content/grammar/one.md',
    '/content/grammar/two.md',
    '/content/grammar/three.md'
  ];

  assert.deepEqual(selectSampleFiles(files, '/content'), [
    files[0], files[1], files[2], files[3], files[4]
  ]);
});

test('groups root-level pages into one category', () => {
  const files = ['/content/one.md', '/content/two.md', '/content/three.md'];

  assert.deepEqual(selectSampleFiles(files, '/content'), files.slice(0, 2));
});