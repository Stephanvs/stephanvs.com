import type { ContentItem, SiteConfig } from './types';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap');

:root {
  --paper: #f2efe7;
  --ink: #191915;
  --muted: #68665e;
  --line: #cbc6b9;
  --accent: #d64b2a;
  --panel: #e7e1d4;
  --code-bg: #24241f;
  --font-display: 'Newsreader', Georgia, serif;
  --font-sans: 'Instrument Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  line-height: 1.65;
  font-size: 17px;
  margin: 0;
  padding: 0 3rem;
}

a { color: inherit; text-decoration-color: var(--accent); text-underline-offset: 0.2em; }
a:hover { color: var(--accent); }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

.site-header { max-width: 1280px; margin: 0 auto; min-height: 88px; border-bottom: 1px solid var(--ink); display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.logo { font-family: var(--font-display); font-weight: 600; font-size: 1.45rem; line-height: 1; text-decoration: none; }
.logo-mark { color: var(--accent); }

nav ul { display: flex; list-style: none; gap: 1.5rem; }
nav li a { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-decoration: none; text-transform: uppercase; }
nav li a:hover, nav li a.active { color: var(--accent); }

main { max-width: 1280px; margin: 0 auto; }
.article { max-width: 760px; margin: 5rem auto; }
.article-layout { display: grid; grid-template-columns: 220px minmax(0, 760px) 220px; gap: 3.5rem; align-items: start; margin: 5rem 0; }
.article-layout .article { margin: 0; min-width: 0; }
.toc { position: sticky; top: 2rem; max-height: calc(100vh - 4rem); overflow-y: auto; padding-right: 0.75rem; scrollbar-width: thin; }
.toc-title { border-bottom: 1px solid var(--ink); color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.1em; margin-bottom: 0.8rem; padding-bottom: 0.8rem; text-transform: uppercase; }
.toc ol { list-style: none; margin: 0; }
.toc li { border-left: 1px solid var(--line); }
.toc li.toc-level-3 a { padding-left: 1.5rem; font-size: 0.72rem; }
.toc a { color: var(--muted); display: block; font-size: 0.78rem; line-height: 1.35; padding: 0.45rem 0 0.45rem 0.85rem; text-decoration: none; transition: color 160ms ease, border-color 160ms ease; }
.toc a:hover { color: var(--accent); }
.toc a.active { border-left: 2px solid var(--accent); color: var(--accent); font-weight: 600; margin-left: -1px; }
.article h2, .article h3 { scroll-margin-top: 2rem; }
.article-spacer { width: 220px; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 500; line-height: 1.05; }
h1 { font-size: clamp(3rem, 7vw, 5.75rem); letter-spacing: -0.045em; margin-bottom: 1.5rem; }
h2 { font-size: clamp(2rem, 4vw, 3.2rem); letter-spacing: -0.035em; margin: 4.5rem 0 1.5rem; }
h3 { font-size: 1.65rem; margin: 2.5rem 0 0.8rem; }

p { margin-bottom: 1.5rem; }
ul, ol { margin: 0 0 1.5rem 1.4rem; }
blockquote { border-left: 4px solid var(--accent); font-family: var(--font-display); font-size: 1.5rem; margin: 2.5rem 0; padding-left: 1.5rem; }

code { background: var(--panel); font-family: var(--font-mono); padding: 0.15rem 0.35rem; font-size: 0.86em; }
pre { background: var(--code-bg); color: #f7f3e9; padding: 1.5rem; overflow-x: auto; margin-bottom: 2rem; }
pre code { background: none; padding: 0; color: inherit; }

img { max-width: 100%; height: auto; display: block; margin: 2rem 0; }

.post-meta, small { color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; }
.post-meta { margin-bottom: 2rem; display: block; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--ink); }
.card { min-width: 0; padding: 2rem 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 9rem 1fr; gap: 1.5rem; text-decoration: none; }
.card:nth-child(odd) { padding-right: 2rem; border-right: 1px solid var(--line); }
.card:nth-child(even) { padding-left: 2rem; }
.card-media { aspect-ratio: 4 / 3; background: var(--panel); overflow: hidden; }
.card-media img { width: 100%; height: 100%; object-fit: cover; margin: 0; filter: saturate(0.72); transition: transform 400ms ease, filter 400ms ease; }
.card:hover .card-media img { transform: scale(1.025); filter: saturate(1); }
.card h3 { margin: 0 0 0.6rem; font-size: clamp(1.4rem, 2.5vw, 2rem); letter-spacing: -0.025em; }
.card p { color: var(--muted); font-size: 0.9rem; margin-bottom: 0.75rem; }

.hero { min-height: min(760px, calc(100vh - 88px)); padding: clamp(4rem, 10vw, 8rem) 0 4rem; display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 4rem; align-items: end; border-bottom: 1px solid var(--ink); }
.hero-kicker, .section-kicker { color: var(--accent); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }
.hero h1 { max-width: 980px; }
.hero-summary { max-width: 680px; font-size: clamp(1.15rem, 2vw, 1.45rem); line-height: 1.45; }
.hero-aside { border-top: 1px solid var(--ink); padding-top: 1rem; }
.avatar-img { width: 100%; aspect-ratio: 1; object-fit: cover; margin: 0 0 1rem; filter: grayscale(1) contrast(1.05); }
.hero-aside p { color: var(--muted); font-size: 0.82rem; line-height: 1.5; }
.actions { display: flex; gap: 0.75rem; margin-top: 2rem; }
.button { border: 1px solid var(--ink); display: inline-flex; padding: 0.65rem 1rem; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-decoration: none; text-transform: uppercase; }
.button-primary { background: var(--ink); color: var(--paper); }
.button:hover { background: var(--accent); border-color: var(--accent); color: white; }
.intro { display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; padding: 5rem 0; border-bottom: 1px solid var(--ink); }
.intro-copy { font-family: var(--font-display); font-size: clamp(1.55rem, 3vw, 2.25rem); line-height: 1.25; }
.intro-copy p:last-child { margin-bottom: 0; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; margin: 5rem 0 1.5rem; }
.section-head h2 { margin: 0; }
.section-link { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; }

.site-footer { max-width: 1280px; margin: 6rem auto 0; border-top: 1px solid var(--ink); padding: 2rem 0 3rem; color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; display: flex; justify-content: space-between; gap: 1rem; }

@media (max-width: 760px) {
  body { padding: 0 1.25rem; font-size: 16px; }
  .site-header { align-items: flex-start; flex-direction: column; gap: 1rem; padding: 1.25rem 0; }
  nav { width: 100%; overflow-x: auto; }
  nav ul { gap: 1.25rem; padding-bottom: 0.2rem; }
  .hero { min-height: auto; grid-template-columns: 1fr; gap: 3rem; padding: 4rem 0 3rem; }
  .hero h1 { font-size: clamp(3.2rem, 15vw, 4.75rem); }
  .hero-aside { display: grid; grid-template-columns: 100px 1fr; gap: 1rem; align-items: start; }
  .avatar-img { margin: 0; }
  .intro { grid-template-columns: 1fr; gap: 2rem; padding: 3.5rem 0; }
  .section-head { margin-top: 4rem; }
  .grid { grid-template-columns: 1fr; }
  .card, .card:nth-child(odd), .card:nth-child(even) { border-right: 0; padding: 1.5rem 0; grid-template-columns: 7rem 1fr; }
  .article { margin: 3rem auto; }
  .article-layout { display: block; margin: 3rem 0; }
  .article-layout .article { margin-top: 3rem; }
  .toc { position: static; max-height: none; overflow: visible; padding: 1.25rem; background: var(--panel); }
  .toc-title { color: var(--ink); }
  .toc ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 1rem; }
  .toc li { border-left: 0; border-bottom: 1px solid var(--line); }
  .toc li.toc-level-3 a, .toc a { padding: 0.65rem 0; }
  .article-spacer { display: none; }
  .site-footer { flex-direction: column; }
}

