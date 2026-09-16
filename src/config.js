import path from 'node:path';

export const ROOT_URL = 'https://learn.microsoft.com/en-us/style-guide/';
export const TOC_URL = new URL('toc.json', ROOT_URL).href;
export const WHATS_NEW_URL = new URL('welcome/whats-new', ROOT_URL).href;
export const OUTPUT_DIR = path.resolve('content');
export const STATE_FILE = path.resolve('data/whats-new-state.json');
export const USER_AGENT = 'ms-style-guide-markdown/0.1 (+https://github.com/)';
export const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_RETRIES = 3;
export const CONCURRENCY = 6;