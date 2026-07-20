import { marked } from 'marked';
import matter from 'gray-matter';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HomeTemplate, ListTemplate, PageTemplate, PostTemplate, ProjectTemplate } from './templates';
import type { ContentItem, SiteConfig } from './types';

const CONFIG: SiteConfig = {
  title: 'Stephan van Stekelenburg',
  description: 'Independent software architect & developer',
  author: 'Stephan van Stekelenburg',
  baseUrl: 'https://stephanvs.com'
};

const CONTENT_DIR = path.resolve('content');
const PUBLIC_DIR = path.resolve('public');

async function build() {
  console.log('🚀 Starting build...');

  // Clean and create public dir
  await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(path.join(PUBLIC_DIR, 'assets'), { recursive: true });
  await fs.mkdir(path.join(PUBLIC_DIR, 'blog'), { recursive: true });
  await fs.mkdir(path.join(PUBLIC_DIR, 'work'), { recursive: true });

  // Copy global assets
  // Try to copy avatar if it exists in expected location
  const avatarSrc = path.join(CONTENT_DIR, 'pages/home/stephanvs.png');
  try {
    await fs.copyFile(avatarSrc, path.join(PUBLIC_DIR, 'assets/stephanvs.png'));
  } catch (e) {
    console.warn('Warning: Avatar not found at', avatarSrc);
  }

  const posts: ContentItem[] = [];
  const works: ContentItem[] = [];
  let homePage: ContentItem | null = null;

  // Process Posts
  const postDirs = await glob('posts/*/', { cwd: CONTENT_DIR });
  for (const dir of postDirs) {
    const slug = path.basename(dir);
    const dirPath = path.join(CONTENT_DIR, dir);
    const mdFile = path.join(dirPath, 'index.mdx');
    
    if (await fileExists(mdFile)) {
      const item = await processContent(mdFile, slug, 'post', path.join(PUBLIC_DIR, 'blog', slug));
      posts.push(item);
    }
  }

  // Process Work
  const workDirs = await glob('work/*/', { cwd: CONTENT_DIR });
  for (const dir of workDirs) {
    const slug = path.basename(dir);
    const dirPath = path.join(CONTENT_DIR, dir);
    const mdFile = path.join(dirPath, 'index.mdx');
    
    if (await fileExists(mdFile)) {
      const item = await processContent(mdFile, slug, 'project', path.join(PUBLIC_DIR, 'work', slug));
      works.push(item);
    }
  }

  // Process Home
  const homeFile = path.join(CONTENT_DIR, 'pages/home/index.mdx');
  if (await fileExists(homeFile)) {
    homePage = await processContent(homeFile, '', 'page', PUBLIC_DIR, false);
  }

  // Process 404
  const notFoundFile = path.join(CONTENT_DIR, 'pages/404/index.mdx');
  if (await fileExists(notFoundFile)) {
      const notFoundPage = await processContent(notFoundFile, '404', 'page', path.join(PUBLIC_DIR, '404'));
      const html = PageTemplate(notFoundPage, CONFIG);
      // Write to 404.html at root for most static hosts
      await fs.writeFile(path.join(PUBLIC_DIR, '404.html'), html);
  }

  // Sort posts by date
  posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date || 0).getTime();
    const dateB = new Date(b.frontmatter.date || 0).getTime();
    return dateB - dateA;
  });

  // Generate Pages
  if (homePage) {
    const html = HomeTemplate(homePage, posts, works, CONFIG);
    await fs.writeFile(path.join(PUBLIC_DIR, 'index.html'), html);
  }

  for (const post of posts) {
    const html = PostTemplate(post, CONFIG);
    await fs.writeFile(path.join(PUBLIC_DIR, 'blog', post.slug, 'index.html'), html);
  }

  for (const work of works) {
    const html = ProjectTemplate(work, CONFIG);
    await fs.writeFile(path.join(PUBLIC_DIR, 'work', work.slug, 'index.html'), html);
  }

  // Generate Index Pages
  const blogIndex = ListTemplate('Blog', posts, CONFIG, '/blog');
  await fs.writeFile(path.join(PUBLIC_DIR, 'blog/index.html'), blogIndex);

  const workIndex = ListTemplate('Work', works, CONFIG, '/work');
  await fs.writeFile(path.join(PUBLIC_DIR, 'work/index.html'), workIndex);

  console.log('✅ Build complete!');
}

async function processContent(filePath: string, slug: string, type: 'post' | 'project' | 'page', outDir: string, copyAssets = true): Promise<ContentItem> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  // Clean content (remove React imports and components)
  let cleanContent = content
    .replace(/import .* from .*/g, '')
    .replace(/<Avatar \/>/g, '')
    .replace(/<p align="left">[\s\S]*?<\/p>/g, ''); // Remove trophies for cleaner look if desired, or keep them. User asked for clean.

  // Fix image paths (./image.png -> image.png)
  // Also support simple filenames. We'll prepend the URL path for absolute referencing.
  // For posts/projects, the path is /type/slug/image.png
  // For home/pages, it depends.
  
  let urlPath = '';
  if (type === 'post') urlPath = `/blog/${slug}/`;
  else if (type === 'project') urlPath = `/work/${slug}/`;
  else if (type === 'page' && slug !== '') urlPath = `/${slug}/`;
  // If home page or root assets, handling might be different, but for now let's focus on posts/projects which have subdirs.

  // Replace ./image.png with /path/to/image.png
  cleanContent = cleanContent.replace(/!\[(.*?)\]\(\.\/(.*?)\)/g, (match, alt, src) => {
    return `![${alt}](${urlPath}${src})`;
  });
  
  // Replace image.png (without ./) if it doesn't start with http or /
  cleanContent = cleanContent.replace(/!\[(.*?)\]\((?!http|\/|\.)(.*?)\)/g, (match, alt, src) => {
    return `![${alt}](${urlPath}${src})`;
  });

  const html = await marked.parse(cleanContent);

  if (copyAssets) {
    await fs.mkdir(outDir, { recursive: true });
    // Copy all non-mdx files from source dir to outDir
    const sourceDir = path.dirname(filePath);
    const files = await fs.readdir(sourceDir);
    for (const file of files) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) {
        await fs.copyFile(path.join(sourceDir, file), path.join(outDir, file));
      }
    }
  }

  return {
    slug,
    frontmatter: data as any,
    content: html,
    type
  };
}

async function fileExists(path: string) {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}

build().catch(console.error);
