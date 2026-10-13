export type FamilyKey = 'systems' | 'application' | 'web' | 'dynamic' | 'scientific' | 'functional';

export type FacetKey =
  | 'performance'
  | 'safety'
  | 'approachability'
  | 'expressiveness'
  | 'concurrency'
  | 'ecosystem'
  | 'tooling'
  | 'reach'
  | 'stability'
  | 'jobs'
  | 'momentum';

export type DomainKey =
  | 'backend'
  | 'frontend'
  | 'mobile'
  | 'desktop'
  | 'games'
  | 'systems'
  | 'embedded'
  | 'data'
  | 'science'
  | 'cli'
  | 'distributed'
  | 'scripting';

export type SourceKey = 'tiobe' | 'pypl' | 'redmonk' | 'ieee' | 'octoverse' | 'jetbrains' | 'stackoverflow';

export type TypingKind = 'static' | 'gradual' | 'dynamic';
export type MemoryKind = 'manual' | 'ownership' | 'arc' | 'gc';
export type RuntimeKind = 'native' | 'managed' | 'interpreted';
export type Fit = 1 | 2 | 3;

export interface Family {
  key: FamilyKey;
  name: string;
  blurb: string;
  fill: string;
  ink: string;
}

export interface Facet {
  key: FacetKey;
  name: string;
  question: string;
  low: string;
  high: string;
  basis: string;
}

export interface Language {
  id: string;
  symbol: string;
  name: string;
  family: FamilyKey;
  year: number;
  creator: string;
  tagline: string;
  typingKind: TypingKind;
  typing: string;
  memoryKind: MemoryKind;
  memory: string;
  runtimeKind: RuntimeKind;
  runtime: string;
  concurrency: string;
  nulls: string;
  paradigms: string[];
  packages: string;
  domains: Partial<Record<DomainKey, Fit>>;
  influences: string[];
  scores: Record<FacetKey, number>;
  ranks: Partial<Record<SourceKey, number>>;
  usage: number;
  admired: number;
}

export interface Ancestor {
  id: string;
  name: string;
  year: number;
  family: FamilyKey;
}

export interface Source {
  key: SourceKey;
  name: string;
  short: string;
  measures: string;
  edition: string;
  url: string;
}

export const families: Family[] = [
  { key: 'systems', name: 'Systems', blurb: 'You manage memory, or the compiler proves you did.', fill: '#3f3a36', ink: '#f5efe6' },
  { key: 'application', name: 'Application', blurb: 'Compiled, statically typed, memory managed for you.', fill: '#bccfe8', ink: '#1d3557' },
  { key: 'web', name: 'Web platform', blurb: 'Born in, or for, the browser and the web server.', fill: '#f1dfa6', ink: '#5c4108' },
  { key: 'dynamic', name: 'Dynamic', blurb: 'Optimised for the programmer’s time over the machine’s.', fill: '#b5dcd2', ink: '#134e48' },
  { key: 'scientific', name: 'Scientific', blurb: 'Arrays, statistics, and notebooks first.', fill: '#d2e3a9', ink: '#3f5212' },
  { key: 'functional', name: 'Functional', blurb: 'Immutable data, with functions as the unit of design.', fill: '#d9c6e3', ink: '#4b2660' }
];

export const facets: Facet[] = [
  {
    key: 'performance',
    name: 'Performance',
    question: 'How fast and lean is typical, idiomatic code?',
    low: 'Slower',
    high: 'Faster',
    basis: 'The Computer Language Benchmarks Game, Pereira et al.’s energy-efficiency study, and the runtime model (AOT, JIT, or interpreter).'
  },
  {
    key: 'safety',
    name: 'Safety',
    question: 'How many whole classes of bugs does it rule out by default?',
    low: 'Trusts you',
    high: 'Protects you',
    basis: 'Memory safety, null safety, soundness of the type system, and protection against data races, weighted in that order.'
  },
  {
    key: 'approachability',
    name: 'Approachability',
    question: 'How quickly does a newcomer become productive?',
    low: 'Steep',
    high: 'Gentle',
    basis: 'Size of the language, number of concepts needed for a first useful program, quality of error messages and learning material.'
  },
  {
    key: 'expressiveness',
    name: 'Expressiveness',
    question: 'How much can you say with how little?',
    low: 'Plain',
    high: 'Powerful',
    basis: 'Abstraction mechanisms (generics, type classes, macros, pattern matching, higher-order functions) and how concise idiomatic code is.'
  },
  {
    key: 'concurrency',
    name: 'Concurrency',
    question: 'How well does it handle many things at once?',
    low: 'Awkward',
    high: 'Native',
    basis: 'The concurrency model, how safe it is by default, and whether it scales across cores without heroics.'
  },
  {
    key: 'ecosystem',
    name: 'Ecosystem',
    question: 'Is there already a good library for that?',
    low: 'Thin',
    high: 'Vast',
    basis: 'Breadth and maturity of packages and frameworks, including access to a host platform such as the JVM, .NET, or C libraries.'
  },
  {
    key: 'tooling',
    name: 'Tooling',
    question: 'How good is the out-of-the-box developer experience?',
    low: 'Assemble it',
    high: 'Batteries in',
    basis: 'Official build tool, package manager, formatter, test runner, language server, and debugger, and how well they fit together.'
  },
  {
    key: 'reach',
    name: 'Reach',
    question: 'How many places can it run?',
    low: 'One niche',
    high: 'Everywhere',
    basis: 'Practical targets: servers, browsers, iOS, Android, desktops, microcontrollers, WebAssembly, and embedding in other programs.'
  },
  {
    key: 'stability',
    name: 'Stability',
    question: 'Will code from five years ago still build and run?',
    low: 'Moving target',
    high: 'Rock solid',
    basis: 'Backward-compatibility record, release discipline, governance, and how disruptive recent migrations were.'
  },
  {
    key: 'jobs',
    name: 'Jobs',
    question: 'How many people get paid to write it?',
    low: 'Niche',
    high: 'Everywhere',
    basis: 'IEEE Spectrum’s jobs ranking and job-board volume, adjusted for how often the language is the main skill rather than a side requirement.'
  },
  {
    key: 'momentum',
    name: 'Momentum',
    question: 'Is it growing or fading?',
    low: 'Fading',
    high: 'Rising',
    basis: 'Change over the last three years across TIOBE, PYPL, RedMonk, GitHub contributor counts, and developer surveys.'
  }
];

export const domainLabels: Record<DomainKey, string> = {
  backend: 'Web backends & APIs',
  frontend: 'Web frontends',
  mobile: 'Mobile apps',
  desktop: 'Desktop apps',
  games: 'Games',
  systems: 'Systems & OS',
  embedded: 'Embedded & IoT',
  data: 'Data & ML',
  science: 'Scientific computing',
  cli: 'CLIs & DevOps',
  distributed: 'Distributed & real-time',
  scripting: 'Scripting & automation'
};

export const typingLabels: Record<TypingKind, string> = {
  static: 'Static',
  gradual: 'Gradual',
  dynamic: 'Dynamic'
};

export const memoryLabels: Record<MemoryKind, string> = {
  manual: 'Manual',
  ownership: 'Ownership',
  arc: 'Reference counting',
  gc: 'Garbage collected'
};

export const runtimeLabels: Record<RuntimeKind, string> = {
  native: 'Native code',
  managed: 'Managed runtime',
  interpreted: 'Interpreter'
};

