export type CategoryKey =
  | 'principles'
  | 'styles'
  | 'domain'
  | 'data'
  | 'integration'
  | 'resilience'
  | 'observability'
  | 'security'
  | 'delivery'
  | 'practice';

export interface Category {
  key: CategoryKey;
  name: string;
  blurb: string;
  fill: string;
  ink: string;
}

export type Cost = 1 | 2 | 3 | 4 | 5;

export interface ArchitectureElement {
  id: string;
  number: number;
  symbol: string;
  name: string;
  label: string;
  category: CategoryKey;
  row: number;
  col: number;
  cost: Cost;
  summary: string;
  description: string;
  useWhen: string;
  watchOutFor: string;
  related: string[];
}

export interface Compound {
  name: string;
  description: string;
  elements: string[];
}

export const categories: Category[] = [
  { key: 'principles', name: 'Principles', blurb: 'The forces every other element is built from.', fill: '#f1dfa6', ink: '#5c4108' },
  { key: 'styles', name: 'Architectural Styles', blurb: 'The overall shape of a system.', fill: '#f7c7a3', ink: '#7c2d12' },
  { key: 'domain', name: 'Domain & Modularity', blurb: 'Where to draw boundaries, and what to call things.', fill: '#eab7b2', ink: '#7a1f1a' },
  { key: 'data', name: 'Data', blurb: 'How state is stored, shaped, and moved.', fill: '#bccfe8', ink: '#1d3557' },
  { key: 'integration', name: 'Integration', blurb: 'How the parts of a system talk to each other.', fill: '#b5dcd2', ink: '#134e48' },
  { key: 'resilience', name: 'Resilience & Scale', blurb: 'Staying up, and staying fast, under stress.', fill: '#d2e3a9', ink: '#3f5212' },
  { key: 'observability', name: 'Observability', blurb: 'Knowing what the system is actually doing.', fill: '#d9c6e3', ink: '#4b2660' },
  { key: 'security', name: 'Security', blurb: 'Keeping the wrong people and code out.', fill: '#3f3a36', ink: '#f5efe6' },
  { key: 'delivery', name: 'Delivery & Evolution', blurb: 'Getting change into production safely.', fill: '#f4c9dc', ink: '#7d1d4a' },
  { key: 'practice', name: 'Practices', blurb: 'How architecture work itself gets done.', fill: '#fbfaf7', ink: '#292524' }
];

export const costLabels: Record<Cost, string> = {
  1: 'Minimal',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very high'
};

type ElementSource = Omit<ArchitectureElement, 'id' | 'number' | 'label'> & { label?: string };

