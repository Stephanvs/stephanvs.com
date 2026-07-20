import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '*/index.mdx', base: './content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: image()
  })
});

const work = defineCollection({
  loader: glob({ pattern: '*/index.mdx', base: './content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    url: z.url().optional(),
    image: image()
  })
});

const pages = defineCollection({
  loader: glob({ pattern: '*/index.mdx', base: './content/pages' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    is_front: z.boolean().optional()
  })
});

export const collections = { pages, posts, work };