export const ancestors: Ancestor[] = [
  { id: 'lisp', name: 'Lisp', year: 1958, family: 'functional' },
  { id: 'algol', name: 'ALGOL 60', year: 1960, family: 'systems' },
  { id: 'simula', name: 'Simula', year: 1967, family: 'application' },
  { id: 'pascal', name: 'Pascal', year: 1970, family: 'application' },
  { id: 'smalltalk', name: 'Smalltalk', year: 1972, family: 'dynamic' },
  { id: 'prolog', name: 'Prolog', year: 1972, family: 'functional' },
  { id: 'ml', name: 'ML', year: 1973, family: 'functional' },
  { id: 'scheme', name: 'Scheme', year: 1975, family: 'functional' },
  { id: 's', name: 'S', year: 1976, family: 'scientific' },
  { id: 'objc', name: 'Objective-C', year: 1984, family: 'application' },
  { id: 'miranda', name: 'Miranda', year: 1985, family: 'functional' },
  { id: 'perl', name: 'Perl', year: 1987, family: 'dynamic' },
  { id: 'self', name: 'Self', year: 1987, family: 'dynamic' },
  { id: 'abc', name: 'ABC', year: 1987, family: 'dynamic' }
];

export const popularitySources: Source[] = [
  {
    key: 'tiobe', name: 'TIOBE Index', short: 'TIOBE', edition: 'Oct 2026',
    measures: 'Search-engine results for “<language> programming”.',
    url: 'https://www.tiobe.com/tiobe-index/'
  },
  {
    key: 'pypl', name: 'PYPL PopularitY of Programming Language', short: 'PYPL', edition: 'Oct 2026',
    measures: 'Share of Google searches for “<language> tutorial”.',
    url: 'https://pypl.github.io/PYPL.html'
  },
  {
    key: 'redmonk', name: 'RedMonk Programming Language Rankings', short: 'RedMonk', edition: 'Jan 2026',
    measures: 'GitHub pull requests plotted against Stack Overflow tags.',
    url: 'https://redmonk.com/sogrady/2026/04/14/language-rankings-1-26/'
  },
  {
    key: 'ieee', name: 'IEEE Spectrum Top Programming Languages', short: 'IEEE', edition: '2025',
    measures: 'Seven weighted signals, from search and discussion to research papers and code.',
    url: 'https://spectrum.ieee.org/top-programming-languages-2025'
  },
  {
    key: 'octoverse', name: 'GitHub Octoverse', short: 'GitHub', edition: '2025',
    measures: 'Monthly active contributors on GitHub. Only the top ten are published.',
    url: 'https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/'
  },
  {
    key: 'jetbrains', name: 'JetBrains State of Developer Ecosystem', short: 'JetBrains', edition: '2025',
    measures: 'Share of 24,534 developers who used the language in the past year.',
    url: 'https://devecosystem-2025.jetbrains.com/'
  },
  {
    key: 'stackoverflow', name: 'Stack Overflow Developer Survey', short: 'Stack Overflow', edition: '2026',
    measures: 'Share of respondents who did extensive work in the language in the past year.',
    url: 'https://survey.stackoverflow.co/2026/technology'
  }
];

type LanguageSource = Omit<Language, 'scores'> & {
  scores: [number, number, number, number, number, number, number, number, number, number, number];
};

const facetOrder = facets.map((facet) => facet.key);