@media (max-width: 420px) {
  .actions { align-items: stretch; flex-direction: column; }
  .button { justify-content: center; }
  .card, .card:nth-child(odd), .card:nth-child(even) { grid-template-columns: 1fr; }
  .card-media { aspect-ratio: 16 / 9; }
  .toc ol { grid-template-columns: 1fr; }
}

@media (min-width: 761px) and (max-width: 1120px) {
  .article-layout { grid-template-columns: 190px minmax(0, 760px); gap: 2.5rem; }
  .article-spacer { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition-duration: 0.01ms !important; }
}
`;

const BaseLayout = (title: string, content: string, config: SiteConfig, path: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${config.title}</title>
  <meta name="description" content="${config.description}">
  <style>${styles}</style>
</head>
<body>
  <header class="site-header">
    <a href="/" class="logo"><span class="logo-mark">S/</span> Stephan van Stekelenburg</a>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/" class="${path === '/' ? 'active' : ''}">Home</a></li>
        <li><a href="/blog" class="${path.startsWith('/blog') ? 'active' : ''}">Blog</a></li>
        <li><a href="/work" class="${path.startsWith('/work') ? 'active' : ''}">Work</a></li>
      </ul>
    </nav>
  </header>
  <main>
    ${content}
  </main>
  <footer class="site-footer">
    <span>&copy; ${new Date().getFullYear()} ${config.author}</span>
    <span>Software architecture / distributed systems / engineering</span>
  </footer>
</body>
</html>
`;

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createTableOfContents(content: string) {
  const usedIds = new Map<string, number>();
  const headings: Array<{ level: number; id: string; title: string }> = [];

  const contentWithIds = content.replace(/<h([23])>(.*?)<\/h\1>/g, (_match, level, title) => {
    const plainTitle = title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
    const baseId = plainTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
    const count = usedIds.get(baseId) ?? 0;
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

    usedIds.set(baseId, count + 1);
    headings.push({ level: Number(level), id, title: plainTitle });
    return `<h${level} id="${id}">${title}</h${level}>`;
  });

  const navigation = headings.length > 0 ? `
    <nav class="toc" aria-label="On this page">
      <p class="toc-title">On this page</p>
      <ol>
        ${headings.map(heading => `<li class="toc-level-${heading.level}"><a href="#${heading.id}" data-toc-link="${heading.id}">${heading.title}</a></li>`).join('')}
      </ol>
    </nav>
  ` : '';

  return { contentWithIds, navigation };
}

