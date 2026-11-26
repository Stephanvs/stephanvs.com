import type { ProjectGlyphName } from './project-glyphs';

export type Href = `/${string}` | `https://${string}`;

export interface ProjectLink {
  label: string;
  href: Href;
}

export interface Project {
  name: string;
  kind: string;
  stack?: string;
  summary: string;
  glyph: ProjectGlyphName;
  links: readonly [ProjectLink, ...ProjectLink[]];
}

export function destination(href: Href) {
  return href.startsWith('/')
    ? { arrow: '→', attrs: {} }
    : { arrow: '↗', attrs: { target: '_blank', rel: 'noopener noreferrer' } };
}

export const projectLabel = ({ kind, stack }: Project) => (stack ? `${kind} / ${stack}` : kind);

export const projects: readonly Project[] = [
  {
    name: 'Canopy',
    kind: 'Desktop app',
    stack: 'Odin',
    summary: 'See your whole codebase from above. Canopy parses a git repository and draws every function, method, and type as one graph. In development, with a waitlist open.',
    glyph: 'canopy',
    links: [{ label: 'Website', href: 'https://canopy.party' }]
  },
  {
    name: 'Archevolt',
    kind: '.NET library',
    stack: 'C#',
    summary: 'A headless archetype ECS for high-performance .NET. A source generator builds typed queries, bundles, and schedules.',
    glyph: 'archevolt',
    links: [
      { label: 'Website', href: 'https://archevolt.dev' },
      { label: 'GitHub', href: 'https://github.com/Stephanvs/archevolt' },
      { label: 'NuGet', href: 'https://www.nuget.org/packages/Archevolt' }
    ]
  },
  {
    name: 'OpenSpeak',
    kind: 'Command-line tool',
    stack: 'Rust',
    summary: 'Text to speech from your terminal. Speak text aloud or save it to a file, with Grok Voice or ElevenLabs.',
    glyph: 'openspeak',
    links: [
      { label: 'Website', href: 'https://openspeak.sh' },
      { label: 'GitHub', href: 'https://github.com/Stephanvs/OpenSpeak' }
    ]
  },
  {
    name: 'Difftastic',
    kind: 'Web app',
    stack: 'TypeScript',
    summary: 'A read-only pull request viewer. Paste a GitHub or Bitbucket Cloud PR link and review the diff without the ceremony.',
    glyph: 'difftastic',
    links: [{ label: 'Website', href: 'https://difftastic.dev' }]
  },
  {
    name: 'hypr',
    kind: 'Command-line tool',
    stack: 'C#',
    summary: 'Create, switch, and clean up git worktrees with one command. Each worktree opens in a new terminal tab.',
    glyph: 'hypr',
    links: [
      { label: 'GitHub', href: 'https://github.com/Stephanvs/hypr' },
      { label: 'NuGet', href: 'https://www.nuget.org/packages/hypr' }
    ]
  },
  {
    name: 'd2lang-cs',
    kind: '.NET library',
    stack: 'C#',
    summary: 'Build D2 diagrams from typed C# objects. It writes the .d2 source, and you render it with the D2 CLI.',
    glyph: 'd2lang',
    links: [
      { label: 'GitHub', href: 'https://github.com/Stephanvs/d2lang-cs' },
      { label: 'NuGet', href: 'https://www.nuget.org/packages/d2lang-cs' }
    ]
  },
  {
    name: 'Clack',
    kind: 'Windows app',
    summary: 'Mechanical keyboard sounds for any keyboard. A tray app that plays switch, typewriter, or mouse click sounds as you type.',
    glyph: 'clack',
    links: [{ label: 'Website', href: 'https://clacky.xyz' }]
  },
  {
    name: 'Popcorn for TeamCity',
    kind: 'iOS app',
    stack: 'Swift',
    summary: 'Check, start, and cancel TeamCity builds from your iPhone and iPad.',
    glyph: 'popcorn',
    links: [
      { label: 'Project page', href: '/popcorn/' },
      { label: 'App Store', href: 'https://apps.apple.com/app/id6819589996' }
    ]
  }
];