// Scores follow facet order: performance, safety, approachability, expressiveness, concurrency,
// ecosystem, tooling, reach, stability, jobs, momentum.
// Ranks are as published by each source. TIOBE only bands positions 51–100, stored here as 51.
const languageSources: LanguageSource[] = [
  {
    id: 'c', symbol: 'C', name: 'C', family: 'systems', year: 1972, creator: 'Dennis Ritchie, Bell Labs',
    tagline: 'Portable assembly, and the floor everything else stands on.',
    typingKind: 'static', typing: 'Static, weak; implicit conversions',
    memoryKind: 'manual', memory: 'Manual: malloc and free',
    runtimeKind: 'native', runtime: 'Compiled to native code',
    concurrency: 'OS threads and atomics (pthreads, C11 threads)',
    nulls: 'NULL pointers, unchecked',
    paradigms: ['Procedural', 'Imperative'],
    packages: 'None official; system packages, vcpkg, Conan',
    domains: { systems: 3, embedded: 3, games: 1, cli: 1 },
    influences: ['algol'],
    scores: [10, 1, 5, 2, 4, 9, 4, 10, 10, 6, 4],
    ranks: { tiobe: 2, pypl: 3, redmonk: 10, ieee: 8, jetbrains: 10, stackoverflow: 11 },
    usage: 21.8, admired: 45.9
  },
  {
    id: 'cpp', symbol: 'C++', name: 'C++', family: 'systems', year: 1985, creator: 'Bjarne Stroustrup, Bell Labs',
    tagline: 'Zero-cost abstractions, and every feature anyone ever asked for.',
    typingKind: 'static', typing: 'Static, mostly strong; templates',
    memoryKind: 'manual', memory: 'Manual, with RAII and smart pointers',
    runtimeKind: 'native', runtime: 'Compiled to native code',
    concurrency: 'Threads, atomics, futures, C++20 coroutines',
    nulls: 'nullptr, unchecked; std::optional available',
    paradigms: ['Multi-paradigm', 'Object-oriented', 'Generic', 'Procedural'],
    packages: 'None official; vcpkg, Conan, with CMake for builds',
    domains: { games: 3, systems: 3, embedded: 2, desktop: 2, science: 2, data: 1, backend: 1, distributed: 1 },
    influences: ['c', 'simula'],
    scores: [10, 2, 2, 7, 6, 9, 4, 9, 9, 8, 5],
    ranks: { tiobe: 3, pypl: 3, redmonk: 7, ieee: 3, octoverse: 8, jetbrains: 7, stackoverflow: 10 },
    usage: 24.3, admired: 45.8
  },
  {
    id: 'rust', symbol: 'Rs', name: 'Rust', family: 'systems', year: 2012, creator: 'Graydon Hoare; Mozilla Research',
    tagline: 'C++ performance, with a compiler that won’t let you shoot yourself.',
    typingKind: 'static', typing: 'Static, strong, inferred; traits',
    memoryKind: 'ownership', memory: 'Ownership and borrowing, checked at compile time',
    runtimeKind: 'native', runtime: 'Compiled to native code (LLVM)',
    concurrency: 'Threads and async/await; data races are compile errors',
    nulls: 'No null: Option<T>',
    paradigms: ['Multi-paradigm', 'Functional', 'Imperative', 'Generic'],
    packages: 'Cargo · crates.io',
    domains: { systems: 3, cli: 3, embedded: 2, backend: 2, distributed: 2, games: 1, frontend: 1, desktop: 1 },
    influences: ['cpp', 'ml', 'ocaml', 'haskell', 'erlang'],
    scores: [10, 10, 3, 8, 9, 7, 10, 9, 9, 5, 9],
    ranks: { tiobe: 10, pypl: 8, redmonk: 20, ieee: 14, jetbrains: 13, stackoverflow: 12 },
    usage: 18.0, admired: 67.4
  },
  {
    id: 'zig', symbol: 'Zg', name: 'Zig', family: 'systems', year: 2016, creator: 'Andrew Kelley',
    tagline: 'A better C: no hidden control flow, no hidden allocations.',
    typingKind: 'static', typing: 'Static, strong; generics through comptime',
    memoryKind: 'manual', memory: 'Manual, with explicit allocators and defer',
    runtimeKind: 'native', runtime: 'Compiled to native code; cross-compiles out of the box',
    concurrency: 'OS threads; async rebuilt around the std.Io interface in 0.16',
    nulls: 'No null by default: optional types (?T)',
    paradigms: ['Imperative', 'Procedural', 'Generic'],
    packages: 'zig build · build.zig.zon',
    domains: { systems: 3, embedded: 2, cli: 2, games: 2, desktop: 1 },
    influences: ['c', 'go', 'rust'],
    scores: [10, 4, 5, 5, 5, 4, 7, 8, 2, 1, 8],
    ranks: { tiobe: 46, pypl: 24, redmonk: 82, stackoverflow: 29 },
    usage: 2.8, admired: 58.3
  },
  {
    id: 'odin', symbol: 'Od', name: 'Odin', family: 'systems', year: 2016, creator: 'Bill “gingerBill” Hall',
    tagline: 'A calm alternative to C, built for data-oriented programming.',
    typingKind: 'static', typing: 'Static, strong, inferred; parametric polymorphism and distinct types',
    memoryKind: 'manual', memory: 'Manual, with explicit allocators, defer, and an implicit context allocator',
    runtimeKind: 'native', runtime: 'Compiled to native code (LLVM); cross-compiles',
    concurrency: 'OS threads and sync primitives in core:thread; no built-in async',
    nulls: 'nil pointers exist; Maybe(T), or_else and or_return handle optional values',
    paradigms: ['Imperative', 'Procedural', 'Data-oriented'],
    packages: 'No package manager; the compiler builds a directory as a package, with core: and vendor: collections',
    domains: { games: 3, systems: 3, embedded: 2, desktop: 1, cli: 1 },
    influences: ['c', 'pascal', 'go'],
    scores: [10, 4, 7, 5, 4, 3, 6, 7, 3, 1, 7],
    ranks: { stackoverflow: 49 },
    usage: 0.2, admired: 82.4
  },
  {
    id: 'java', symbol: 'Jv', name: 'Java', family: 'application', year: 1995, creator: 'James Gosling, Sun Microsystems',
    tagline: 'Write once, run anywhere, and keep running for thirty years.',
    typingKind: 'static', typing: 'Static, strong, nominal; local inference with var',
    memoryKind: 'gc', memory: 'Garbage collected (G1, ZGC, and others)',
    runtimeKind: 'managed', runtime: 'JVM bytecode, JIT-compiled; GraalVM native images',
    concurrency: 'Platform threads, virtual threads (Java 21+), java.util.concurrent',
    nulls: 'null everywhere; Optional<T> by convention',
    paradigms: ['Object-oriented', 'Imperative', 'Functional (streams)'],
    packages: 'Maven, Gradle · Maven Central',
    domains: { backend: 3, distributed: 2, data: 2, mobile: 2, desktop: 1, embedded: 1 },
    influences: ['cpp', 'smalltalk', 'objc'],
    scores: [8, 6, 7, 6, 8, 10, 9, 8, 10, 10, 5],
    ranks: { tiobe: 4, pypl: 2, redmonk: 3, ieee: 2, octoverse: 4, jetbrains: 3, stackoverflow: 7 },
    usage: 27.6, admired: 38.5
  },
  {
    id: 'csharp', symbol: 'C#', name: 'C#', family: 'application', year: 2000, creator: 'Anders Hejlsberg, Microsoft',
    tagline: 'Java’s old rival, quietly grown into one of the most complete languages around.',
    typingKind: 'static', typing: 'Static, strong, inferred locals; reified generics',
    memoryKind: 'gc', memory: 'Garbage collected; value types and Span<T> for control',
    runtimeKind: 'managed', runtime: '.NET runtime, JIT-compiled; Native AOT available',
    concurrency: 'async/await (C# popularised it), tasks, channels',
    nulls: 'Nullable reference types, flagged by compiler warnings',
    paradigms: ['Object-oriented', 'Functional', 'Imperative'],
    packages: 'dotnet CLI · NuGet',
    domains: { backend: 3, desktop: 3, games: 3, mobile: 2, cli: 2, distributed: 2, scripting: 1 },
    influences: ['java', 'cpp', 'pascal'],
    scores: [8, 7, 7, 8, 8, 9, 9, 8, 9, 9, 5],
    ranks: { tiobe: 5, pypl: 11, redmonk: 4, ieee: 5, octoverse: 5, jetbrains: 8, stackoverflow: 8 },
    usage: 27.1, admired: 50.0
  },
  {
    id: 'go', symbol: 'Go', name: 'Go', family: 'application', year: 2009, creator: 'Robert Griesemer, Rob Pike, Ken Thompson; Google',
    tagline: 'Deliberately boring, so that large teams can keep shipping.',
    typingKind: 'static', typing: 'Static, strong; structural interfaces; generics since 1.18',
    memoryKind: 'gc', memory: 'Garbage collected (concurrent, low-latency)',
    runtimeKind: 'native', runtime: 'Compiled to a single static native binary',
    concurrency: 'Goroutines and channels (CSP-style)',
    nulls: 'nil pointers, maps, slices and interfaces',
    paradigms: ['Imperative', 'Procedural', 'Concurrent'],
    packages: 'Go modules, built into the go command',
    domains: { backend: 3, cli: 3, distributed: 3, systems: 1, scripting: 1 },
    influences: ['c', 'pascal'],
    scores: [8, 6, 9, 4, 9, 8, 10, 6, 10, 7, 7],
    ranks: { tiobe: 11, pypl: 17, redmonk: 12, ieee: 10, octoverse: 10, jetbrains: 9, stackoverflow: 14 },
    usage: 16.5, admired: 49.5
  },
  {
    id: 'kotlin', symbol: 'Kt', name: 'Kotlin', family: 'application', year: 2011, creator: 'JetBrains',
    tagline: 'Java with the sharp edges filed off, and Android’s first choice.',
    typingKind: 'static', typing: 'Static, strong, inferred',
    memoryKind: 'gc', memory: 'Garbage collected (by the host runtime)',
    runtimeKind: 'managed', runtime: 'JVM and Android; also native (LLVM), JavaScript and Wasm',
    concurrency: 'Coroutines with structured concurrency',
    nulls: 'Null safety in the type system (String vs String?)',
    paradigms: ['Object-oriented', 'Functional'],
    packages: 'Gradle, Maven · Maven Central',
    domains: { mobile: 3, backend: 2, desktop: 1, frontend: 1 },
    influences: ['java', 'scala', 'csharp'],
    scores: [8, 8, 7, 8, 8, 9, 8, 8, 8, 6, 6],
    ranks: { tiobe: 32, pypl: 19, redmonk: 14, ieee: 13, jetbrains: 10, stackoverflow: 15 },
    usage: 10.8, admired: 43.1
  },
  {
    id: 'dart', symbol: 'Da', name: 'Dart', family: 'application', year: 2011, creator: 'Lars Bak and Kasper Lund, Google',
    tagline: 'Rescued from obscurity by Flutter; now one codebase for every screen.',
    typingKind: 'static', typing: 'Static, sound, inferred',
    memoryKind: 'gc', memory: 'Garbage collected (generational)',
    runtimeKind: 'native', runtime: 'AOT to native for release, JIT for hot reload; also JavaScript and Wasm',
    concurrency: 'async/await on an event loop; isolates for parallelism',
    nulls: 'Sound null safety',
    paradigms: ['Object-oriented', 'Functional'],
    packages: 'dart pub · pub.dev',
    domains: { mobile: 3, desktop: 2, frontend: 1 },
    influences: ['javascript', 'java', 'csharp', 'smalltalk'],
    scores: [7, 8, 8, 6, 5, 6, 9, 7, 6, 3, 6],
    ranks: { tiobe: 27, pypl: 18, redmonk: 18, ieee: 15, jetbrains: 14, stackoverflow: 20 },
    usage: 4.9, admired: 42.3
  },
  {
    id: 'swift', symbol: 'Sw', name: 'Swift', family: 'application', year: 2014, creator: 'Chris Lattner, Apple',
    tagline: 'Apple’s safe, fast successor to Objective-C.',
    typingKind: 'static', typing: 'Static, strong, inferred; protocols',
    memoryKind: 'arc', memory: 'Automatic reference counting (ARC)',
    runtimeKind: 'native', runtime: 'Compiled to native code (LLVM)',
    concurrency: 'async/await and actors; compile-time data-race checking since Swift 6',
    nulls: 'Optionals (String?)',
    paradigms: ['Protocol-oriented', 'Object-oriented', 'Functional'],
    packages: 'Swift Package Manager',
    domains: { mobile: 3, desktop: 2, backend: 1, embedded: 1 },
    influences: ['objc', 'rust', 'haskell', 'csharp'],
    scores: [8, 9, 7, 8, 7, 6, 7, 5, 6, 6, 5],
    ranks: { tiobe: 14, pypl: 10, redmonk: 11, ieee: 16, jetbrains: 14, stackoverflow: 18 },
    usage: 5.9, admired: 48.5
  },
  {
    id: 'javascript', symbol: 'Js', name: 'JavaScript', family: 'web', year: 1995, creator: 'Brendan Eich, Netscape',
    tagline: 'Designed in ten days; now runs on every device with a screen.',
    typingKind: 'dynamic', typing: 'Dynamic, weak (implicit coercion)',
    memoryKind: 'gc', memory: 'Garbage collected',
    runtimeKind: 'managed', runtime: 'JIT-compiled by the engine (V8, SpiderMonkey, JavaScriptCore)',
    concurrency: 'Single-threaded event loop, promises, async/await; workers',
    nulls: 'Both null and undefined',
    paradigms: ['Multi-paradigm', 'Prototype-based', 'Functional', 'Event-driven'],
    packages: 'npm, pnpm, Yarn, Bun · npm registry',
    domains: { frontend: 3, backend: 2, mobile: 2, desktop: 2, scripting: 2, cli: 1, games: 1 },
    influences: ['scheme', 'self', 'java'],
    scores: [6, 3, 8, 7, 5, 10, 6, 10, 9, 10, 3],
    ranks: { tiobe: 6, pypl: 6, redmonk: 1, ieee: 6, octoverse: 3, jetbrains: 1, stackoverflow: 1 },
    usage: 62.0, admired: 42.0
  },
  {
    id: 'php', symbol: 'Ph', name: 'PHP', family: 'web', year: 1995, creator: 'Rasmus Lerdorf',
    tagline: 'The language the web’s long tail runs on, and better than its reputation.',
    typingKind: 'gradual', typing: 'Dynamic, with type declarations enforced at runtime',
    memoryKind: 'gc', memory: 'Reference counting with a cycle collector, reset per request',
    runtimeKind: 'interpreted', runtime: 'Zend Engine bytecode with OPcache and an optional JIT',
    concurrency: 'Shared-nothing request processes; Fibers since 8.1',
    nulls: 'null, with nullable types (?string) and the ?-> operator',
    paradigms: ['Object-oriented', 'Imperative', 'Procedural'],
    packages: 'Composer · Packagist',
    domains: { backend: 3, scripting: 1 },
    influences: ['perl', 'c'],
    scores: [4, 4, 8, 5, 2, 8, 7, 3, 7, 7, 3],
    ranks: { tiobe: 12, pypl: 7, redmonk: 4, ieee: 12, octoverse: 6, jetbrains: 12, stackoverflow: 13 },
    usage: 17.7, admired: 35.7
  },
  {
    id: 'typescript', symbol: 'Ts', name: 'TypeScript', family: 'web', year: 2012, creator: 'Anders Hejlsberg, Microsoft',
    tagline: 'JavaScript with a type system good enough to become the default.',
    typingKind: 'static', typing: 'Static, structural, inferred; deliberately unsound',
    memoryKind: 'gc', memory: 'Garbage collected (runs as JavaScript)',
    runtimeKind: 'managed', runtime: 'Compiled to JavaScript, types erased; compiler rewritten in Go for 7.0',
    concurrency: 'Same as JavaScript: event loop, promises, workers',
    nulls: 'Strict null checks make null and undefined explicit',
    paradigms: ['Multi-paradigm', 'Object-oriented', 'Functional'],
    packages: 'npm and friends · npm registry',
    domains: { frontend: 3, backend: 3, mobile: 2, desktop: 2, cli: 2, scripting: 1 },
    influences: ['javascript', 'csharp'],
    scores: [6, 6, 7, 8, 5, 10, 8, 9, 7, 9, 10],
    ranks: { tiobe: 38, pypl: 12, redmonk: 6, ieee: 7, octoverse: 1, jetbrains: 5, stackoverflow: 6 },
    usage: 43.8, admired: 53.0
  },
  {
    id: 'python', symbol: 'Py', name: 'Python', family: 'dynamic', year: 1991, creator: 'Guido van Rossum',
    tagline: 'Executable pseudocode that ended up running the AI boom.',
    typingKind: 'gradual', typing: 'Dynamic, strong; optional type hints checked by external tools',
    memoryKind: 'gc', memory: 'Reference counting plus a cycle-detecting collector',
    runtimeKind: 'interpreted', runtime: 'CPython bytecode interpreter; experimental JIT since 3.13',
    concurrency: 'asyncio, threads (GIL, or the opt-in free-threaded build), processes',
    nulls: 'None, caught only by type checkers',
    paradigms: ['Multi-paradigm', 'Object-oriented', 'Imperative', 'Functional'],
    packages: 'pip, uv, Poetry · PyPI',
    domains: { data: 3, science: 3, scripting: 3, backend: 2, cli: 2, desktop: 1, games: 1, embedded: 1 },
    influences: ['abc', 'c', 'haskell', 'lisp'],
    scores: [3, 4, 10, 8, 4, 10, 7, 7, 7, 10, 9],
    ranks: { tiobe: 1, pypl: 1, redmonk: 2, ieee: 1, octoverse: 2, jetbrains: 2, stackoverflow: 4 },
    usage: 58.0, admired: 50.6
  },
  {
    id: 'lua', symbol: 'Lu', name: 'Lua', family: 'dynamic', year: 1993, creator: 'Roberto Ierusalimschy, Luiz Henrique de Figueiredo, Waldemar Celes; PUC-Rio',
    tagline: 'A tiny language designed to live inside other programs.',
    typingKind: 'dynamic', typing: 'Dynamic, strong',
    memoryKind: 'gc', memory: 'Garbage collected (incremental and generational)',
    runtimeKind: 'interpreted', runtime: 'Register-based bytecode interpreter; LuaJIT for speed',
    concurrency: 'Cooperative coroutines; threads come from the host',
    nulls: 'nil',
    paradigms: ['Multi-paradigm', 'Imperative', 'Prototype-based'],
    packages: 'LuaRocks',
    domains: { games: 3, scripting: 3, embedded: 1 },
    influences: ['scheme'],
    scores: [3, 3, 9, 5, 3, 4, 4, 7, 6, 2, 6],
    ranks: { tiobe: 35, pypl: 20, ieee: 21, jetbrains: 16, stackoverflow: 16 },
    usage: 9.4, admired: 40.8
  },
  {
    id: 'ruby', symbol: 'Rb', name: 'Ruby', family: 'dynamic', year: 1995, creator: 'Yukihiro “Matz” Matsumoto',
    tagline: 'Optimised for programmer happiness; the language that gave us Rails.',
    typingKind: 'dynamic', typing: 'Dynamic, strong, duck-typed; optional RBS and Sorbet',
    memoryKind: 'gc', memory: 'Garbage collected (generational, incremental)',
    runtimeKind: 'interpreted', runtime: 'YARV bytecode interpreter with the YJIT compiler (ZJIT in 4.0)',
    concurrency: 'Threads under a global VM lock, fibers, Ractors',
    nulls: 'nil, with the safe navigation operator &.',
    paradigms: ['Object-oriented', 'Functional', 'Metaprogramming'],
    packages: 'RubyGems, Bundler',
    domains: { backend: 3, scripting: 2, cli: 1 },
    influences: ['perl', 'smalltalk', 'lisp'],
    scores: [3, 3, 8, 9, 3, 7, 7, 4, 7, 5, 2],
    ranks: { tiobe: 28, pypl: 14, redmonk: 9, ieee: 17, jetbrains: 16, stackoverflow: 19 },
    usage: 5.8, admired: 42.4
  },
  {
    id: 'r', symbol: 'R', name: 'R', family: 'scientific', year: 1993, creator: 'Ross Ihaka and Robert Gentleman',
    tagline: 'The statistician’s lingua franca, with a package for every published method.',
    typingKind: 'dynamic', typing: 'Dynamic; everything is a vector',
    memoryKind: 'gc', memory: 'Garbage collected; copy-on-modify semantics',
    runtimeKind: 'interpreted', runtime: 'Bytecode interpreter',
    concurrency: 'Mostly single-threaded; parallel and future packages',
    nulls: 'NULL, plus NA as a first-class missing value',
    paradigms: ['Functional', 'Array', 'Object-oriented (S3, S4, R5)'],
    packages: 'install.packages() · CRAN, Bioconductor',
    domains: { data: 3, science: 3 },
    influences: ['s', 'scheme'],
    scores: [2, 3, 6, 7, 2, 7, 7, 3, 8, 4, 4],
    ranks: { tiobe: 8, pypl: 4, redmonk: 13, ieee: 11, stackoverflow: 21 },
    usage: 4.5, admired: 40.7
  },
  {
    id: 'julia', symbol: 'Jl', name: 'Julia', family: 'scientific', year: 2012, creator: 'Jeff Bezanson, Stefan Karpinski, Viral B. Shah, Alan Edelman',
    tagline: 'Reads like Python, runs like C, built for numerical computing.',
    typingKind: 'dynamic', typing: 'Dynamic, with optional annotations driving multiple dispatch',
    memoryKind: 'gc', memory: 'Garbage collected',
    runtimeKind: 'native', runtime: 'JIT-compiled to native code (LLVM), per method signature',
    concurrency: 'Tasks, multithreading, distributed processes, GPU kernels',
    nulls: 'nothing and missing, as distinct types',
    paradigms: ['Multiple dispatch', 'Functional', 'Array'],
    packages: 'Pkg · General registry',
    domains: { science: 3, data: 2 },
    influences: ['lisp', 'python', 'r'],
    scores: [8, 5, 7, 9, 7, 5, 7, 3, 8, 2, 5],
    ranks: { tiobe: 18, pypl: 21, ieee: 31, stackoverflow: 39 },
    usage: 1.5, admired: 47.4
  },
  {
    id: 'erlang', symbol: 'Er', name: 'Erlang', family: 'functional', year: 1986, creator: 'Joe Armstrong, Robert Virding and Mike Williams, Ericsson',
    tagline: 'Isolated processes and supervision for systems that must stay up.',
    typingKind: 'dynamic', typing: 'Dynamic, strong; optional specs checked by Dialyzer',
    memoryKind: 'gc', memory: 'Garbage collected, per lightweight process',
    runtimeKind: 'managed', runtime: 'BEAM (the Erlang VM), with a JIT',
    concurrency: 'Lightweight processes, message passing and OTP supervision',
    nulls: 'No null; atoms such as undefined and tagged tuples by convention',
    paradigms: ['Functional', 'Concurrent', 'Distributed'],
    packages: 'rebar3 · Hex',
    domains: { backend: 3, distributed: 3, embedded: 1 },
    influences: ['prolog'],
    scores: [4, 6, 5, 6, 10, 6, 7, 4, 10, 3, 3],
    ranks: { tiobe: 51, ieee: 52, stackoverflow: 38 },
    usage: 1.5, admired: 49.1
  },
  {
    id: 'haskell', symbol: 'Hs', name: 'Haskell', family: 'functional', year: 1990, creator: 'A committee of researchers',
    tagline: 'Pure, lazy, and the source of half of modern language design.',
    typingKind: 'static', typing: 'Static, strong, inferred; type classes',
    memoryKind: 'gc', memory: 'Garbage collected; lazy evaluation by default',
    runtimeKind: 'native', runtime: 'GHC compiles to native code',
    concurrency: 'Green threads and software transactional memory',
    nulls: 'No null: Maybe a',
    paradigms: ['Purely functional', 'Lazy'],
    packages: 'Cabal, Stack · Hackage',
    domains: { cli: 2, backend: 1, distributed: 1 },
    influences: ['miranda', 'ml', 'lisp'],
    scores: [7, 9, 2, 10, 8, 5, 5, 4, 6, 2, 3],
    ranks: { tiobe: 41, pypl: 27, ieee: 30, stackoverflow: 34 },
    usage: 2.3, admired: 47.8
  },
  {
    id: 'ocaml', symbol: 'Oc', name: 'OCaml', family: 'functional', year: 1996, creator: 'Xavier Leroy and colleagues, INRIA',
    tagline: 'Inferred types, pattern matching and native code in the ML tradition.',
    typingKind: 'static', typing: 'Static, strong, inferred; algebraic data types and modules',
    memoryKind: 'gc', memory: 'Garbage collected; strict evaluation by default',
    runtimeKind: 'native', runtime: 'Native code or bytecode; JavaScript through js_of_ocaml',
    concurrency: 'Multicore domains since OCaml 5; effect handlers and Eio for concurrency',
    nulls: 'No null: option values',
    paradigms: ['Functional-first', 'Imperative', 'Object-oriented'],
    packages: 'opam, Dune · opam repository',
    domains: { cli: 3, backend: 2, systems: 1, frontend: 1, data: 1, science: 1 },
    influences: ['ml'],
    scores: [8, 8, 5, 9, 7, 5, 7, 6, 8, 3, 5],
    ranks: { tiobe: 26, ieee: 40, stackoverflow: 44 },
    usage: 1.2, admired: 51.5
  },
  {
    id: 'scala', symbol: 'Sc', name: 'Scala', family: 'functional', year: 2004, creator: 'Martin Odersky, EPFL',
    tagline: 'Objects and functions fused on the JVM, with all the power that implies.',
    typingKind: 'static', typing: 'Static, strong, inferred; one of the richest type systems in use',
    memoryKind: 'gc', memory: 'Garbage collected',
    runtimeKind: 'managed', runtime: 'JVM; also Scala.js and Scala Native',
    concurrency: 'Futures, actors (Akka, Pekko), effect systems (ZIO, Cats Effect)',
    nulls: 'Option[A] by convention; opt-in explicit nulls in Scala 3',
    paradigms: ['Functional', 'Object-oriented'],
    packages: 'sbt, Mill, Scala CLI · Maven Central',
    domains: { backend: 2, data: 2, distributed: 2 },
    influences: ['java', 'haskell', 'ml', 'erlang'],
    scores: [7, 8, 4, 10, 8, 8, 6, 6, 5, 4, 2],
    ranks: { tiobe: 40, pypl: 22, redmonk: 14, ieee: 28, jetbrains: 16, stackoverflow: 35 },
    usage: 2.2, admired: 39.2
  },
  {
    id: 'fsharp', symbol: 'F#', name: 'F#', family: 'functional', year: 2005, creator: 'Don Syme, Microsoft Research',
    tagline: 'ML-style functional programming with all of .NET behind it.',
    typingKind: 'static', typing: 'Static, strong, inferred (Hindley–Milner)',
    memoryKind: 'gc', memory: 'Garbage collected (.NET)',
    runtimeKind: 'managed', runtime: '.NET runtime; Fable compiles it to JavaScript',
    concurrency: 'Async and task expressions; MailboxProcessor agents',
    nulls: 'Option<T>; nullable reference types for .NET interop since F# 9',
    paradigms: ['Functional-first', 'Object-oriented'],
    packages: 'dotnet CLI, Paket · NuGet',
    domains: { backend: 2, data: 1, science: 1, scripting: 1, frontend: 1 },
    influences: ['ml', 'ocaml', 'csharp', 'haskell'],
    scores: [7, 8, 6, 9, 7, 7, 7, 6, 8, 2, 3],
    ranks: { tiobe: 51, stackoverflow: 43 },
    usage: 1.2, admired: 48.3
  },
  {
    id: 'clojure', symbol: 'Cj', name: 'Clojure', family: 'functional', year: 2007, creator: 'Rich Hickey',
    tagline: 'A modern Lisp on the JVM where immutable data is the default.',
    typingKind: 'dynamic', typing: 'Dynamic, strong; optional spec or Malli for data shapes',
    memoryKind: 'gc', memory: 'Garbage collected; persistent immutable collections',
    runtimeKind: 'managed', runtime: 'JVM; ClojureScript for JavaScript, babashka for scripts',
    concurrency: 'Atoms, refs (STM), agents, core.async',
    nulls: 'nil, treated as an empty collection by most functions',
    paradigms: ['Functional', 'Lisp', 'Data-oriented'],
    packages: 'deps.edn, Leiningen · Clojars, Maven Central',
    domains: { backend: 2, data: 1, scripting: 1, frontend: 1 },
    influences: ['lisp', 'java', 'haskell', 'erlang'],
    scores: [6, 5, 5, 9, 8, 7, 6, 6, 10, 2, 3],
    ranks: { tiobe: 51, ieee: 51, stackoverflow: 40 },
    usage: 1.3, admired: 48.7
  },
  {
    id: 'elixir', symbol: 'Ex', name: 'Elixir', family: 'functional', year: 2012, creator: 'José Valim',
    tagline: 'Erlang’s battle-tested runtime with a friendlier face.',
    typingKind: 'gradual', typing: 'Dynamic, strong; since 1.20 the compiler infers and checks types gradually',
    memoryKind: 'gc', memory: 'Garbage collected, per lightweight process',
    runtimeKind: 'managed', runtime: 'BEAM (the Erlang VM), with a JIT',
    concurrency: 'Millions of isolated processes; supervision trees',
    nulls: 'nil; tagged tuples such as {:ok, value} for results',
    paradigms: ['Functional', 'Concurrent', 'Metaprogramming'],
    packages: 'Mix · Hex',
    domains: { backend: 3, distributed: 3, embedded: 1 },
    influences: ['erlang', 'ruby', 'clojure'],
    scores: [4, 6, 6, 8, 10, 6, 8, 5, 9, 3, 6],
    ranks: { tiobe: 51, ieee: 43, stackoverflow: 32 },
    usage: 2.6, admired: 62.1
  },
  {
    id: 'gleam', symbol: 'Gl', name: 'Gleam', family: 'functional', year: 2016, creator: 'Louis Pilfold',
    tagline: 'A small, friendly, type-safe language for the Erlang VM and JavaScript.',
    typingKind: 'static', typing: 'Static, strong, inferred (Hindley–Milner)',
    memoryKind: 'gc', memory: 'Garbage collected (by the BEAM or the JavaScript engine)',
    runtimeKind: 'managed', runtime: 'Compiles to Erlang for the BEAM, or to JavaScript',
    concurrency: 'BEAM processes and OTP, with typed messages',
    nulls: 'No null: Option and Result',
    paradigms: ['Functional', 'Concurrent'],
    packages: 'gleam CLI · Hex',
    domains: { backend: 2, distributed: 2, frontend: 1 },
    influences: ['erlang', 'elixir', 'rust', 'ml'],
    scores: [4, 9, 7, 6, 9, 4, 9, 5, 6, 1, 8],
    ranks: { stackoverflow: 41 },
    usage: 1.2, admired: 52.3
  }
];

