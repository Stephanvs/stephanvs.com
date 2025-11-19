export interface Frontmatter {
  title: string;
  date?: string;
  excerpt?: string;
  description?: string;
  tags?: string[];
  image?: string;
  is_front?: boolean;
}

export interface ContentItem {
  slug: string;
  frontmatter: Frontmatter;
  content: string; // HTML content
  type: 'post' | 'project' | 'page';
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  baseUrl: string;
}
