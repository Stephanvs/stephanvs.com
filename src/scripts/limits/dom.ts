export function query<T extends Element>(root: ParentNode, selector: string) {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

export function queryAll<T extends Element>(root: ParentNode, selector: string) {
  return [...root.querySelectorAll<T>(selector)];
}

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const twoDecimals = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function formatCount(value: number) {
  return integer.format(Math.round(value));
}

export function formatDecimal(value: number) {
  if (value < 1) return twoDecimals.format(value);
  return value < 10 ? oneDecimal.format(value) : integer.format(Math.round(value));
}

export function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${formatDecimal(value)} ${units[unit]}`;
}

export function formatSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) return '–';
  if (seconds < 1) return `${integer.format(seconds * 1000)} ms`;
  if (seconds < 120) return `${formatDecimal(seconds)} s`;
  if (seconds < 7200) return `${formatDecimal(seconds / 60)} min`;
  return `${formatDecimal(seconds / 3600)} h`;
}

export function setPressed(buttons: HTMLButtonElement[], value: string) {
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.value === value)));
}

export function bindCopyButtons(root: ParentNode) {
  queryAll<HTMLButtonElement>(root, '[data-copy]').forEach((button) => {
    const target = query<HTMLElement>(root, `#${button.dataset.copy}`);
    const label = button.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(target.textContent ?? '');
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => (button.textContent = label), 1600);
    });
  });
}