export const languages: Language[] = languageSources.map(({ scores, ...language }) => ({
  ...language,
  scores: Object.fromEntries(facetOrder.map((key, index) => [key, scores[index]])) as Record<FacetKey, number>
}));

const byId = new Map(languages.map((language) => [language.id, language]));
const familyByKey = new Map(families.map((family) => [family.key, family]));

export function getLanguage(id: string) {
  return byId.get(id);
}

export function getFamily(key: FamilyKey) {
  const family = familyByKey.get(key);
  if (!family) throw new Error(`Unknown family: ${key}`);
  return family;
}

export function influenceName(id: string) {
  return byId.get(id)?.name ?? ancestors.find((ancestor) => ancestor.id === id)?.name ?? id;
}

/** Rank within this set of languages for one source. Unranked languages share the remaining places. */
function placesFor(source: SourceKey) {
  const ranked = languages
    .filter((language) => language.ranks[source] !== undefined)
    .sort((a, b) => a.ranks[source]! - b.ranks[source]!);
  const places = new Map<string, number>();
  let index = 0;
  while (index < ranked.length) {
    const rank = ranked[index].ranks[source]!;
    let end = index;
    while (end + 1 < ranked.length && ranked[end + 1].ranks[source] === rank) end++;
    const place = (index + end) / 2 + 1;
    for (let i = index; i <= end; i++) places.set(ranked[i].id, place);
    index = end + 1;
  }
  const shared = (ranked.length + 1 + languages.length) / 2;
  for (const language of languages) if (!places.has(language.id)) places.set(language.id, shared);
  return places;
}

