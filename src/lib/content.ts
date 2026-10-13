import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import periodicTablePreview from '../assets/periodic-table-of-software-architecture.png';
import languageSpectrumPreview from '../assets/periodic-table-of-software-architecture.png';

export interface PostSummary {
  href: string;
  title: string;
  excerpt: string;
  date: Date;
  image: ImageMetadata;
}

export const periodicTablePost: PostSummary = {
  href: '/periodic-table-of-software-architecture/',
  title: 'The Periodic Table of Software Architecture',
  excerpt: 'Ninety-two architectural patterns, principles, and practices arranged as a periodic table you can explore.',
  date: new Date('2026-10-12'),
  image: periodicTablePreview
};

export const languageSpectrumPost: PostSummary = {
  href: '/grand-programming-languages-spectrum/',
  title: 'The Grand Programming Languages Spectrum',
  excerpt: 'Twenty-five languages scored on eleven facets and cross-checked against seven popularity rankings, with charts you can explore.',
  date: new Date('2026-10-12'),
  image: languageSpectrumPreview
};

export function contentSlug(id: string) {
  return id.replace(/\/index$/, '');
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export async function getPostSummaries(): Promise<PostSummary[]> {
  const posts = (await getCollection('posts')).map((post) => ({
    href: `/blog/${contentSlug(post.id)}/`,
    title: post.data.title,
    excerpt: post.data.excerpt,
    date: post.data.date,
    image: post.data.image
  }));

  return [...posts, languageSpectrumPost, periodicTablePost].sort((a, b) => b.date.getTime() - a.date.getTime());
}
