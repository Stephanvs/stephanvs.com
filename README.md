# Stephanvs.com

A minimal, modern personal website built with Bun and TypeScript.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Language**: TypeScript
- **Architecture**: Static Site Generator (SSG)
- **Styling**: Minimal CSS (Dark Mode / Techy)

## Development

To start the development server:

```bash
bun run dev
```

This will build the site and serve it at `http://localhost:3000` (or whatever port `bun x serve` picks).

## Build

To build the static site:

```bash
bun run build
```

The output will be in the `public/` directory.

## Content

Content is located in the `content/` directory. It supports MDX/Markdown with frontmatter.

- `content/posts/`: Blog posts
- `content/work/`: Work pages
- `content/pages/`: Static pages (Home, 404)