export const sourcePlaces = Object.fromEntries(
  popularitySources.map((source) => [source.key, placesFor(source.key)])
) as Record<SourceKey, Map<string, number>>;

export const averagePlace = new Map(
  languages.map((language) => {
    const places = popularitySources.map((source) => sourcePlaces[source.key].get(language.id)!);
    return [language.id, places.reduce((sum, place) => sum + place, 0) / places.length];
  })
);

export const consensusRank = new Map(
  [...languages]
    .sort((a, b) => averagePlace.get(a.id)! - averagePlace.get(b.id)!)
    .map((language, index) => [language.id, index + 1])
);

/** Popularity on the same 1–10 scale as the facets: 10 is first place in every source. */
export function popularityScore(id: string) {
  return 10 - (9 * (averagePlace.get(id)! - 1)) / (languages.length - 1);
}

export function formatSourceRank(source: SourceKey, rank: number | undefined) {
  if (rank === undefined) return '—';
  if (source === 'tiobe' && rank >= 51) return '51–100';
  return `#${rank}`;
}

export type LensKey = FacetKey | 'popularity' | 'admired' | 'year';

export interface Lens {
  key: LensKey;
  name: string;
  question: string;
  low: string;
  high: string;
  min: number;
  max: number;
  ticks: number[];
  unit: 'score' | 'percent' | 'year';
  note: string;
}

