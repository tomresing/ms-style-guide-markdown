import { MAX_RETRIES, REQUEST_TIMEOUT_MS, USER_AGENT } from './config.js';

export async function fetchText(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/json' }
      });
      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_RETRIES) throw new Error(`HTTP ${response.status}`);
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Unable to fetch ${url}: ${lastError?.message ?? 'unknown error'}`);
}

export async function mapWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let firstError;
  let nextIndex = 0;
  async function run() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        firstError ??= error;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  if (firstError) throw firstError;
  return results;
}