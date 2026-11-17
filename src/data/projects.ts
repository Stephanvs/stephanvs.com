export type Href = `/${string}` | `https://${string}`;

export interface ProjectLink {
  label: string;
  href: Href;
}

export interface Project {
  name: string;
  kind: string;
  stack: string;
  summary: string;
  links: readonly [ProjectLink, ...ProjectLink[]];
}

export const projects: readonly Project[] = [
  {
    name: 'Popcorn for TeamCity',
    kind: 'iOS app',
    stack: 'Swift',
    summary: 'Check, start, and cancel TeamCity builds from your iPhone and iPad.',
    links: [
      { label: 'Project page', href: '/popcorn/' },
      { label: 'App Store', href: 'https://apps.apple.com/app/id6819589996' }
    ]
  },
  {
    name: 'hypr',
    kind: 'Command-line tool',
    stack: 'C#',
    summary: 'Create, switch, and clean up git worktrees with one command. Each worktree opens in a new terminal tab.',
    links: [
      { label: 'GitHub', href: 'https://github.com/Stephanvs/hypr' },
      { label: 'NuGet', href: 'https://www.nuget.org/packages/hypr' }
    ]
  },
  {
    name: 'OpenSpeak',
    kind: 'Command-line tool',
    stack: 'Rust',
    summary: 'Text to speech from your terminal. Speak text aloud or save it to a file, with Grok Voice or ElevenLabs.',
    links: [
      { label: 'Website', href: 'https://openspeak.sh' },
      { label: 'GitHub', href: 'https://github.com/Stephanvs/OpenSpeak' }
    ]
  },
  {
    name: 'Archevolt',
    kind: '.NET library',
    stack: 'C#',
    summary: 'A headless archetype ECS for high-performance .NET. A source generator builds typed queries, bundles, and schedules.',
    links: [
      { label: 'Website', href: 'https://archevolt.dev' },
      { label: 'GitHub', href: 'https://github.com/Stephanvs/archevolt' },
      { label: 'NuGet', href: 'https://www.nuget.org/packages/Archevolt' }
    ]
  }
];