const tableOfContentsScript = `
  <script>
    const tocLinks = [...document.querySelectorAll('[data-toc-link]')];
    const sections = tocLinks.map(link => document.getElementById(link.dataset.tocLink)).filter(Boolean);

    if (sections.length) {
      const setActiveSection = (id) => tocLinks.forEach(link => link.classList.toggle('active', link.dataset.tocLink === id));
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      }, { rootMargin: '-10% 0px -75% 0px' });

      sections.forEach(section => observer.observe(section));
      setActiveSection(sections[0].id);
    }
  </script>
`;

export const HomeTemplate = (content: ContentItem, posts: ContentItem[], works: ContentItem[], config: SiteConfig) => {
  const recentPosts = posts.slice(0, 3);
  const recentWorks = works.slice(0, 2);
  
  const hero = `
    <section class="hero">
      <div>
        <p class="hero-kicker">Independent software architect · Netherlands</p>
        <h1>${content.frontmatter.title}</h1>
        <p class="hero-summary">${content.frontmatter.excerpt}</p>
        <div class="actions">
          <a class="button button-primary" href="/work">View selected work</a>
          <a class="button" href="mailto:stephan@hayman.io">Start a conversation</a>
        </div>
      </div>
      <aside class="hero-aside">
        <img src="/assets/stephanvs.png" width="512" height="512" alt="Portrait of Stephan van Stekelenburg" class="avatar-img">
        <p>Architecture should make change less expensive, not merely make diagrams more impressive.</p>
      </aside>
    </section>
    <section class="intro">
      <p class="section-kicker">Approach / 01</p>
      <div class="intro-copy">${content.content}</div>
    </section>
  `;

  const postList = `
    <div class="section-head"><div><p class="section-kicker">Writing / 02</p><h2>Ideas in practice</h2></div><a class="section-link" href="/blog">All writing →</a></div>
    <div class="grid">
      ${recentPosts.map(post => `
        <a href="/blog/${post.slug}/" class="card">
          ${post.frontmatter.image ? `<span class="card-media"><img src="/blog/${post.slug}/${post.frontmatter.image.replace('./', '')}" alt="" loading="lazy"></span>` : ''}
          <span><small>${formatDate(post.frontmatter.date)}</small><h3>${post.frontmatter.title}</h3><p>${post.frontmatter.excerpt || ''}</p></span>
        </a>
      `).join('')}
    </div>
  `;

  const workList = `
    <div class="section-head"><div><p class="section-kicker">Selected work / 03</p><h2>Systems at scale</h2></div><a class="section-link" href="/work">All work →</a></div>
    <div class="grid">
      ${recentWorks.map(work => `
        <a href="/work/${work.slug}/" class="card">
          ${work.frontmatter.image ? `<span class="card-media"><img src="/work/${work.slug}/${work.frontmatter.image.replace('./', '')}" alt="" loading="lazy"></span>` : ''}
          <span><small>Case study</small><h3>${work.frontmatter.title}</h3><p>${work.frontmatter.excerpt || work.frontmatter.description || ''}</p></span>
        </a>
      `).join('')}
    </div>
  `;

  return BaseLayout('Home', hero + postList + workList, config, '/');
};

