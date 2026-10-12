export type LimitStatus = 'open' | 'loose' | 'bounded';

export interface FrameworkDefault {
  id: string;
  api: string;
  value: string;
  status: LimitStatus;
  risk: string;
  fix: string;
  code?: string;
}

export const statusLabels: Record<LimitStatus, string> = {
  open: 'No limit',
  loose: 'Loose limit',
  bounded: 'Sensible default'
};

export const frameworkDefaults: FrameworkDefault[] = [
  {
    id: 'unbounded-channel',
    api: 'Channel.CreateUnbounded<T>()',
    value: 'No capacity',
    status: 'open',
    risk: 'Grows until the process runs out of memory. Everything still in the channel is lost when the process dies.',
    fix: 'Use a bounded channel. Size it from drain rate × wait budget, and choose the full mode on purpose.',
    code: `var channel = Channel.CreateBounded<WorkItem>(
    new BoundedChannelOptions(QueueDepthMax)
    {
        FullMode = BoundedChannelFullMode.Wait,
    });`
  },
  {
    id: 'concurrent-queue',
    api: 'ConcurrentQueue<T>',
    value: 'No capacity',
    status: 'open',
    risk: 'The same failure as an unbounded channel, with no built-in way to make the producer wait.',
    fix: 'Switch to a bounded channel. In synchronous code, BlockingCollection takes a bounded capacity.',
    code: `var queue = new BlockingCollection<WorkItem>(boundedCapacity: QueueDepthMax);`
  },
  {
    id: 'memory-cache',
    api: 'MemoryCache',
    value: 'SizeLimit = null',
    status: 'open',
    risk: 'The cache grows with the number of distinct keys. A crawler or a burst of unique IDs is enough to fill memory.',
    fix: 'Set SizeLimit, then give every entry a Size. MemoryCache throws if an entry has none.',
    code: `services.AddMemoryCache(options => options.SizeLimit = CacheEntriesMax);

cache.Set(key, value, new MemoryCacheEntryOptions
{
    Size = 1,
    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
});`
  },
  {
    id: 'max-connections',
    api: 'SocketsHttpHandler.MaxConnectionsPerServer',
    value: 'int.MaxValue',
    status: 'open',
    risk: 'When a dependency slows down, each request holds its connection longer, so you open more. More connections make the dependency slower still.',
    fix: 'Cap connections per server at what the dependency can actually serve.',
    code: `services.AddHttpClient<InventoryClient>()
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        MaxConnectionsPerServer = 32,
        PooledConnectionLifetime = TimeSpan.FromMinutes(5),
    });`
  },
  {
    id: 'kestrel-connections',
    api: 'KestrelServerLimits.MaxConcurrentConnections',
    value: 'null (unlimited)',
    status: 'open',
    risk: 'Kestrel accepts every connection. Under overload the work piles up in the thread pool and in memory instead of being turned away at the door.',
    fix: 'Set a connection cap, or put a concurrency limiter on the endpoints that do expensive work.',
    code: `builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxConcurrentConnections = ConnectionsMax;
});`
  },
  {
    id: 'when-all',
    api: 'Task.WhenAll(items.Select(...))',
    value: 'One task per item',
    status: 'open',
    risk: 'Your input decides your concurrency. A list of ten thousand IDs becomes ten thousand concurrent calls.',
    fix: 'Use Parallel.ForEachAsync and set the degree of parallelism to what the downstream can take.',
    code: `await Parallel.ForEachAsync(
    customerIds,
    new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (id, token) => await client.SyncAsync(id, token));`
  },
  {
    id: 'to-list',
    api: 'ToListAsync() without Take',
    value: 'The entire result',
    status: 'open',
    risk: 'Fine for most customers. One large customer turns a page load into one very large allocation.',
    fix: 'Take one more row than you accept. The extra row tells you the limit was hit.',
    code: `var orders = await db.Orders
    .Where(o => o.CustomerId == customerId)
    .OrderBy(o => o.Id)
    .Take(OrdersPerPageMax + 1)
    .ToListAsync(ct);`
  },
  {
    id: 'http-timeout',
    api: 'HttpClient.Timeout',
    value: '100 seconds',
    status: 'loose',
    risk: 'Your caller has usually given up long before 100 seconds. Your service keeps working on a request nobody is waiting for.',
    fix: 'Give each request a total time budget, and pass the CancellationToken all the way down.',
    code: `services.AddHttpClient<InventoryClient>()
    .AddStandardResilienceHandler(options =>
    {
        options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(5);
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);
    });`
  },
  {
    id: 'json-depth',
    api: 'JsonSerializerOptions.MaxDepth',
    value: '64',
    status: 'bounded',
    risk: 'Deeply nested payloads are rejected before they can exhaust the stack.',
    fix: 'Leave it on. Lower it if your payloads are shallow.'
  },
  {
    id: 'request-body',
    api: 'KestrelServerLimits.MaxRequestBodySize',
    value: '30,000,000 bytes',
    status: 'bounded',
    risk: 'Oversized request bodies are rejected before your code has to buffer them.',
    fix: 'Lower it on endpoints that only ever receive small payloads.'
  },
  {
    id: 'resilience-handler',
    api: 'AddStandardResilienceHandler()',
    value: '30 s total, 10 s per attempt, 3 retries',
    status: 'bounded',
    risk: 'Every request gets a hard time budget, and retries back off with jitter.',
    fix: 'Keep it. Check the retry count against how many retrying hops sit above you.'
  },
  {
    id: 'foreach-async',
    api: 'Parallel.ForEachAsync',
    value: 'Environment.ProcessorCount',
    status: 'bounded',
    risk: 'Concurrency stays capped even if you forget to set it.',
    fix: 'For I/O-bound work, the right number is what the downstream can take, not your core count. Set it explicitly.'
  }
];

export const scanCommand = String.raw`rg -n --type cs -e 'Channel\.CreateUnbounded' -e 'new ConcurrentQueue<' -e 'new BlockingCollection<[^>]*>\(\)' -e 'AddMemoryCache\(\)' -e 'Task\.WhenAll\('`;