const sources: ElementSource[] = [
  // Period 1
  {
    symbol: 'Sc', name: 'Separation of Concerns', category: 'principles', row: 1, col: 1, cost: 1,
    summary: 'Each part of a system should address one distinct concern.',
    description: 'Split a system so that each part deals with a single, identifiable aspect: presentation, business rules, persistence, transport. When concerns are separated, you can understand, change, and replace one without reasoning about all the others. Almost every other element on this table is a specific way of applying it.',
    useWhen: 'Always. The question is never whether to separate concerns, but which ones and along which lines.',
    watchOutFor: 'Splitting along the wrong axis. Technical layers separate code that always changes together when change actually happens per feature.',
    related: ['co', 'lc', 'la', 'vs']
  },
  {
    symbol: 'Lp', name: 'Least Privilege', category: 'security', row: 1, col: 18, cost: 2,
    summary: 'Every user, service, and process gets the minimum access it needs, and nothing more.',
    description: 'Grant permissions narrowly and for as short a time as practical. A compromised component can then only do the damage its own permissions allow. It applies equally to database accounts, cloud IAM roles, API tokens, and humans with production access.',
    useWhen: 'Designing any identity, role, or credential, especially service accounts that tend to collect broad permissions over time.',
    watchOutFor: 'Permissions drift upward as people add access to fix urgent problems and never remove it. Review and expire grants on a schedule.',
    related: ['zt', 'dd', 'se', 'fi']
  },

  // Period 2
  {
    symbol: 'Ab', name: 'Abstraction', category: 'principles', row: 2, col: 1, cost: 1,
    summary: 'Expose what something does, and hide how it does it.',
    description: 'A good abstraction gives callers a simpler model than the thing underneath: a repository instead of SQL, a payment port instead of a vendor SDK. Both sides can evolve independently as long as the contract holds.',
    useWhen: 'A detail is likely to change, has more than one implementation, or would otherwise leak complexity into many callers.',
    watchOutFor: 'Abstractions built before you have two real cases tend to guess wrong. A leaky or premature abstraction costs more than the duplication it removed.',
    related: ['en', 'di', 'hx', 'ya']
  },
  {
    symbol: 'Sr', name: 'Single Responsibility', category: 'principles', row: 2, col: 2, cost: 1,
    summary: 'A module should have one reason to change: it answers to one actor.',
    description: 'Robert C. Martin\'s framing is about people, not functions. When two groups of stakeholders drive changes into the same code, their changes collide. At architectural scale the same rule tells you how to split services and teams.',
    useWhen: 'Deciding where code belongs, or working out why a module keeps changing for unrelated reasons.',
    watchOutFor: 'Reading it as "do one tiny thing" produces fragmented code that has to be read across dozens of files to follow a single flow.',
    related: ['sc', 'co', 'bc']
  },
  {
    symbol: 'Rq', name: 'Request–Reply', category: 'integration', row: 2, col: 13, cost: 1,
    summary: 'A caller sends a request and waits for the response.',
    description: 'The default interaction style: HTTP, gRPC, a function call over the network. It is easy to reason about because the caller gets an answer or an error straight away. The cost is temporal coupling. Both sides must be up at the same time, and latency adds up along every hop of a call chain.',
    useWhen: 'The caller needs the answer to continue, as with reads and user-facing queries.',
    watchOutFor: 'Long synchronous chains between services multiply latency and failure probability. Three services at 99.9% availability give you 99.7% at best.',
    related: ['to', 're', 'cb', 'mq', 'gw']
  },
  {
    symbol: 'Gw', name: 'API Gateway', category: 'integration', row: 2, col: 14, cost: 2,
    summary: 'A single entry point that routes external requests to internal services.',
    description: 'The gateway handles edge concerns once: routing, authentication, TLS termination, rate limiting, request shaping. Clients see one stable API while the services behind it can be split, merged, or moved.',
    useWhen: 'Several backend services are exposed to external clients and you want edge concerns handled consistently.',
    watchOutFor: 'Business logic creeping into the gateway turns it into a shared bottleneck that every team has to coordinate on.',
    related: ['bf', 'rl', 'fi', 'ms']
  },
  {
    symbol: 'To', name: 'Timeout', category: 'resilience', row: 2, col: 15, cost: 1,
    summary: 'Never wait forever. Every remote call needs an upper bound.',
    description: 'Without a timeout, one slow dependency holds threads, connections, and memory until the caller falls over too. A timeout turns an unknown wait into a known failure that the rest of the system can handle. Retries, circuit breakers, and fallbacks all depend on it.',
    useWhen: 'Every network call, lock acquisition, and queue read.',
    watchOutFor: 'Timeouts need a budget across the whole call chain. An outer timeout shorter than the sum of the inner ones guarantees wasted work.',
    related: ['re', 'cb', 'gd', 'rq']
  },
  {
    symbol: 'Lb', name: 'Load Balancing', category: 'resilience', row: 2, col: 16, cost: 2,
    summary: 'Spread incoming work across multiple instances.',
    description: 'A load balancer distributes requests so no single instance is overwhelmed, and takes failed instances out of rotation. It is what makes horizontal scaling and zero-downtime deployments possible. Strategies range from round robin to least-connections and consistent hashing.',
    useWhen: 'More than one instance serves the same workload, for capacity or for availability.',
    watchOutFor: 'Sticky sessions and local state undermine it. Instances behind a balancer should be stateless or keep their state elsewhere.',
    related: ['au', 'hc', 'bg', 'ls']
  },
  {
    symbol: 'Lg', name: 'Structured Logging', category: 'observability', row: 2, col: 17, cost: 1,
    summary: 'Emit logs as machine-readable events with consistent fields.',
    description: 'Write log entries as key–value data rather than free text, with a timestamp, severity, correlation ID, and the context that explains the event. Structured logs can be queried and aggregated, not just grepped.',
    useWhen: 'From the first line of code. Adding structure later is expensive.',
    watchOutFor: 'Logging everything is expensive and buries the signal. Never log secrets or personal data.',
    related: ['tr', 'mt', 'hc']
  },
  {
    symbol: 'Dd', name: 'Defense in Depth', category: 'security', row: 2, col: 18, cost: 2,
    summary: 'Layer independent controls so no single failure exposes the system.',
    description: 'Assume any one control will eventually fail: the firewall gets misconfigured, a dependency ships a CVE, a password leaks. Stack network segmentation, authentication, authorization, input validation, encryption, and monitoring so an attacker has to get past several of them.',
    useWhen: 'Protecting anything valuable. It is the baseline posture for production systems.',
    watchOutFor: 'Layers that share the same weakness, such as one credential or one vendor, are not independent.',
    related: ['zt', 'lp', 'tm']
  },

  // Period 3
  {
    symbol: 'En', name: 'Encapsulation', category: 'principles', row: 3, col: 1, cost: 1,
    summary: 'Keep state and the rules that protect it together, behind a boundary.',
    description: 'Callers interact through a defined interface and cannot reach in to change internals directly, so invariants are enforced in one place. At system scale it means a service owns its data and nobody else writes to its tables.',
    useWhen: 'Any state has rules about which values are valid or which transitions are allowed.',
    watchOutFor: 'A getter and setter for every field is not encapsulation. It is a public struct with extra steps.',
    related: ['ab', 'ag', 'dp']
  },
  {
    symbol: 'Di', name: 'Dependency Inversion', category: 'principles', row: 3, col: 2, cost: 2,
    summary: 'Make details depend on policies, not the other way round.',
    description: 'High-level business rules define the interfaces they need, and infrastructure such as databases, queues, and HTTP clients implements them. Source dependencies then point inward toward the core, so the most important code does not change when a vendor or framework does.',
    useWhen: 'You want to test business logic without infrastructure, or you expect the infrastructure to change.',
    watchOutFor: 'Wrapping every class in an interface "for DI" adds indirection without inverting anything. Invert at the boundaries that matter.',
    related: ['ab', 'hx', 'cl']
  },
  {
    symbol: 'Mq', name: 'Message Queue', category: 'integration', row: 3, col: 13, cost: 2,
    summary: 'Producers put work on a queue; consumers take it off when they are ready.',
    description: 'A queue decouples sender and receiver in time. The producer does not need the consumer to be up, and the consumer works at its own pace. Each message is handled by one consumer, which makes queues a natural fit for distributing work.',
    useWhen: 'Work can happen later, must survive a consumer outage, or arrives in bursts that need smoothing.',
    watchOutFor: 'You now own delivery semantics: duplicates, poison messages, ordering, and dead letters. A queue hides a growing backlog until it suddenly doesn\'t.',
    related: ['ps', 'ic', 'bp', 'ox']
  },
  {
    symbol: 'Bf', name: 'Backends for Frontends', category: 'integration', row: 3, col: 14, cost: 2,
    summary: 'A dedicated backend API for each kind of client.',
    description: 'Instead of one general-purpose API that tries to suit web, mobile, and partners, each client gets a thin backend shaped to its needs and owned by the team that builds the client. It aggregates and adapts calls to the services behind it.',
    useWhen: 'Clients have meaningfully different data needs, release cycles, or teams.',
    watchOutFor: 'Logic duplicated across BFFs. Keep them thin: composition and shaping only, no core business rules.',
    related: ['gw', 'ms']
  },
  {
    symbol: 'Re', name: 'Retry with Backoff', label: 'Retry + Backoff', category: 'resilience', row: 3, col: 15, cost: 2,
    summary: 'Try again after a transient failure, waiting longer each time.',
    description: 'Many failures are momentary: a dropped connection, a leader election, a brief overload. Retrying with exponential backoff and random jitter recovers from them without hammering a dependency that is already struggling.',
    useWhen: 'The failure is plausibly transient and the operation is idempotent.',
    watchOutFor: 'Retries at every layer multiply. Three layers with three retries each turn one failure into 27 calls, and a retry storm can knock over a service that was recovering.',
    related: ['to', 'cb', 'ic', 'bp']
  },
  {
    symbol: 'Rl', name: 'Rate Limiting', category: 'resilience', row: 3, col: 16, cost: 2,
    summary: 'Cap how many requests a client can make in a given period.',
    description: 'Rate limits protect shared capacity from runaway clients, abuse, and accidental loops. Token bucket and sliding window are the usual algorithms, applied per client, per key, or per tenant, typically at the edge.',
    useWhen: 'A resource is shared between clients who should not be able to starve each other.',
    watchOutFor: 'Limits that clients cannot see. Return clear signals such as a Retry-After header, or clients will retry immediately and make things worse.',
    related: ['gw', 'ls', 'bp']
  },
  {
    symbol: 'Mt', name: 'Metrics', category: 'observability', row: 3, col: 17, cost: 1,
    summary: 'Numeric time series that show how the system behaves over time.',
    description: 'Counters, gauges, and histograms: request rate, error rate, latency percentiles, saturation. Metrics are cheap to store and fast to query, which makes them the backbone of dashboards and alerting.',
    useWhen: 'You need to know whether something is wrong right now, or how a value trends over weeks.',
    watchOutFor: 'High-cardinality labels such as user IDs explode storage costs. Averages hide the tail, so use percentiles.',
    related: ['sl', 'lg', 'tr', 'au']
  },
  {
    symbol: 'Se', name: 'Secrets Management', label: 'Secrets', category: 'security', row: 3, col: 18, cost: 2,
    summary: 'Store credentials centrally, hand them out at runtime, and rotate them often.',
    description: 'Keys, passwords, and certificates live in a dedicated vault, not in source control, container images, or a .env file on someone\'s laptop. Applications fetch them at runtime using their own identity, and every access is audited. Short-lived, automatically rotated credentials limit the damage of a leak.',
    useWhen: 'Any system that authenticates to anything.',
    watchOutFor: 'The vault becomes a critical dependency. Plan for its availability, and for how a service gets its very first credential.',
    related: ['lp', 'ia', 'zt']
  },

  // Period 4
  {
    symbol: 'Co', name: 'High Cohesion', category: 'principles', row: 4, col: 1, cost: 1,
    summary: 'Things that change together belong together.',
    description: 'A cohesive module has parts that are closely related in purpose, so a typical change touches one place. Cohesion is the other half of coupling: maximise relatedness inside a boundary and minimise dependencies across it.',
    useWhen: 'Deciding module, service, or team boundaries. Look at what actually changes together in your version history.',
    watchOutFor: 'Grouping by technical type, such as all controllers or all repositories, looks tidy but scatters every feature across the codebase.',
    related: ['lc', 'sc', 'bc', 'vs']
  },
  {
    symbol: 'Cp', name: 'Composition over Inheritance', label: 'Composition', category: 'principles', row: 4, col: 2, cost: 1,
    summary: 'Build behaviour by combining small parts rather than extending hierarchies.',
    description: 'Inheritance couples a child to every detail of its parent and fixes the relationship at compile time. Composition assembles behaviour from independent pieces that can be swapped, tested, and reused. The idea scales up: systems assembled from services and plug-ins rather than extended frameworks.',
    useWhen: 'You are tempted to add a base class to share code, or a hierarchy keeps growing sideways.',
    watchOutFor: 'Composition still needs a coherent design. A soup of tiny collaborators wired together at random is no easier to follow than a deep hierarchy.',
    related: ['ab', 'mk', 'lc']
  },
  {
    symbol: 'Mo', name: 'Monolith', category: 'styles', row: 4, col: 3, cost: 1,
    summary: 'One deployable unit containing the whole application.',
    description: 'Everything runs in one process and ships together. Calls are in memory, transactions are local, and there is one thing to deploy and monitor. For most products, at most stages, this is the right place to start.',
    useWhen: 'Early products, small teams, and domains you do not yet understand well enough to split.',
    watchOutFor: 'Without internal boundaries it decays into a big ball of mud. At that point the problem is the mud, not the monolith.',
    related: ['mm', 'la', 'ms']
  },
  {
    symbol: 'Mm', name: 'Modular Monolith', category: 'styles', row: 4, col: 4, cost: 2,
    summary: 'A single deployable with strongly enforced internal module boundaries.',
    description: 'The application is split into modules aligned with business capabilities, each with a public API, private internals, and often its own schema. You keep the operational simplicity of one deployment and get most of the design benefits of services. A module with clean boundaries can be extracted later if it ever needs to be.',
    useWhen: 'You want clear ownership and boundaries without paying the distributed-systems tax.',
    watchOutFor: 'Boundaries that exist only as conventions erode. Enforce them with build rules, architecture tests, or separate assemblies.',
    related: ['mo', 'bc', 'ms', 'ft']
  },
  {
    symbol: 'La', name: 'Layered Architecture', label: 'Layered', category: 'styles', row: 4, col: 5, cost: 1,
    summary: 'Organise code into horizontal layers, each depending only on the one below.',
    description: 'The classic stack of presentation, business logic, and data access. Each layer has a clear technical role, and the structure is familiar to almost every developer. It is easy to start with and easy to explain.',
    useWhen: 'CRUD-heavy applications where most changes really are technical rather than driven by the domain.',
    watchOutFor: 'Features cut through every layer, so small changes touch many files, and business logic leaks into whichever layer is convenient.',
    related: ['hx', 'cl', 'vs', 'sc']
  },
  {
    symbol: 'Hx', name: 'Hexagonal Architecture', label: 'Hexagonal', category: 'styles', row: 4, col: 6, cost: 2,
    summary: 'The application core talks to the outside world only through ports, with adapters at the edges.',
    description: 'Alistair Cockburn\'s Ports and Adapters pattern puts business logic in the centre and defines ports for everything it needs or offers. Adapters for HTTP, databases, queues, and tests plug into those ports, so the core can run and be tested without any infrastructure at all.',
    useWhen: 'The business logic is valuable enough to protect from framework and infrastructure churn, and you want fast, isolated tests.',
    watchOutFor: 'Ceremony. A thin CRUD service does not need a port for every table.',
    related: ['di', 'cl', 'ac', 'la']
  },
  {
    symbol: 'Ul', name: 'Ubiquitous Language', category: 'domain', row: 4, col: 7, cost: 1,
    summary: 'One shared vocabulary between domain experts and the code, used everywhere.',
    description: 'Terms from the business appear unchanged in conversations, documentation, and code: class names, method names, events. When the language is shared, misunderstandings surface early and the model in the code stays recognisable to the people who own the domain.',
    useWhen: 'Always, within a bounded context. It pays off most where the domain is complex or terms are easily confused.',
    watchOutFor: 'A word can legitimately mean different things in different parts of the business. Do not force one global definition; that is what bounded contexts are for.',
    related: ['bc', 'et', 'cm']
  },
  {
    symbol: 'Bc', name: 'Bounded Context', category: 'domain', row: 4, col: 8, cost: 2,
    summary: 'An explicit boundary within which one model and its language are consistent.',
    description: 'Large domains cannot share a single model. "Customer" means something different to sales, billing, and support. A bounded context draws a line around one model, and translation happens explicitly at that line. Contexts are the strongest candidates for module, service, and team boundaries.',
    useWhen: 'The domain is big enough that terms start to mean different things to different groups.',
    watchOutFor: 'Drawing boundaries around nouns or database tables instead of around language and behaviour.',
    related: ['ul', 'cm', 'ac', 'ms', 'mm']
  },
  {
    symbol: 'Ag', name: 'Aggregate', category: 'domain', row: 4, col: 9, cost: 2,
    summary: 'A cluster of objects changed as one unit, with a single root that guards its invariants.',
    description: 'An aggregate defines a consistency boundary. Everything inside it changes in one transaction through the root; anything outside is referenced by identity and updated eventually. Small aggregates keep contention low and make the rules explicit.',
    useWhen: 'You need to enforce business invariants that span several related objects.',
    watchOutFor: 'Large aggregates cause lock contention and slow loads. If two things do not need to be consistent immediately, they probably belong in different aggregates.',
    related: ['en', 'de', 'es']
  },
  {
    symbol: 'Dp', name: 'Database per Service', label: 'DB per Service', category: 'data', row: 4, col: 10, cost: 3,
    summary: 'Each service owns its data store, and nobody else touches it directly.',
    description: 'Private data is what makes services independently deployable. Schemas can change without coordinating with other teams, and each service can pick storage that fits its access patterns. Everyone else gets the data through APIs or events.',
    useWhen: 'Services are owned by different teams and need to evolve independently.',
    watchOutFor: 'Queries and transactions that span services become distributed problems. Joins turn into API calls, and consistency becomes eventual.',
    related: ['ms', 'sg', 'cc', 'mv']
  },
  {
    symbol: 'Ca', name: 'Cache-Aside', category: 'data', row: 4, col: 11, cost: 2,
    summary: 'Read from the cache first; on a miss, load from the source and fill the cache.',
    description: 'The application manages the cache explicitly. Hot data is served from memory, which takes load off the database and cuts latency. It is the most common caching pattern because it is simple and fails safe: if the cache is down, the source still works.',
    useWhen: 'Read-heavy data that can tolerate being slightly stale.',
    watchOutFor: 'Invalidation. Decide up front how stale is acceptable and how entries expire, and watch for stampedes when a hot key expires.',
    related: ['mv', 'rp', 'cq']
  },
  {
    symbol: 'Rp', name: 'Read Replicas', category: 'data', row: 4, col: 12, cost: 2,
    summary: 'Copy data to secondary nodes that serve reads.',
    description: 'The primary handles writes and replicates them to one or more replicas, which absorb read traffic and act as failover targets. It is the first step most systems take when one database can no longer keep up with reads.',
    useWhen: 'Reads far outnumber writes and slightly delayed reads are acceptable.',
    watchOutFor: 'Replication lag. A user who writes and then immediately reads from a replica may not see their own change.',
    related: ['sh', 'ca', 'cq']
  },
  {
    symbol: 'Ps', name: 'Publish–Subscribe', label: 'Pub/Sub', category: 'integration', row: 4, col: 13, cost: 2,
    summary: 'Publishers broadcast messages to a topic, and every subscriber gets a copy.',
    description: 'Publishers do not know who is listening, so new consumers can be added without changing the producer. That makes pub/sub the backbone of event-driven systems. Each subscriber processes independently, at its own pace.',
    useWhen: 'Several parts of the system need to react to the same thing happening.',
    watchOutFor: 'Invisible dependencies. When anyone can subscribe, nobody knows what breaks when an event\'s shape changes. Treat events as public contracts.',
    related: ['mq', 'ed', 'de', 'ev']
  },
  {
    symbol: 'Ic', name: 'Idempotent Consumer', category: 'integration', row: 4, col: 14, cost: 2,
    summary: 'Processing the same message twice has the same effect as processing it once.',
    description: 'Most messaging systems guarantee at-least-once delivery, so duplicates will happen. An idempotent consumer detects repeats, usually by recording processed message IDs, or makes operations naturally idempotent, for example by setting a value instead of incrementing it.',
    useWhen: 'Consuming from any queue or stream, and in any API that clients may retry.',
    watchOutFor: 'The deduplication record must be written atomically with the side effect. Otherwise you have only moved the problem.',
    related: ['mq', 're', 'ox', 'sg']
  },
  {
    symbol: 'Cb', name: 'Circuit Breaker', category: 'resilience', row: 4, col: 15, cost: 2,
    summary: 'Stop calling a failing dependency for a while, then check whether it has recovered.',
    description: 'Popularised by Michael Nygard in Release It! After enough failures the breaker opens, and calls fail fast without touching the dependency. That gives the dependency room to recover and frees the caller\'s resources. After a cool-down, a trial request goes through, and success closes the circuit again.',
    useWhen: 'Calling remote dependencies that can fail or slow down, especially ones shared by many callers.',
    watchOutFor: 'Badly tuned thresholds either trip on normal noise or never trip at all. Pair it with a fallback so an open circuit still does something useful.',
    related: ['to', 're', 'bh', 'gd']
  },
  {
    symbol: 'Au', name: 'Autoscaling', category: 'resilience', row: 4, col: 16, cost: 3,
    summary: 'Add or remove capacity automatically, based on demand.',
    description: 'Instances, containers, or functions scale out when load rises and back in when it falls, driven by signals such as CPU, queue depth, or request rate. You pay for what you use and ride out spikes without anyone getting paged.',
    useWhen: 'Load is variable and the workload is stateless or can be partitioned.',
    watchOutFor: 'Scaling is not instant. Cold starts and provisioning lag mean you still need headroom, and downstream dependencies like databases may not scale with you.',
    related: ['lb', 'mt', 'sv', 'ls']
  },
  {
    symbol: 'Hc', name: 'Health Checks', category: 'observability', row: 4, col: 17, cost: 1,
    summary: 'Endpoints that report whether an instance is alive and ready for traffic.',
    description: 'Orchestrators and load balancers poll health endpoints to decide when to restart an instance and when to send it traffic. Separating liveness ("restart me") from readiness ("don\'t send me work yet") prevents a whole class of self-inflicted outages.',
    useWhen: 'Anything running behind a load balancer or an orchestrator.',
    watchOutFor: 'Readiness checks that call a shared dependency can pull the entire fleet out of rotation the moment that dependency blips.',
    related: ['lb', 'mt', 'gd']
  },
  {
    symbol: 'Fi', name: 'Federated Identity', category: 'security', row: 4, col: 18, cost: 2,
    summary: 'Delegate authentication to a trusted identity provider.',
    description: 'Users and services authenticate once against an identity provider using standards such as OpenID Connect, OAuth 2.0, or SAML, and applications trust the resulting tokens. Applications stop storing passwords, and policies like MFA are enforced in one place.',
    useWhen: 'More than one application needs to know who the user is.',
    watchOutFor: 'The identity provider is now critical infrastructure. Validate tokens properly: issuer, audience, expiry, and signature.',
    related: ['zt', 'lp', 'gw']
  },

  // Period 5
  {
    symbol: 'Lc', name: 'Loose Coupling', category: 'principles', row: 5, col: 1, cost: 1,
    summary: 'Parts should know as little about each other as possible.',
    description: 'Coupling is the degree to which a change in one place forces a change somewhere else. It comes in many forms: shared code, shared data, synchronous calls, shared deployments, shared assumptions about timing. Architecture is largely the practice of choosing which coupling to accept.',
    useWhen: 'Every boundary decision. Ask what has to change on the other side when this side changes.',
    watchOutFor: 'Decoupling is never free. Every indirection costs latency, operational effort, or understanding, so couple deliberately where it is cheap.',
    related: ['co', 'sc', 'mq', 'ps']
  },
  {
    symbol: 'Ya', name: 'You Aren\'t Gonna Need It', label: 'YAGNI', category: 'principles', row: 5, col: 2, cost: 1,
    summary: 'Do not build for requirements you do not have yet.',
    description: 'Speculative flexibility costs something today, in code, complexity, and attention, for a benefit that may never arrive. When the real requirement shows up it usually looks different from the guess. Build the simplest thing that meets today\'s need and keep it easy to change.',
    useWhen: 'You hear "we might need" or "just in case" in a design discussion.',
    watchOutFor: 'YAGNI is not a reason to ignore known requirements or one-way-door decisions. Some things, like security and partitioning keys, are far cheaper to design in early.',
    related: ['ks', 'rv', 'ea']
  },
  {
    symbol: 'Cl', name: 'Clean Architecture', label: 'Clean / Onion', category: 'styles', row: 5, col: 3, cost: 2,
    summary: 'Concentric layers with business rules at the centre and dependencies pointing inward.',
    description: 'A family that includes Onion and Clean Architecture: entities and use cases in the middle, interface adapters around them, frameworks and drivers on the outside. Like Hexagonal, it keeps the core independent of delivery mechanisms and storage.',
    useWhen: 'Long-lived systems whose business rules will outlast their frameworks.',
    watchOutFor: 'Rigid folder templates and mapping between near-identical models at every ring. Apply the dependency rule, not the template.',
    related: ['hx', 'di', 'la']
  },
  {
    symbol: 'Mk', name: 'Microkernel', category: 'styles', row: 5, col: 4, cost: 3,
    summary: 'A minimal core system extended by independent plug-ins.',
    description: 'The core provides the essential runtime and a set of extension points, and features arrive as plug-ins that register against them. IDEs, browsers, and many product platforms work this way. It suits products where customers or third parties add capability without changing the core.',
    useWhen: 'Per-customer customisation or third-party extension is a core requirement.',
    watchOutFor: 'The plug-in contract is a public API you will support for years. Version it carefully.',
    related: ['cp', 'ab', 'mm']
  },
  {
    symbol: 'Pf', name: 'Pipes and Filters', category: 'styles', row: 5, col: 5, cost: 2,
    summary: 'Process data through a chain of independent steps, each transforming its input.',
    description: 'Each filter performs one transformation and passes its output down a pipe to the next. Filters can be reordered, reused, and scaled independently. Unix pipelines, ETL jobs, compilers, and stream processors all have this shape.',
    useWhen: 'The work is naturally a sequence of transformations over a stream or batch of data.',
    watchOutFor: 'A poor fit for interactive workflows that branch or call back. Error handling across stages needs deliberate design.',
    related: ['ev', 'bp', 'sc']
  },
  {
    symbol: 'Sb', name: 'Service-Based Architecture', label: 'Service-Based', category: 'styles', row: 5, col: 6, cost: 3,
    summary: 'A handful of coarse-grained services, often sharing a database.',
    description: 'The pragmatic middle ground between a monolith and microservices: typically four to twelve domain services, deployed separately, frequently against one shared database. You get deployment independence and fault isolation for a fraction of the operational cost of fine-grained services. Classic SOA, with its enterprise service bus, is the more centralised ancestor.',
    useWhen: 'You need some independent deployability but not the full microservices operating model.',
    watchOutFor: 'The shared database couples services more tightly than their separate deployments suggest. Schema changes still need coordination.',
    related: ['mm', 'ms', 'dp']
  },
  {
    symbol: 'Cm', name: 'Context Map', category: 'domain', row: 5, col: 7, cost: 2,
    summary: 'A map of the bounded contexts and the relationships between them.',
    description: 'A context map shows which contexts exist, who depends on whom, and what kind of relationship applies: partnership, customer–supplier, conformist, anti-corruption layer, shared kernel. It makes political and technical dependencies visible on the same page.',
    useWhen: 'Several teams or systems interact, and integration pain keeps catching people by surprise.',
    watchOutFor: 'A map drawn once and never updated. It is only useful if it reflects reality.',
    related: ['bc', 'ac', 'oh', 'tt']
  },
  {
    symbol: 'Ac', name: 'Anti-Corruption Layer', label: 'Anti-Corruption', category: 'domain', row: 5, col: 8, cost: 2,
    summary: 'A translation layer that keeps a foreign model from leaking into yours.',
    description: 'When integrating with a legacy system or a third-party API, the ACL translates their concepts into your model and back. Your domain stays clean, and when the external system changes, only the translation layer has to follow.',
    useWhen: 'Integrating with a system whose model you do not control, or do not want to adopt.',
    watchOutFor: 'It is real code that needs real maintenance, and it becomes a bottleneck if every change on either side requires work there.',
    related: ['bc', 'sf', 'hx', 'cm']
  },
  {
    symbol: 'De', name: 'Domain Events', category: 'domain', row: 5, col: 9, cost: 2,
    summary: 'Record that something meaningful happened in the domain, named in the past tense.',
    description: 'OrderPlaced, PaymentFailed, ShipmentDispatched. Domain events capture business facts in the ubiquitous language and let other parts of the system react without the originator knowing about them. They are the building blocks of event-driven integration and event sourcing.',
    useWhen: 'Other parts of the system care that something happened, or the history of changes has business value.',
    watchOutFor: 'Commands in disguise, such as SendEmail, and events that expose internal state. Both couple consumers tightly to the producer.',
    related: ['ag', 'ps', 'es', 'ed']
  },
  {
    symbol: 'Cq', name: 'Command Query Responsibility Segregation', label: 'CQRS', category: 'data', row: 5, col: 10, cost: 3,
    summary: 'Use separate models for changing data and for reading it.',
    description: 'Commands go through a model built to enforce rules. Queries read from models built for display, often denormalised and sometimes in a different store. Each side can be shaped and scaled for its own job.',
    useWhen: 'Read and write needs differ sharply in shape or volume, or a rich domain model makes queries awkward.',
    watchOutFor: 'Two models to maintain and, when the stores are separate, eventual consistency between them. Overkill for plain CRUD.',
    related: ['es', 'mv', 'rp']
  },
  {
    symbol: 'Mv', name: 'Materialized View', category: 'data', row: 5, col: 11, cost: 2,
    summary: 'Precompute query results into a read-optimised form.',
    description: 'Instead of joining and aggregating on every read, build the answer ahead of time and update it as the source data changes. Views can live in the same database or be projected into a search index, cache, or document store.',
    useWhen: 'Expensive queries run far more often than the underlying data changes.',
    watchOutFor: 'Views go stale and have to be rebuildable from the source. Plan for rebuilds from day one.',
    related: ['cq', 'ca', 'cc', 'es']
  },
  {
    symbol: 'Sh', name: 'Sharding', category: 'data', row: 5, col: 12, cost: 4,
    summary: 'Split data horizontally across multiple databases by a partition key.',
    description: 'Each shard holds a subset of the rows, for example by tenant or customer ID range, so write load and storage spread across machines. It is how systems scale writes beyond what one database can handle.',
    useWhen: 'A single database can no longer handle the write volume or data size, and the data has a natural partition key.',
    watchOutFor: 'Cross-shard queries and transactions get hard. A bad shard key creates hot spots, and resharding later is painful.',
    related: ['rp', 'ce', 'dp']
  },
  {
    symbol: 'Ev', name: 'Event Streaming', category: 'integration', row: 5, col: 13, cost: 3,
    summary: 'An append-only, replayable log of events that each consumer reads at its own position.',
    description: 'Unlike a queue, a stream such as Kafka keeps events after they have been read. Consumers track their own offsets, new consumers can replay history, and ordering is preserved within a partition. A stream works both as an integration backbone and as a source for derived data.',
    useWhen: 'Several consumers need the same events, replay matters, or you are building real-time pipelines.',
    watchOutFor: 'Operational weight, partition design, and schema evolution. A stream retains your mistakes as faithfully as your data.',
    related: ['ps', 'cc', 'es', 'pf']
  },
  {
    symbol: 'Ox', name: 'Transactional Outbox', label: 'Outbox', category: 'integration', row: 5, col: 14, cost: 3,
    summary: 'Write the message to an outbox table in the same transaction as the state change, then publish it.',
    description: 'A database and a message broker cannot share a transaction. The outbox pattern writes the state change and the outgoing message to the database atomically, and a separate relay publishes outbox rows to the broker. You get reliable at-least-once publishing without distributed transactions.',
    useWhen: 'A state change must reliably produce an event or message.',
    watchOutFor: 'Consumers will see duplicates, so pair it with idempotent consumers. The relay is one more process to run and monitor.',
    related: ['ic', 'cc', 'sg', 'ps']
  },
  {
    symbol: 'Bh', name: 'Bulkhead', category: 'resilience', row: 5, col: 15, cost: 3,
    summary: 'Isolate resources so a failure in one area cannot sink the whole system.',
    description: 'Named after the watertight compartments in a ship\'s hull. Give each dependency or tenant its own thread pool, connection pool, or set of instances, so exhaustion in one place stays contained.',
    useWhen: 'One slow dependency or noisy tenant could otherwise consume resources everyone shares.',
    watchOutFor: 'Partitioning lowers overall utilisation. Size the compartments from real traffic data.',
    related: ['cb', 'ce', 'to']
  },
  {
    symbol: 'Bp', name: 'Backpressure', category: 'resilience', row: 5, col: 16, cost: 3,
    summary: 'Let a slow consumer tell producers to slow down.',
    description: 'When a downstream stage cannot keep up, unbounded buffering eventually exhausts memory. Backpressure pushes the constraint upstream through bounded queues, pull-based consumption, or explicit flow control, so the system degrades gracefully instead of collapsing.',
    useWhen: 'Producers can outpace consumers, as in streaming pipelines and high-throughput services.',
    watchOutFor: 'Somewhere at the edge you still have to decide what happens when the system is full: wait, shed, or reject.',
    related: ['ls', 'rl', 'mq', 'pf']
  },
  {
    symbol: 'Tr', name: 'Distributed Tracing', category: 'observability', row: 5, col: 17, cost: 2,
    summary: 'Follow a single request as it travels through every service it touches.',
    description: 'A trace ID is propagated across process boundaries, and each service records spans with timing and metadata. The assembled trace shows where the time went and where the errors happened. OpenTelemetry has made this vendor-neutral.',
    useWhen: 'Requests cross more than a couple of services, and "which one is slow?" has become hard to answer.',
    watchOutFor: 'Context propagation breaks silently across async boundaries and third-party hops, and sampling decisions limit what you can debug later.',
    related: ['lg', 'mt', 'ms', 'sl']
  },
  {
    symbol: 'Zt', name: 'Zero Trust', category: 'security', row: 5, col: 18, cost: 3,
    summary: 'Never trust a request because of where it comes from. Verify every one.',
    description: 'The network perimeter no longer defines what is safe. Every request, internal or external, is authenticated, authorised, and encrypted based on identity and context. Service-to-service traffic uses mutual TLS or signed tokens.',
    useWhen: 'Your systems span clouds, offices, and remote work, which today describes most systems.',
    watchOutFor: 'It is an end state you reach incrementally, not a product you buy. Start by giving every workload an identity.',
    related: ['lp', 'dd', 'fi', 'sd']
  },

  // Period 6
  {
    symbol: 'Ks', name: 'Simplicity', category: 'principles', row: 6, col: 1, cost: 1,
    summary: 'Choose the simplest design that solves the actual problem.',
    description: 'Complexity is the dominant cost in software. Every moving part has to be understood, operated, and debugged by someone, eventually at three in the morning. A simple design is not a naive one; it is what remains after removing everything the problem does not demand. Often summarised as KISS: keep it simple.',
    useWhen: 'Comparing options. Ask which one has fewer concepts, fewer moving parts, and fewer ways to fail.',
    watchOutFor: 'Simple is not the same as easy or familiar. The simple design often takes more thinking up front.',
    related: ['ya', 'rv', 'mo']
  },
  {
    symbol: 'Rv', name: 'Reversibility', category: 'principles', row: 6, col: 2, cost: 2,
    summary: 'Prefer decisions that are cheap to undo, and spend your care on the ones that are not.',
    description: 'Some decisions are two-way doors that are easy to walk back through. Others, like data models, public APIs, and partition keys, are one-way doors. Much of architecture is telling the two apart: move fast on the first kind and slow down, or defer, on the second.',
    useWhen: 'Planning any significant decision. Ask what it would cost to reverse a year from now.',
    watchOutFor: 'Treating every decision as irreversible paralyses a team. Treating irreversible ones casually creates years of migration work.',
    related: ['ya', 'ad', 'ea', 'ff']
  },
  {
    symbol: 'Ms', name: 'Microservices', category: 'styles', row: 6, col: 3, cost: 5,
    summary: 'Small, independently deployable services, each owning a business capability and its data.',
    description: 'Each service is built, deployed, and scaled on its own by a team that owns it end to end. The payoff is organisational: many teams can ship without coordinating releases. The price is that you now run a distributed system, with network failures, eventual consistency, and a serious operations burden.',
    useWhen: 'Many teams need to ship independently, and you can afford the platform and operational maturity it takes.',
    watchOutFor: 'The distributed monolith: services that must be deployed together because they share data or call each other synchronously everywhere. Also, starting here before you understand the domain.',
    related: ['mm', 'bc', 'dp', 'tr', 'tt']
  },
  {
    symbol: 'Ed', name: 'Event-Driven Architecture', label: 'Event-Driven', category: 'styles', row: 6, col: 4, cost: 4,
    summary: 'Components communicate by producing and reacting to events instead of calling each other.',
    description: 'When something happens, a component publishes an event, and anything interested reacts. Producers and consumers are decoupled in time and in knowledge, which makes the system easy to extend and tolerant of individual consumer failures.',
    useWhen: 'Many parts of the system react to the same business facts, or you need strong decoupling and high throughput.',
    watchOutFor: 'The flow is no longer visible in the code; it emerges at runtime. Debugging, ordering, and eventual consistency all get harder.',
    related: ['de', 'ps', 'ev', 'sg', 'tr']
  },
  {
    symbol: 'Sv', name: 'Serverless', category: 'styles', row: 6, col: 5, cost: 3,
    summary: 'Run code as managed, event-triggered functions without managing servers.',
    description: 'The platform handles provisioning, scaling, and patching, and you pay per invocation. Functions are triggered by HTTP requests, queue messages, file uploads, or schedules. Operational overhead drops sharply for spiky or low-volume workloads.',
    useWhen: 'Event-driven glue, spiky traffic, and teams that want as little operations work as possible.',
    watchOutFor: 'Cold starts, execution limits, vendor lock-in, harder local testing, and bills that overtake containers at steady high volume.',
    related: ['ed', 'au', 'mq']
  },
  {
    symbol: 'Ce', name: 'Cell-Based Architecture', label: 'Cell-Based', category: 'styles', row: 6, col: 6, cost: 5,
    summary: 'Partition the whole system into isolated, identical cells, each serving a subset of customers.',
    description: 'Each cell is a complete, independent copy of the stack, and a thin routing layer assigns customers to cells. A bad deployment or failure only affects the customers in one cell, which caps the blast radius, and capacity grows by adding cells.',
    useWhen: 'Large multi-tenant systems where blast radius and predictable scaling matter more than cost.',
    watchOutFor: 'A significant operational investment: cell routing, moving customers between cells, and features that need data from more than one cell.',
    related: ['bh', 'sh', 'cn']
  },
  {
    symbol: 'Cr', name: 'Core Domain', category: 'domain', row: 6, col: 7, cost: 2,
    summary: 'Find the part of the business that sets you apart, and invest there.',
    description: 'Strategic domain-driven design splits the problem into core, supporting, and generic subdomains. The core gets your best people and carefully built models. Supporting subdomains get simpler solutions, and generic ones, such as payments, email, or identity, are bought or outsourced.',
    useWhen: 'Deciding where to spend design effort, and what to build versus buy.',
    watchOutFor: 'Everyone believes their area is core. Be honest: if a competitor could buy the same thing off the shelf, it is not.',
    related: ['bc', 'et', 'tt']
  },
  {
    symbol: 'Oh', name: 'Open Host Service', category: 'domain', row: 6, col: 8, cost: 3,
    summary: 'Offer a documented, stable protocol that any consumer can integrate with.',
    description: 'Instead of building a custom integration for every consumer, a context publishes a general-purpose API, usually paired with a published language such as a documented schema. Consumers adapt to it, and the provider evolves it through versioning.',
    useWhen: 'Many consumers need to integrate with the same context.',
    watchOutFor: 'A public protocol is hard to change. Design and version it as a product.',
    related: ['cm', 'ac', 'gw']
  },
  {
    symbol: 'Vs', name: 'Vertical Slices', category: 'domain', row: 6, col: 9, cost: 2,
    summary: 'Organise code by feature, each slice owning everything from request to storage.',
    description: 'Each use case lives in one place with its own handler, data access, and model, instead of being spread across shared layers. Slices can use whatever approach suits them, and adding a feature means adding code rather than changing shared abstractions.',
    useWhen: 'Feature-heavy applications where most changes happen per use case.',
    watchOutFor: 'Duplication between slices. Extract shared domain logic deliberately, once it has actually emerged.',
    related: ['co', 'la', 'cq']
  },
  {
    symbol: 'Es', name: 'Event Sourcing', category: 'data', row: 6, col: 10, cost: 5,
    summary: 'Store state as the sequence of events that produced it.',
    description: 'Instead of overwriting rows, append every change as an immutable event and derive current state by replaying them. You get a complete audit trail, the ability to reconstruct state at any point in time, and the option to build new read models from old history.',
    useWhen: 'Audit and history are core requirements, or the domain is naturally a sequence of events, as in finance, logistics, and workflow.',
    watchOutFor: 'Event schemas are forever, so versioning is unavoidable, and every query needs a projection. The learning curve is steep, and it is very hard to remove once adopted.',
    related: ['de', 'cq', 'mv', 'ag']
  },
  {
    symbol: 'Cc', name: 'Change Data Capture', category: 'data', row: 6, col: 11, cost: 3,
    summary: 'Stream row-level changes out of a database\'s transaction log.',
    description: 'Tools such as Debezium read the database\'s write-ahead log and publish every insert, update, and delete as an event. Other systems can react to changes without the source application knowing, which makes CDC useful for migrations, cache invalidation, and feeding analytics.',
    useWhen: 'You need changes from a database you cannot or do not want to modify, or a reliable relay for an outbox.',
    watchOutFor: 'Raw table changes expose your internal schema to consumers. Publish curated events where you can.',
    related: ['ox', 'ev', 'sf', 'mv']
  },
  {
    symbol: 'Dm', name: 'Data Mesh', category: 'data', row: 6, col: 12, cost: 5,
    summary: 'Treat analytical data as a product owned by domain teams, on a self-serve platform.',
    description: 'Zhamak Dehghani\'s answer to the central data lake bottleneck. Domain teams publish their analytical data as discoverable, documented products. A platform team provides the tooling, and federated governance sets the shared standards.',
    useWhen: 'A large organisation where a central data team has become the bottleneck for analytics.',
    watchOutFor: 'It is an organisational change before it is a technical one. Without mature domain teams and real platform investment, you get fragmentation, not a mesh.',
    related: ['bc', 'pl', 'tt']
  },
  {
    symbol: 'Sg', name: 'Saga', category: 'integration', row: 6, col: 13, cost: 4,
    summary: 'Run a multi-step business transaction as local transactions with compensating actions.',
    description: 'When a business process spans several services, there is no single ACID transaction to lean on. A saga runs each step locally and, when a step fails, runs compensating actions to undo the earlier ones. Steps are coordinated by choreography, where services react to each other\'s events, or by orchestration, where a coordinator directs each step.',
    useWhen: 'A business process has to keep data consistent across services that each own their data.',
    watchOutFor: 'Compensations are business logic, not rollbacks, and some actions, like sending an email, cannot be undone. Other processes can see the intermediate states.',
    related: ['or', 'ox', 'ic', 'dp']
  },
  {
    symbol: 'Or', name: 'Process Orchestration', label: 'Orchestration', category: 'integration', row: 6, col: 14, cost: 4,
    summary: 'A central coordinator drives a long-running workflow, step by step.',
    description: 'The orchestrator holds the process state, calls each participant, handles timeouts and retries, and decides what happens next. Durable workflow engines such as Temporal and Camunda persist that state, so a process survives crashes and can run for days.',
    useWhen: 'Complex, long-running processes where seeing and controlling the flow in one place matters.',
    watchOutFor: 'The orchestrator slowly absorbs logic that belongs in the services. Workflow engines are significant infrastructure in their own right.',
    related: ['sg', 'ed', 're']
  },
  {
    symbol: 'Gd', name: 'Graceful Degradation', category: 'resilience', row: 6, col: 15, cost: 3,
    summary: 'When part of the system fails, keep serving a reduced but useful experience.',
    description: 'Show cached recommendations when the recommendation service is down. Accept the order now and take payment later. Hide a non-essential widget instead of failing the page. Decide which features are essential, and what the fallback is for everything else.',
    useWhen: 'Some functionality is critical and some is nice to have, which describes nearly every user-facing product.',
    watchOutFor: 'Fallback paths rarely run, so they rot. Exercise them on purpose, for example with chaos experiments.',
    related: ['cb', 'ls', 'ff', 'cx']
  },
  {
    symbol: 'Ls', name: 'Load Shedding', category: 'resilience', row: 6, col: 16, cost: 3,
    summary: 'Under overload, deliberately reject some work to protect the rest.',
    description: 'A system at capacity that accepts everything ends up serving nothing well. Load shedding drops low-priority or excess requests early, while it is still cheap, so the remaining requests succeed and latency stays bounded for the work that matters most.',
    useWhen: 'Overload is possible and some requests matter more than others.',
    watchOutFor: 'Shedding needs priorities. Without them you may drop the checkout and keep the analytics beacon.',
    related: ['rl', 'bp', 'gd', 'au']
  },
  {
    symbol: 'Sl', name: 'SLOs & Error Budgets', label: 'SLOs', category: 'observability', row: 6, col: 17, cost: 3,
    summary: 'Set explicit reliability targets, and use the margin to decide when to ship and when to stabilise.',
    description: 'A service level objective defines "good enough", for example 99.9% of requests answered in under 300 ms. The remaining 0.1% is the error budget. While budget remains, teams ship freely; once it is spent, reliability work comes first. Reliability stops being an argument and becomes a number.',
    useWhen: 'Teams argue about whether reliability or features come first, or alerting is noisy and ignored.',
    watchOutFor: 'Objectives must reflect what users actually experience. Too many SLOs, or targets nobody acts on, add ceremony without value.',
    related: ['mt', 'tr', 'cn', 'qa']
  },
  {
    symbol: 'Tm', name: 'Threat Modeling', category: 'security', row: 6, col: 18, cost: 3,
    summary: 'Systematically ask what can go wrong from an attacker\'s point of view, before you build.',
    description: 'Map the system, its data flows, and its trust boundaries, then walk through likely threats with a framework such as STRIDE. The output is a prioritised list of mitigations that get designed in rather than bolted on.',
    useWhen: 'Designing a new system, adding a trust boundary, or starting to handle sensitive data.',
    watchOutFor: 'Doing it once, as a compliance document. Revisit the model whenever the architecture changes.',
    related: ['dd', 'zt', 'ad', 'qa']
  },

  // Delivery & Evolution series
  {
    symbol: 'Cd', name: 'Continuous Delivery', category: 'delivery', row: 8, col: 3, cost: 3,
    summary: 'Keep software releasable at all times through an automated pipeline.',
    description: 'Every change goes through the same automated build, test, and deployment pipeline, so releasing becomes a routine business decision rather than a risky event. Small, frequent changes are easier to verify, debug, and roll back than large ones.',
    useWhen: 'Always aim for it. Deployment frequency and lead time are among the strongest predictors of delivery performance.',
    watchOutFor: 'A pipeline is only as trustworthy as its tests. Slow or flaky pipelines push people back toward big batches.',
    related: ['ia', 'ff', 'cn', 'ft']
  },
  {
    symbol: 'Ia', name: 'Infrastructure as Code', label: 'Infra as Code', category: 'delivery', row: 8, col: 4, cost: 2,
    summary: 'Define infrastructure in version-controlled, reviewable code.',
    description: 'Networks, servers, databases, and permissions are declared with tools like Terraform, Pulumi, or Bicep and applied automatically. Environments become reproducible, changes get reviewed like application code, and drift becomes visible.',
    useWhen: 'Any infrastructure you would need to recreate, audit, or replicate across environments.',
    watchOutFor: 'Manual changes in the cloud console bring drift right back. State files and secrets in IaC need careful handling.',
    related: ['ii', 'cd', 'pl', 'se']
  },
  {
    symbol: 'Ii', name: 'Immutable Infrastructure', label: 'Immutable Infra', category: 'delivery', row: 8, col: 5, cost: 2,
    summary: 'Never modify running servers. Replace them with new ones built from a known image.',
    description: 'Changes are made by building a new image or container and redeploying, never by patching in place. Every instance is identical and reproducible, and rolling back means redeploying the previous version.',
    useWhen: 'Deploying to cloud or container platforms, where it is close to the default.',
    watchOutFor: 'State has to live outside the instance, and debugging by logging into a box gets harder, which pushes you toward better observability.',
    related: ['ia', 'bg', 'cd']
  },
  {
    symbol: 'Sd', name: 'Sidecar', category: 'delivery', row: 8, col: 6, cost: 3,
    summary: 'Deploy a helper process next to each service to handle cross-cutting concerns.',
    description: 'The sidecar runs alongside the application, in the same pod or on the same host, and handles proxying, mTLS, telemetry, or configuration without changes to application code. Service meshes are built out of sidecars.',
    useWhen: 'Services written in different languages all need the same infrastructure capability.',
    watchOutFor: 'Extra resources and latency for every instance, and one more component to upgrade across the fleet.',
    related: ['zt', 'tr', 'pl']
  },
  {
    symbol: 'Bg', name: 'Blue–Green Deployment', label: 'Blue–Green', category: 'delivery', row: 8, col: 7, cost: 3,
    summary: 'Run two production environments and switch traffic from old to new in one step.',
    description: 'Deploy the new version to the idle environment, verify it, then flip the router. If anything goes wrong, flip back. Rollback is instant because the old version is still running.',
    useWhen: 'You need near-zero-downtime releases and fast, low-risk rollback.',
    watchOutFor: 'Database schema changes must work with both versions at once, and running two environments costs money.',
    related: ['cn', 'lb', 'ii']
  },
  {
    symbol: 'Cn', name: 'Canary Release', category: 'delivery', row: 8, col: 8, cost: 3,
    summary: 'Roll a change out to a small slice of traffic first, and widen it only while the metrics stay healthy.',
    description: 'A small percentage of users, or one region, gets the new version while its metrics are compared against the current one. Problems surface with a limited blast radius, and the rollout can halt automatically on a regression.',
    useWhen: 'A change carries risk that only real production traffic will reveal.',
    watchOutFor: 'You need good metrics and enough traffic for the comparison to mean anything, plus sticky routing so users get a consistent experience.',
    related: ['bg', 'ff', 'sl', 'mt']
  },
  {
    symbol: 'Ff', name: 'Feature Flags', category: 'delivery', row: 8, col: 9, cost: 2,
    summary: 'Separate deploying code from releasing a feature.',
    description: 'New behaviour ships behind a runtime toggle that can be switched per user, segment, or percentage. Teams can merge unfinished work to trunk, test in production, and switch off a misbehaving feature without a deployment.',
    useWhen: 'You want release decisions to be independent of deployments, or you want to run experiments.',
    watchOutFor: 'Every flag is a branch in your code. Remove flags once a feature is fully rolled out, or the combinations become untestable.',
    related: ['cd', 'cn', 'ba', 'gd']
  },
  {
    symbol: 'Ba', name: 'Branch by Abstraction', category: 'delivery', row: 8, col: 10, cost: 2,
    summary: 'Replace a component incrementally behind an abstraction while still shipping from trunk.',
    description: 'Introduce an abstraction over the component you want to replace, move callers onto it, build the new implementation behind it, switch over, and delete the old one. The system stays releasable at every step, with no long-lived branch.',
    useWhen: 'Replacing a library, data store, or subsystem that much of the code depends on.',
    watchOutFor: 'The temporary abstraction has to be removed at the end, or it becomes permanent indirection.',
    related: ['sf', 'ff', 'ab']
  },
  {
    symbol: 'Sf', name: 'Strangler Fig', category: 'delivery', row: 8, col: 11, cost: 3,
    summary: 'Replace a legacy system gradually by routing its functionality to a new one, piece by piece.',
    description: 'Martin Fowler named it after the vines that slowly grow around a host tree. Put a facade in front of the legacy system, build new capabilities beside it, and redirect traffic route by route until the old system can be switched off. Value ships continuously instead of after a big-bang rewrite.',
    useWhen: 'Modernising a system too large or risky to rewrite in one go, which is nearly all of them.',
    watchOutFor: 'Migrations stall at 80% and leave you running both systems indefinitely. Plan and fund the last mile.',
    related: ['ac', 'ba', 'cc', 'gw']
  },
  {
    symbol: 'Pl', name: 'Platform Engineering', category: 'delivery', row: 8, col: 12, cost: 4,
    summary: 'Build an internal platform that gives product teams self-service paved roads.',
    description: 'A platform team offers pipelines, environments, observability, and infrastructure as a product with a self-service interface. Product teams get speed and consistency without each one having to become infrastructure experts.',
    useWhen: 'Many teams keep solving the same infrastructure problems, and cognitive load is slowing them down.',
    watchOutFor: 'A platform built without treating teams as its customers becomes a mandatory obstacle. Start with the thinnest viable platform.',
    related: ['tt', 'ia', 'cd', 'sd']
  },

  // Practices series
  {
    symbol: 'Ad', name: 'Architecture Decision Records', label: 'Decision Records', category: 'practice', row: 9, col: 3, cost: 1,
    summary: 'Record each significant decision with its context, options, and consequences.',
    description: 'An ADR is a short document, kept next to the code, that captures one decision: what was decided, why, what else was considered, and what it costs. Over time the log explains how the system got its shape, so newcomers don\'t reopen settled questions and teams know when a decision\'s context has changed.',
    useWhen: 'Any decision that is hard to reverse, or that someone will one day ask "why did we do it this way?" about.',
    watchOutFor: 'Writing them afterwards as paperwork. The value is in the thinking the format forces while you decide.',
    related: ['rv', 'ta', 'c4', 'ea']
  },
  {
    symbol: 'C4', name: 'C4 Model', category: 'practice', row: 9, col: 4, cost: 1,
    summary: 'Diagram software at four zoom levels: context, containers, components, and code.',
    description: 'Simon Brown\'s approach gives architecture diagrams a consistent vocabulary and a clear audience for each level. Most teams get the bulk of the value from the first two: how the system fits into its environment, and which deployable units it is made of.',
    useWhen: 'Explaining a system to anyone, from executives at the context level to new developers at the container and component levels.',
    watchOutFor: 'Diagrams that drift away from reality. Prefer diagrams as code, kept and reviewed alongside the system.',
    related: ['ad', 'cm']
  },
  {
    symbol: 'Qa', name: 'Quality Attribute Scenarios', label: 'Quality Scenarios', category: 'practice', row: 9, col: 5, cost: 2,
    summary: 'Turn vague "-ilities" into concrete, testable statements.',
    description: '"It must be scalable" means nothing. "When traffic doubles during a sale, p99 checkout latency stays under 500 ms" can be designed for and tested. Each scenario names a stimulus, an environment, and a measurable response, and together they set the architecture\'s priorities.',
    useWhen: 'Gathering requirements that shape the architecture, or when stakeholders disagree about what matters.',
    watchOutFor: 'Trying to maximise every quality. They trade off against each other, so rank them.',
    related: ['ta', 'ft', 'sl']
  },
  {
    symbol: 'Ta', name: 'Trade-off Analysis', category: 'practice', row: 9, col: 6, cost: 2,
    summary: 'Make the costs of every option explicit. There are no best practices, only trade-offs.',
    description: 'Every architectural choice improves some qualities at the expense of others. Methods such as ATAM give this structure, but the core habit is simple: for each option, write down what you gain, what you give up, and which quality scenarios it serves.',
    useWhen: 'Every significant decision. If an option seems to have no downside, you have not found it yet.',
    watchOutFor: 'Analysis paralysis. Time-box the analysis, and scale the effort to how hard the decision is to reverse.',
    related: ['qa', 'ad', 'rv']
  },
  {
    symbol: 'Ft', name: 'Fitness Functions', category: 'practice', row: 9, col: 7, cost: 2,
    summary: 'Automated checks that keep verifying architectural characteristics.',
    description: 'From Building Evolutionary Architectures: encode architectural intent as tests that run in the pipeline. Dependency rules between modules, latency budgets, bundle size limits, and security scans are typical examples. The architecture is then protected by the build, not just by review.',
    useWhen: 'You have architectural rules that matter and keep getting broken by accident.',
    watchOutFor: 'Noisy or slow checks get switched off. Start with a few that guard what you care about most.',
    related: ['ea', 'qa', 'cd', 'mm']
  },
  {
    symbol: 'Et', name: 'Event Storming', category: 'practice', row: 9, col: 8, cost: 2,
    summary: 'A collaborative workshop that maps a business process as a timeline of domain events.',
    description: 'Alberto Brandolini\'s format puts domain experts and engineers in front of a long wall with sticky notes. Events go up first, then commands, actors, policies, and hotspots. It quickly surfaces shared language, hidden complexity, and natural boundaries.',
    useWhen: 'Starting on a new domain, untangling an existing one, or looking for bounded contexts.',
    watchOutFor: 'Without the real domain experts in the room, it turns into engineers guessing together.',
    related: ['ul', 'de', 'bc', 'cr']
  },
  {
    symbol: 'Tt', name: 'Team Topologies', category: 'practice', row: 9, col: 9, cost: 3,
    summary: 'Design team structures and interaction modes on purpose, with cognitive load as the main constraint.',
    description: 'Matthew Skelton and Manuel Pais describe four team types (stream-aligned, platform, enabling, and complicated-subsystem) and three ways for teams to interact. Architecture and team design are treated as one problem, because each shapes the other.',
    useWhen: 'Team boundaries and system boundaries are misaligned, or teams are overloaded.',
    watchOutFor: 'Renaming existing teams is not adopting it. The point is less cognitive load and fewer handoffs.',
    related: ['iv', 'pl', 'bc', 'ms']
  },
  {
    symbol: 'Iv', name: 'Inverse Conway Maneuver', label: 'Inverse Conway', category: 'practice', row: 9, col: 10, cost: 4,
    summary: 'Shape the organisation so that it produces the architecture you want.',
    description: 'Conway\'s Law observes that systems mirror the communication structure of the organisations that build them. The inverse maneuver uses that on purpose: draw team boundaries to match the system boundaries you want, and the architecture follows.',
    useWhen: 'A target architecture keeps failing to materialise because the team structure pulls against it.',
    watchOutFor: 'Reorganisations are expensive and disruptive. Understand the domain boundaries before redrawing team lines.',
    related: ['tt', 'bc', 'ms']
  },
  {
    symbol: 'Ea', name: 'Evolutionary Architecture', label: 'Evolutionary', category: 'practice', row: 9, col: 11, cost: 3,
    summary: 'Treat guided, incremental change as a first-class design goal.',
    description: 'Accept that requirements and technology will change, and that the architecture has to change with them. Small increments, reversible decisions, fitness functions, and deliberate coupling let a system evolve without big rewrites.',
    useWhen: 'Long-lived systems in changing environments, which is most of them.',
    watchOutFor: 'Evolvability is not unlimited flexibility. Decide along which dimensions the system must be able to change, and protect those.',
    related: ['ft', 'rv', 'ad', 'ya']
  },
  {
    symbol: 'Cx', name: 'Chaos Engineering', category: 'practice', row: 9, col: 12, cost: 4,
    summary: 'Run controlled experiments that inject failure, to build confidence in resilience.',
    description: 'Form a hypothesis about steady state, inject a realistic fault such as a killed instance or added latency, and see whether the system holds. Pioneered at Netflix, it finds weaknesses on your schedule rather than during an outage.',
    useWhen: 'You have resilience mechanisms you have never seen work, and enough observability to measure the impact.',
    watchOutFor: 'Start outside production with a small blast radius. Chaos without observability is just an outage.',
    related: ['gd', 'cb', 'sl', 'bh']
  }
];

