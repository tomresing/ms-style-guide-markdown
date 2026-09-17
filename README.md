# Microsoft Style Guide Markdown

Scrape the Microsoft Writing Style Guide into Markdown with YAML frontmatter using
[Defuddle](https://defuddle.md/docs).

## Purpose

This repository provides a clean, structured, and versioned copy of the guide for
other projects to consume. Markdown and YAML frontmatter are easier to index,
search, import, and use in offline or automated workflows than the website's HTML.
Stable local paths, source URLs, and update metadata also let downstream projects
pin revisions, review changes, and check freshness while retaining the Microsoft
website as the authoritative source.

## Commands

```sh
npm install
npm test
npm run scrape
npm run check-updates
npm run count
npm run scrape -- --force
```

`npm run count` compares the full generated Markdown files under `content/`
with the raw HTML fetched from each page's `canonical_url`. It reports total
and per-page character, word, and estimated token counts as JSON. Estimated
Tokens are counted with the `o200k_base` BPE encoding used by modern OpenAI
models. The report also projects input cost using a configurable planning rate
of $2.50 per million tokens. Change the rate in `src/count.js` for another
model or contract.
The `difference` values are Markdown minus raw HTML.

`npm run count` counts all local Markdown but fetches raw HTML only for a
stratified sample: 40 A–Z term pages and two pages from each other content
category. It extrapolates HTML counts by category, so the estimate uses far
fewer page fetches than a full comparison.

The projected savings compare sending the generated Markdown with sending the
original raw HTML. This predicts lower context usage and input cost, while
preserving the article content; it does not predict model answer quality.
The report includes a sampling-spread proxy for HTML token uncertainty. Because
the sample is deterministic and category-stratified, treat that range as a
diagnostic rather than a formal confidence interval.

## Example savings

Using the current 980-page content set and a 65-page stratified HTML sample:

| Source | Estimated tokens | Input cost at $2.50/M tokens |
| --- | ---: | ---: |
| Generated Markdown | 228,634 | $0.57 |
| Original raw HTML (extrapolated) | 13,120,722 | $32.80 |

This estimates a reduction of about 12.9 million input tokens, or 98%, saving
approximately $32.23 per full ingestion. The sample requires 93% fewer HTML
fetches than comparing every page. Token counts use `o200k_base`; HTML totals
are extrapolated by content category, so these figures are planning estimates.

The scraper discovers pages from Microsoft's published
[`toc.json`](https://learn.microsoft.com/en-us/style-guide/toc.json), rather than
following arbitrary links in article content. Generated pages are written below
`content/` and the last successful metadata check is stored in
`data/whats-new-state.json`.

The daily check reads the `ms.date` and `updated_at` metadata from
[`What's new`](https://learn.microsoft.com/en-us/style-guide/welcome/whats-new).
An unchanged check does not rewrite generated content; a change to either value
starts a full scrape. Use `--force` for a manual rebuild.

## Frontmatter

Each generated page contains stable source metadata including `title`,
`summary`, `canonical_url`, `ms_date`, and `updated_at`.

## Automation

The intended scheduler is GitHub Actions (`.github/workflows/update.yml`). It runs
the metadata check daily in UTC and commits generated changes only after a
successful scrape. The same `npm run check-updates` command can be used from cron.
