import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import periodicTablePreview from '../assets/periodic-table-of-software-architecture.png';
import languageSpectrumPreview from '../assets/grand-programming-languages-spectrum.png';
import kalmanGuidePreview from '../assets/kalman-algorithm-interactive-guide.png';
import kalmanGuideDarkPreview from '../assets/kalman-algorithm-interactive-guide-dark.png';

export interface PostSummary {
  href: string;
  title: string;
  excerpt: string;
  date: Date;
  image: ImageMetadata;
  darkImage?: ImageMetadata;
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
  excerpt: 'Twenty-seven languages scored on eleven facets and cross-checked against seven popularity rankings, with charts you can explore.',
  date: new Date('2026-10-12'),
  image: languageSpectrumPreview
};

export const kalmanGuidePost: PostSummary = {
  href: '/kalman-algorithm-interactive-guide/',
  title: 'An Interactive Guide through the Kalman Algorithm',
  excerpt: 'Build the Kalman filter in TypeScript one idea at a time, from a single noisy altimeter to an aircraft you can scrub through in 3D.',
  date: new Date('2026-10-29'),
  image: kalmanGuidePreview,
  darkImage: kalmanGuideDarkPreview
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

  return [...posts, kalmanGuidePost, languageSpectrumPost, periodicTablePost].sort((a, b) => b.date.getTime() - a.date.getTime());
}