const facetNotes: Record<FacetKey, string> = {
  performance:
    'Five languages share the top: C, C++, Rust, Zig and Odin compile ahead of time and have no garbage collector. The big cluster at 7–8 is the managed mainstream, within a small factor of C for most server work. The real story is the gap to the bottom. In Pereira et al.’s benchmark study, Python and Ruby took 60 to 70 times as long as C. That is why their fast libraries are written in C, C++ or Rust.',
  safety:
    'Safety splits on memory first. Only C, C++, Zig and Odin let an ordinary bug corrupt memory by default. Microsoft and Google’s Chromium team both found that memory-safety bugs account for about 70% of their serious security vulnerabilities. Rust is alone at 10: memory-safe without a garbage collector, and data races don’t compile. Haskell, OCaml and Gleam use option types instead of null; Swift uses optionals.',
  approachability:
    'Python and Go lead for different reasons. Python reads like pseudocode; Go simply has very little language to learn. The steep end (C++, Haskell, Rust) is where a language asks for a new mental model, not just new syntax.',
  expressiveness:
    'Expressiveness and approachability usually pull against each other, but Python, Ruby and Kotlin manage plenty of both. Go is plain on purpose: its designers argue that code is read far more often than it is written, by people who didn’t write it.',
  concurrency:
    'Erlang, Elixir, Gleam and Go were designed around concurrency from day one, and it shows. Python, Ruby and PHP grew up with one thread per process and are retrofitting: Python’s free-threaded build, Ruby’s Ractors, PHP’s Fibers. Java’s virtual threads are the most successful retrofit so far.',
  ecosystem:
    'Ecosystems compound. Python, JavaScript, TypeScript and Java score 10 because decades of libraries make the next one easier to justify. Languages on a shared runtime borrow an ecosystem: Kotlin, Scala and Clojure get the JVM’s, F# gets .NET’s, Elixir and Gleam get Erlang’s.',
  tooling:
    'The youngest languages ship the best tools because they designed them in from the start: Rust’s Cargo, Go’s single go command, Gleam’s all-in-one CLI. C and C++ have superb compilers but still no standard way to build or share code.',
  reach:
    'Only C and JavaScript run almost everywhere: C because every platform needs it, JavaScript because every platform has a browser. Rust, Zig and Kotlin are catching up through LLVM and WebAssembly. PHP, R and Julia are deliberately at home in one place.',
  stability:
    'Stability is a deliberate choice. Go has its compatibility promise, Java and C keep thirty-year-old code running, and Clojure is famous for its restraint. At the other end, Zig is pre-1.0 and says so, while Scala and Swift have both put users through painful migrations.',
  jobs:
    'Jobs follow the installed base, not admiration. Python, Java and JavaScript lead every jobs ranking. Rust is widely admired, but it sits 15th on IEEE Spectrum’s jobs list and outside the top eight on job boards.',
  momentum:
    'TypeScript has the most momentum: first on GitHub by contributors in 2025 and first on JetBrains’ Language Promise Index. Rust, Python, Zig and Gleam are rising too. Ruby, Scala and JavaScript itself are drifting, mostly towards their own successors.'
};