export const elements: ArchitectureElement[] = sources.map((source, index) => ({
  ...source,
  id: source.symbol.toLowerCase(),
  number: index + 1,
  label: source.label ?? source.name
}));

export const compounds: Compound[] = [
  {
    name: 'The sensible default',
    description: 'A modular monolith with real boundaries, a shared language, decisions on record, and tests that keep the boundaries honest. Most teams should start here.',
    elements: ['mm', 'bc', 'ul', 'ad', 'ft']
  },
  {
    name: 'Event-driven microservices',
    description: 'Independent services with private data that cooperate through events. Every element here exists to pay down a cost introduced by another.',
    elements: ['ms', 'dp', 'ps', 'ox', 'ic', 'sg', 'tr']
  },
  {
    name: 'Calling things you don\'t control',
    description: 'The minimum kit for any dependency that lives on the other side of a network.',
    elements: ['to', 're', 'cb', 'bh', 'gd']
  },
  {
    name: 'Read-heavy at scale',
    description: 'Separate the read path, precompute what you can, and spread the rest.',
    elements: ['cq', 'mv', 'ca', 'rp', 'lb']
  },
  {
    name: 'Legacy modernisation',
    description: 'Replace an old system one route at a time without letting its model leak into the new one.',
    elements: ['sf', 'ac', 'ba', 'cc', 'ff']
  },
  {
    name: 'Shipping on a Friday',
    description: 'Make deployments boring enough that the day of the week stops mattering.',
    elements: ['cd', 'ia', 'cn', 'ff', 'sl']
  },
  {
    name: 'Secure by default',
    description: 'Identity everywhere, minimal access, short-lived secrets, and a habit of asking what could go wrong.',
    elements: ['zt', 'lp', 'fi', 'se', 'tm']
  }
];

const byId = new Map(elements.map((element) => [element.id, element]));
const byCategory = new Map(categories.map((category) => [category.key, category]));

export function getElement(id: string) {
  return byId.get(id);
}

export function getCategory(key: CategoryKey) {
  const category = byCategory.get(key);
  if (!category) throw new Error(`Unknown category: ${key}`);
  return category;
}
