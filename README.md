# Microsoft Style Guide Markdown

Scrape the Microsoft Writing Style Guide into Markdown with YAML frontmatter using
[Defuddle](https://defuddle.md/docs).

## Commands

```sh
npm install
npm test
npm run scrape
npm run check-updates
npm run scrape -- --force
```

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
`source_url`, `canonical_url`, `ms_date`, `updated_at`, and `source_path`.

## Automation

The intended scheduler is GitHub Actions (`.github/workflows/update.yml`). It runs
the metadata check daily in UTC and commits generated changes only after a
successful scrape. The same `npm run check-updates` command can be used from cron.
