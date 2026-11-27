import { formatCount, formatDecimal, query, queryAll, setPressed } from './dom';

type Strategy = 'every-hop' | 'one-hop';

interface RetryInputs {
  hops: number;
  attempts: number;
  failureRate: number;
  strategy: Strategy;
}

const RETRY_BUDGET_RATIO = 0.1;
const SERVICES = ['Gateway', 'Orders', 'Inventory', 'Pricing'];
const DOTS_MAX = 625;

// Expected attempts when each attempt fails independently with probability f: 1 + f + f² + … + f^(n-1).
function expectedAttempts(failure: number, attempts: number) {
  let total = 0;
  for (let attempt = 0; attempt < attempts; attempt++) total += failure ** attempt;
  return total;
}

// Expected calls arriving at each level for one click. Index 0 is the gateway, the last index is the database.
export function callsPerLevel({ hops, attempts, failureRate, strategy }: RetryInputs) {
  const multipliers: number[] = new Array(hops);
  let failure = failureRate;

  for (let hop = hops; hop >= 1; hop--) {
    const retries = strategy === 'every-hop' || hop === hops;
    const allowed = retries ? attempts : 1;
    const unbudgeted = expectedAttempts(failure, allowed);

    if (strategy === 'one-hop' && retries) {
      // A retry budget allows retries only while they stay below a share of requests.
      const retriesWanted = unbudgeted - 1;
      const share = retriesWanted > 0 ? Math.min(1, RETRY_BUDGET_RATIO / retriesWanted) : 1;
      multipliers[hop - 1] = 1 + share * retriesWanted;
      failure = share * failure ** allowed + (1 - share) * failure;
    } else {
      multipliers[hop - 1] = unbudgeted;
      failure = failure ** allowed;
    }
  }

  const calls = [1];
  multipliers.forEach((multiplier) => calls.push(calls[calls.length - 1] * multiplier));
  return calls;
}

function initRetry(root: HTMLElement) {
  const form = query<HTMLFormElement>(root, '[data-form]');
  const tree = query<HTMLOListElement>(root, '[data-tree]');
  const strategies = queryAll<HTMLButtonElement>(root, '[data-strategy]');
  const out = (name: string) => query<HTMLElement>(root, `[data-out="${name}"]`);
  const value = (name: string) => query<HTMLOutputElement>(root, `[data-value="${name}"]`);
  let strategy: Strategy = 'every-hop';
  let previousDots: number[] = [];

  function read(): RetryInputs & { rps: number } {
    const data = new FormData(form);
    return {
      hops: Number(data.get('hops')),
      attempts: Number(data.get('attempts')),
      failureRate: Number(data.get('failure')) / 100,
      rps: Math.max(1, Number(data.get('rps')) || 1),
      strategy
    };
  }

  function renderTree(calls: number[]) {
    const names = [...SERVICES.slice(0, calls.length - 1), 'Database'];
    const fragment = document.createDocumentFragment();

    calls.forEach((count, level) => {
      const dots = Math.min(DOTS_MAX, Math.max(1, Math.round(count)));
      const item = document.createElement('li');
      item.className = 'retry-level';
      item.toggleAttribute('data-failing', level === calls.length - 1);

      const name = document.createElement('div');
      name.className = 'retry-name';
      const service = document.createElement('span');
      service.className = 'retry-service';
      service.textContent = names[level];
      const label = document.createElement('span');
      label.className = 'retry-count';
      const formatted = formatDecimal(count);
      label.textContent = `${formatted} ${formatted === '1' ? 'call' : 'calls'}`;
      name.append(service, label);

      const grid = document.createElement('div');
      grid.className = 'retry-dots';
      grid.setAttribute('aria-hidden', 'true');
      grid.toggleAttribute('data-dense', dots > 150);
      const before = previousDots[level] ?? 0;
      for (let index = 0; index < dots; index++) {
        const dot = document.createElement('span');
        dot.className = 'retry-dot';
        if (index >= before) {
          dot.toggleAttribute('data-new', true);
          dot.style.setProperty('--i', String(index - before));
        }
        grid.append(dot);
      }

      previousDots[level] = dots;
      item.append(name, grid);
      fragment.append(item);
    });

    previousDots = previousDots.slice(0, calls.length);
    tree.replaceChildren(fragment);
  }

  function render() {
    const inputs = read();
    const calls = callsPerLevel(inputs);
    const worst = callsPerLevel({ ...inputs, failureRate: 1 });
    const perClick = calls[calls.length - 1];

    value('hops').textContent = String(inputs.hops);
    value('attempts').textContent = String(inputs.attempts);
    value('failure').textContent = `${Math.round(inputs.failureRate * 100)}%`;

    renderTree(calls);
    out('per-click').textContent = formatDecimal(perClick);
    out('load').textContent = `${formatCount(perClick * inputs.rps)}/s`;
    out('load-note').textContent = `at ${formatCount(inputs.rps)} clicks/s`;
    out('worst').textContent = formatDecimal(worst[worst.length - 1]);
    out('explain').textContent =
      strategy === 'every-hop'
        ? `Every hop makes up to ${inputs.attempts} attempts, and each attempt triggers the full retry chain below it. The counts multiply.`
        : `Only the hop next to the database retries, and only while retries stay under ${RETRY_BUDGET_RATIO * 100}% of its requests. The other hops pass the failure up.`;
  }

  strategies.forEach((button) => {
    button.addEventListener('click', () => {
      strategy = button.value as Strategy;
      setPressed(strategies, strategy);
      render();
    });
  });

  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => event.preventDefault());
  render();
}

document.querySelectorAll<HTMLElement>('[data-retry]').forEach(initRetry);