export const PostTemplate = (item: ContentItem, config: SiteConfig) => {
  const meta = `<span class="post-meta">${formatDate(item.frontmatter.date)} ${item.frontmatter.tags ? `· ${item.frontmatter.tags.join(', ')}` : ''}</span>`;
  const { contentWithIds, navigation } = createTableOfContents(item.content);
  const article = `<div class="article-layout">${navigation}<article class="article"><h1>${item.frontmatter.title}</h1>${meta}${contentWithIds}</article><div class="article-spacer" aria-hidden="true"></div></div>${tableOfContentsScript}`;
  return BaseLayout(item.frontmatter.title, article, config, `/blog/${item.slug}`);
};

export const ProjectTemplate = (item: ContentItem, config: SiteConfig) => {
  return BaseLayout(item.frontmatter.title, `<article class="article"><h1>${item.frontmatter.title}</h1>${item.content}</article>`, config, `/work/${item.slug}`);
};

export const ListTemplate = (title: string, items: ContentItem[], config: SiteConfig, path: string) => {
  const list = `<section class="article">
    <h1>${title}</h1>
    <div class="grid">
      ${items.map(item => `
        <a href="${path}/${item.slug}/" class="card">
          ${item.frontmatter.image ? `<span class="card-media"><img src="${path}/${item.slug}/${item.frontmatter.image.replace('./', '')}" alt="" loading="lazy"></span>` : ''}
          <span>${item.frontmatter.date ? `<small>${formatDate(item.frontmatter.date)}</small>` : '<small>Case study</small>'}<h3>${item.frontmatter.title}</h3><p>${item.frontmatter.excerpt || item.frontmatter.description || ''}</p></span>
        </a>
      `).join('')}
    </div>
  </section>`;
  return BaseLayout(title, list, config, path);
};

export const PageTemplate = (item: ContentItem, config: SiteConfig) => {
  return BaseLayout(item.frontmatter.title, `<article class="article"><h1>${item.frontmatter.title}</h1>${item.content}</article>`, config, `/${item.slug}`);
};