export const lenses: Lens[] = [
  ...facets.map((facet): Lens => ({
    key: facet.key,
    name: facet.name,
    question: facet.question,
    low: facet.low,
    high: facet.high,
    min: 0.5,
    max: 10.5,
    ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    unit: 'score',
    note: facetNotes[facet.key]
  })),
  {
    key: 'popularity',
    name: 'Popularity',
    question: 'How widely is it used, across seven rankings?',
    low: 'Niche',
    high: 'Mainstream',
    min: 0.5,
    max: 10.5,
    ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    unit: 'score',
    note: 'This is the average position across seven published rankings, rescaled so that first place everywhere would score 10. No single survey decides it. Python leads almost everywhere. The interesting cases are the disagreements, which get their own chart further down.'
  },
  {
    key: 'admired',
    name: 'Admired',
    question: 'Do the people who use it want to keep using it?',
    low: 'Tolerated',
    high: 'Loved',
    min: 30,
    max: 90,
    ticks: [30, 40, 50, 60, 70, 80, 90],
    unit: 'percent',
    note: 'The share of a language’s current users who want to keep using it, from the 2026 Stack Overflow survey. Read it with care. Small languages score high because their users chose them deliberately: Odin tops the chart at 82% on a sample of only a few dozen users. Big languages score lower because many of their users had no choice.'
  },
  {
    key: 'year',
    name: 'Age',
    question: 'When did it first appear?',
    low: 'Older',
    high: 'Newer',
    min: 1968,
    max: 2020,
    ticks: [1970, 1980, 1990, 2000, 2010, 2020],
    unit: 'year',
    note: 'Four of these languages appeared before 1991. Two waves account for most of the rest: seven arrived between 1991 and 1995, in the scripting and web boom, and eleven between 2009 and 2016, most of them designed to fix what the previous generation got wrong.'
  }
];

export function lensValue(lens: LensKey, language: Language) {
  if (lens === 'popularity') return popularityScore(language.id);
  if (lens === 'admired') return language.admired;
  if (lens === 'year') return language.year;
  return language.scores[lens];
}

export function formatLensValue(lens: Lens, value: number) {
  if (lens.unit === 'percent') return `${value.toFixed(1)}%`;
  if (lens.unit === 'year') return String(value);
  return Number.isInteger(value) ? `${value}/10` : `${value.toFixed(1)}/10`;
}

export interface MapView {
  key: string;
  name: string;
  x: LensKey;
  y: LensKey;
  quadrants: [string, string, string, string];
  note: string;
}

