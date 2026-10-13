# Stephanvs.com

A personal website built with Astro, TypeScript, and content collections.

## Tech Stack

- [Astro](https://astro.build) static site generation
- MDX content collections for writing and work
- TypeScript and Tailwind CSS

## Development

Use Bun 1.4.3, as recorded in `package.json`.

```bash
bun install --frozen-lockfile
bun run dev
```

## Build

```bash
bun run build
```

## Cloudflare Pages

Set `BUN_VERSION` to `1.4.3` in the Pages project's environment variables for both production and preview builds.
Set the build command to `bun run build` and the output directory to `dist`.

Cloudflare's default Bun 1.2.15 cannot read the version-2 `bun.lock`.
The `packageManager` field records the version for local development; Cloudflare requires the environment variable to override its Bun version.
See the [Cloudflare build image documentation](https://developers.cloudflare.com/pages/configuration/build-image/).

## Content

- `content/posts/`: Blog posts
- `content/work/`: Work pages
- `content/pages/`: Static pages
