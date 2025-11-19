import type { ContentItem, SiteConfig } from './types';

const styles = `
:root {
  --bg: #0f0f0f;
  --text: #e0e0e0;
  --accent: #00ff9d;
  --secondary: #888;
  --code-bg: #1a1a1a;
  --link: #00ff9d;
  --font-mono: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  line-height: 1.6;
  font-size: 16px;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

a { color: var(--link); text-decoration: none; border-bottom: 1px dashed var(--link); transition: opacity 0.2s; }
a:hover { opacity: 0.8; border-bottom-style: solid; }

header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; }
.logo { font-weight: bold; font-size: 1.2rem; border: none; }
.logo:hover { border: none; opacity: 0.8; }

nav ul { display: flex; list-style: none; gap: 1.5rem; }
nav li a { border: none; color: var(--secondary); }
nav li a:hover, nav li a.active { color: var(--text); }

h1, h2, h3 { margin-top: 2rem; margin-bottom: 1rem; line-height: 1.2; }
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; color: var(--accent); border-bottom: 1px solid var(--code-bg); padding-bottom: 0.5rem; }

p { margin-bottom: 1.5rem; }

code { background: var(--code-bg); padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
pre { background: var(--code-bg); padding: 1rem; overflow-x: auto; border-radius: 5px; margin-bottom: 1.5rem; }
pre code { background: none; padding: 0; }

img { max-width: 100%; height: auto; border-radius: 5px; display: block; margin: 1.5rem 0; }

.post-meta { color: var(--secondary); font-size: 0.9rem; margin-bottom: 2rem; display: block; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
.card { border: 1px solid var(--code-bg); padding: 1.5rem; border-radius: 5px; transition: transform 0.2s, border-color 0.2s; display: block; text-decoration: none; }
.card:hover { transform: translateY(-2px); border-color: var(--accent); }
.card h3 { margin-top: 0; font-size: 1.2rem; color: var(--text); }
.card p { font-size: 0.9rem; color: var(--secondary); margin-bottom: 0; }

.avatar-container { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap; }
.avatar-img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent); }
.bio { flex: 1; }

footer { margin-top: 4rem; border-top: 1px solid var(--code-bg); padding-top: 2rem; color: var(--secondary); font-size: 0.9rem; text-align: center; }
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
  <header>
    <a href="/" class="logo">~/stephanvs</a>
    <nav>
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
  <footer>
    &copy; ${new Date().getFullYear()} ${config.author}. Built with Bun & TypeScript.
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

export const HomeTemplate = (content: ContentItem, posts: ContentItem[], works: ContentItem[], config: SiteConfig) => {
  const recentPosts = posts.slice(0, 3);
  const recentWorks = works.slice(0, 2);
  
  // Hacky but effective: Replace the <Avatar /> placeholder if it exists in the compiled HTML or handle it in the build step. 
  // We'll assume the content is already cleaned up or we inject the avatar manually.
  
  const hero = `
    <div class="avatar-container">
      <img src="/assets/stephanvs.png" alt="Stephanvs" class="avatar-img">
      <div class="bio">
        <h1>${content.frontmatter.title}</h1>
        <p>${content.frontmatter.excerpt}</p>
      </div>
    </div>
    <div>${content.content}</div>
  `;

  const postList = `
    <h2>Recent Posts</h2>
    <div class="grid">
      ${recentPosts.map(post => `
        <a href="/blog/${post.slug}/" class="card">
          <h3>${post.frontmatter.title}</h3>
          <p>${formatDate(post.frontmatter.date)}</p>
        </a>
      `).join('')}
    </div>
    <p style="margin-top: 1rem;"><a href="/blog">View all posts →</a></p>
  `;

  const workList = `
    <h2>Recent Work</h2>
    <div class="grid">
      ${recentWorks.map(work => `
        <a href="/work/${work.slug}/" class="card">
          <h3>${work.frontmatter.title}</h3>
          <p>${work.frontmatter.excerpt || work.frontmatter.description || ''}</p>
        </a>
      `).join('')}
    </div>
    <p style="margin-top: 1rem;"><a href="/work">View all work →</a></p>
  `;

  return BaseLayout('Home', hero + postList + workList, config, '/');
};

export const PostTemplate = (item: ContentItem, config: SiteConfig) => {
  const meta = `<span class="post-meta">${formatDate(item.frontmatter.date)} ${item.frontmatter.tags ? `· ${item.frontmatter.tags.join(', ')}` : ''}</span>`;
  return BaseLayout(item.frontmatter.title, `<h1>${item.frontmatter.title}</h1>${meta}${item.content}`, config, `/blog/${item.slug}`);
};

export const ProjectTemplate = (item: ContentItem, config: SiteConfig) => {
  return BaseLayout(item.frontmatter.title, `<h1>${item.frontmatter.title}</h1>${item.content}`, config, `/work/${item.slug}`);
};

export const ListTemplate = (title: string, items: ContentItem[], config: SiteConfig, path: string) => {
  const list = `
    <h1>${title}</h1>
    <div class="grid">
      ${items.map(item => `
        <a href="${path}/${item.slug}/" class="card">
          <h3>${item.frontmatter.title}</h3>
          <p>${item.frontmatter.excerpt || item.frontmatter.description || ''}</p>
          ${item.frontmatter.date ? `<small>${formatDate(item.frontmatter.date)}</small>` : ''}
        </a>
      `).join('')}
    </div>
  `;
  return BaseLayout(title, list, config, path);
};

export const PageTemplate = (item: ContentItem, config: SiteConfig) => {
  return BaseLayout(item.frontmatter.title, `<h1>${item.frontmatter.title}</h1>${item.content}`, config, `/${item.slug}`);
};