// Quadrant labels run top-left, top-right, bottom-left, bottom-right.
export const mapViews: MapView[] = [
  {
    key: 'fast-friendly', name: 'Fast or friendly?', x: 'approachability', y: 'performance',
    quadrants: ['Fast, hard-won', 'Fast and friendly', 'Slow and steep', 'Friendly, slower'],
    note: 'For decades you had to pick one. The top-right corner is now well populated: Go, Java, C#, Kotlin and Swift are fast enough for almost anything and approachable enough for most teams. Rust and Zig buy the last stretch of speed with a steeper climb. Python trades speed for approachability, then wins much of it back through libraries written in C.'
  },
  {
    key: 'safe-fast', name: 'Safe or fast?', x: 'performance', y: 'safety',
    quadrants: ['Safe, slower', 'Safe and fast', 'Neither', 'Fast, unsafe'],
    note: 'For most of computing history the top-right corner was empty: you got speed by giving up memory safety. Rust moved in, and that is why government security agencies now name it. Swift sits close by and pays for its safety with reference counting.'
  },
  {
    key: 'used-admired', name: 'Used or admired?', x: 'popularity', y: 'admired',
    quadrants: ['Loved niche', 'Loved at scale', 'Quiet', 'Used, tolerated'],
    note: 'The most admired languages are small, and the most used are only moderately admired. Part of that is selection: people who use Elixir or Zig went looking for them, while many people write Java or JavaScript because the job requires it. TypeScript and Python stay well liked at scale. Rust is the one to watch, high on both and climbing.'
  },
  {
    key: 'power-plain', name: 'Powerful or plain?', x: 'approachability', y: 'expressiveness',
    quadrants: ['Powerful, demanding', 'Powerful and easy', 'Plain and hard', 'Plain and easy'],
    note: 'Expressive languages let one person say a lot; plain languages let a whole team read it. Go and Lua chose plainness, while Haskell and Scala chose power. Python, Ruby and Kotlin get a lot of both, and teams fight over whether that is a feature.'
  },
  {
    key: 'jobs-momentum', name: 'Today’s jobs or tomorrow’s?', x: 'jobs', y: 'momentum',
    quadrants: ['Rising, few jobs yet', 'Hiring and rising', 'Niche', 'Established'],
    note: 'Bottom right is today’s job market: Java, JavaScript, C#, PHP. Top left is where the energy is but the jobs aren’t yet: Zig, Gleam, Rust. Python and TypeScript are strong on both, which is roughly why every course teaches them.'
  }
];

export interface Matchup {
  name: string;
  ids: string[];
}

export const matchups: Matchup[] = [
  { name: 'Go vs Rust', ids: ['go', 'rust'] },
  { name: 'Java vs C# vs Kotlin', ids: ['java', 'csharp', 'kotlin'] },
  { name: 'JavaScript vs TypeScript', ids: ['javascript', 'typescript'] },
  { name: 'C vs Zig vs Rust', ids: ['c', 'zig', 'rust'] },
  { name: 'Zig vs Odin', ids: ['zig', 'odin'] },
  { name: 'Python vs Julia vs R', ids: ['python', 'julia', 'r'] },
  { name: 'Swift vs Kotlin vs Dart', ids: ['swift', 'kotlin', 'dart'] },
  { name: 'Python vs Ruby vs PHP', ids: ['python', 'ruby', 'php'] },
  { name: 'Erlang vs Elixir vs Gleam', ids: ['erlang', 'elixir', 'gleam'] },
  { name: 'Haskell vs F# vs Scala', ids: ['haskell', 'fsharp', 'scala'] },
  { name: 'OCaml vs F# vs Haskell', ids: ['ocaml', 'fsharp', 'haskell'] }
];

export interface Project {
  key: string;
  name: string;
  domains: DomainKey[];
  weights: Record<FacetKey, number>;
}

const weights = (values: Partial<Record<FacetKey, number>>) =>
  Object.fromEntries(facetOrder.map((key) => [key, values[key] ?? 0])) as Record<FacetKey, number>;

export const projects: Project[] = [
  {
    key: 'api', name: 'Web API or backend', domains: ['backend'],
    weights: weights({ performance: 2, safety: 2, approachability: 1, concurrency: 2, ecosystem: 3, tooling: 2, stability: 2, jobs: 2, momentum: 1 })
  },
  {
    key: 'frontend', name: 'Web frontend', domains: ['frontend'],
    weights: weights({ safety: 2, approachability: 2, ecosystem: 3, tooling: 2, jobs: 2, momentum: 1 })
  },
  {
    key: 'mobile', name: 'Mobile app', domains: ['mobile'],
    weights: weights({ performance: 2, safety: 2, approachability: 1, ecosystem: 2, tooling: 2, reach: 2, jobs: 1 })
  },
  {
    key: 'game', name: 'Game', domains: ['games'],
    weights: weights({ performance: 3, approachability: 1, ecosystem: 2, tooling: 1, reach: 2 })
  },
  {
    key: 'data', name: 'Data science or ML', domains: ['data'],
    weights: weights({ approachability: 3, expressiveness: 2, ecosystem: 3, performance: 1, jobs: 1 })
  },
  {
    key: 'science', name: 'Scientific computing', domains: ['science'],
    weights: weights({ performance: 3, expressiveness: 2, ecosystem: 2, approachability: 2, concurrency: 1 })
  },
  {
    key: 'systems', name: 'Systems or embedded', domains: ['systems', 'embedded'],
    weights: weights({ performance: 3, safety: 2, reach: 2, tooling: 1, stability: 1 })
  },
  {
    key: 'cli', name: 'CLI or DevOps tool', domains: ['cli'],
    weights: weights({ performance: 2, safety: 1, approachability: 2, ecosystem: 1, tooling: 2, reach: 2 })
  },
  {
    key: 'distributed', name: 'Real-time or distributed system', domains: ['distributed'],
    weights: weights({ performance: 2, safety: 2, concurrency: 3, ecosystem: 1, stability: 2 })
  },
  {
    key: 'scripting', name: 'Automation and glue', domains: ['scripting'],
    weights: weights({ approachability: 3, expressiveness: 1, ecosystem: 2, tooling: 1 })
  },
  {
    key: 'enterprise', name: 'Enterprise system for ten years', domains: ['backend'],
    weights: weights({ performance: 1, safety: 2, ecosystem: 2, tooling: 2, stability: 3, jobs: 3 })
  },
  {
    key: 'first', name: 'First language', domains: [],
    weights: weights({ safety: 1, approachability: 3, ecosystem: 2, tooling: 2, reach: 1, jobs: 2 })
  }
];

export const weightLabels = ['Ignore', 'Nice to have', 'Important', 'Critical'];

const fitMultiplier: Record<Fit | 0, number> = { 3: 1, 2: 0.9, 1: 0.75, 0: 0.45 };

export function domainFit(language: Language, domains: DomainKey[]): Fit | 0 {
  return domains.reduce<Fit | 0>((best, domain) => Math.max(best, language.domains[domain] ?? 0) as Fit | 0, 0);
}

export function matchScore(language: Language, weightsByFacet: Record<FacetKey, number>, domains: DomainKey[]) {
  const total = facetOrder.reduce((sum, key) => sum + weightsByFacet[key], 0);
  const base = total === 0 ? 5 : facetOrder.reduce((sum, key) => sum + weightsByFacet[key] * language.scores[key], 0) / total;
  return domains.length === 0 ? base : base * fitMultiplier[domainFit(language, domains)];
}
