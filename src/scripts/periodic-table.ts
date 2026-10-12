import {
  costLabels,
  elements,
  getCategory,
  getElement,
  type ArchitectureElement,
  type CategoryKey
} from '../data/software-architecture';

const HASH_PREFIX = '#element-';
const wideLayout = window.matchMedia('(min-width: 80rem)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

interface TileContent {
  number: string;
  symbol: string;
  name: string;
  cost: number;
  category?: CategoryKey;
}

const keyTile: TileContent = { number: 'Nº', symbol: 'Sy', name: 'Name', cost: 3 };

function query<T extends Element>(root: ParentNode, selector: string) {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

function setColors(target: HTMLElement, category?: CategoryKey) {
  if (category) {
    const { fill, ink } = getCategory(category);
    target.style.setProperty('--fill', fill);
    target.style.setProperty('--ink', ink);
    target.dataset.category = category;
  } else {
    target.style.removeProperty('--fill');
    target.style.removeProperty('--ink');
    delete target.dataset.category;
  }
}

function fillTile(tile: HTMLElement, content: TileContent) {
  setColors(tile, content.category);
  query(tile, '[data-tile="number"]').textContent = content.number;
  query(tile, '[data-tile="symbol"]').textContent = content.symbol;
  query(tile, '[data-tile="name"]').textContent = content.name;
  query(tile, '[data-tile="cost"]').querySelectorAll('i').forEach((bar, index) => {
    bar.toggleAttribute('data-on', index < content.cost);
  });
}

function tileContent(element: ArchitectureElement): TileContent {
  return {
    number: String(element.number),
    symbol: element.symbol,
    name: element.label,
    cost: element.cost,
    category: element.category
  };
}

function elementFromHash(hash: string) {
  return hash.startsWith(HASH_PREFIX) ? getElement(hash.slice(HASH_PREFIX.length)) : undefined;
}

function initTable(grid: HTMLElement) {
  const table = query<HTMLElement>(document, '#table');
  const tiles = new Map<string, HTMLAnchorElement>();
  grid.querySelectorAll<HTMLAnchorElement>('[data-pt-tile]').forEach((tile) => tiles.set(tile.dataset.id!, tile));
  const positions = new Map(elements.map((element) => [`${element.row},${element.col}`, element.id]));

  const search = query<HTMLInputElement>(document, '[data-pt-search]');
  const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-pt-chip]')];
  const compoundButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-pt-compound]')];
  const status = query<HTMLElement>(document, '[data-pt-status]');
  const reset = query<HTMLButtonElement>(document, '[data-pt-reset]');

  const panel = query<HTMLElement>(grid, '[data-pt-panel]');
  const panelTile = query<HTMLElement>(panel, '[data-pt-big-tile]');
  const panelKey = query<HTMLElement>(panel, '[data-pt-panel-key]');
  const panelPreview = query<HTMLElement>(panel, '[data-pt-panel-preview]');

  const state = {
    categories: new Set<CategoryKey>(),
    hoveredCategory: null as CategoryKey | null,
    query: '',
    compound: null as { name: string; ids: Set<string> } | null
  };

  function matches(element: ArchitectureElement) {
    if (state.categories.size > 0 && !state.categories.has(element.category)) return false;
    if (state.compound && !state.compound.ids.has(element.id)) return false;
    if (state.query) {
      const haystack = `${element.symbol} ${element.name} ${element.label} ${element.summary}`.toLowerCase();
      if (!haystack.includes(state.query)) return false;
    }
    return true;
  }

  function render() {
    let count = 0;
    for (const element of elements) {
      const visible = matches(element);
      if (visible) count++;
      const hidden = !visible || (state.hoveredCategory !== null && element.category !== state.hoveredCategory);
      tiles.get(element.id)!.toggleAttribute('data-dim', hidden);
    }

    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', String(state.categories.has(chip.dataset.category as CategoryKey)));
    });
    compoundButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(state.compound?.name === button.dataset.name));
    });

    const filtered = state.categories.size > 0 || state.query !== '' || state.compound !== null;
    const compoundLabel = state.compound ? ` · ${state.compound.name}` : '';
    status.textContent = filtered
      ? `${count} of ${elements.length} elements${compoundLabel}`
      : `${elements.length} elements`;
    reset.hidden = !filtered;
  }

  function showPreview(element: ArchitectureElement) {
    fillTile(panelTile, tileContent(element));
    query(panelPreview, '[data-preview="category"]').textContent = `Nº ${element.number} · ${getCategory(element.category).name}`;
    query(panelPreview, '[data-preview="name"]').textContent = element.name;
    query(panelPreview, '[data-preview="summary"]').textContent = element.summary;
    panelKey.hidden = true;
    panelPreview.hidden = false;
  }

  function showKey() {
    fillTile(panelTile, keyTile);
    panelKey.hidden = false;
    panelPreview.hidden = true;
  }

  function tileElement(target: EventTarget | null) {
    const tile = target instanceof Element ? target.closest<HTMLElement>('[data-pt-tile]') : null;
    return tile ? getElement(tile.dataset.id!) : undefined;
  }

  grid.addEventListener('pointerover', (event) => {
    const element = tileElement(event.target);
    if (element) showPreview(element);
  });
  grid.addEventListener('pointerleave', () => {
    if (!grid.contains(document.activeElement)) showKey();
  });
  grid.addEventListener('focusin', (event) => {
    const element = tileElement(event.target);
    if (element) showPreview(element);
  });
  grid.addEventListener('focusout', (event) => {
    if (!grid.contains(event.relatedTarget as Node | null)) showKey();
  });

  const steps: Record<string, [number, number]> = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0]
  };

  grid.addEventListener('keydown', (event) => {
    const step = steps[event.key];
    const element = tileElement(event.target);
    if (!step || !element || !wideLayout.matches) return;

    const [rowStep, colStep] = step;
    let row = element.row + rowStep;
    let col = element.col + colStep;
    while (row >= 1 && row <= 9 && col >= 1 && col <= 18) {
      const id = positions.get(`${row},${col}`);
      if (id) {
        event.preventDefault();
        tiles.get(id)!.focus();
        return;
      }
      row += rowStep;
      col += colStep;
    }
  });

  search.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    render();
  });

  chips.forEach((chip) => {
    const category = chip.dataset.category as CategoryKey;
    chip.addEventListener('click', () => {
      if (state.categories.has(category)) state.categories.delete(category);
      else state.categories.add(category);
      render();
    });
    chip.addEventListener('pointerenter', () => {
      state.hoveredCategory = category;
      render();
    });
    chip.addEventListener('pointerleave', () => {
      state.hoveredCategory = null;
      render();
    });
  });

  compoundButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.name!;
      if (state.compound?.name === name) {
        state.compound = null;
      } else {
        state.compound = { name, ids: new Set(button.dataset.ptCompound!.split(' ')) };
        state.categories.clear();
        state.query = '';
        search.value = '';
        table.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
      render();
    });
  });

  reset.addEventListener('click', () => {
    state.categories.clear();
    state.compound = null;
    state.query = '';
    search.value = '';
    render();
    search.focus();
  });

  showKey();
  render();
}

function initDialog(dialog: HTMLDialogElement) {
  const bigTile = query<HTMLElement>(dialog, '[data-pt-big-tile]');
  const field = (name: string) => query<HTMLElement>(dialog, `[data-dialog="${name}"]`);
  const relatedList = field('related');
  let current: ArchitectureElement | undefined;
  let opener: HTMLElement | null = null;

  function show(element: ArchitectureElement) {
    current = element;
    const category = getCategory(element.category);

    fillTile(bigTile, tileContent(element));
    field('position').textContent = `Element ${element.number} of ${elements.length}`;
    field('kicker').textContent = `Nº ${element.number} · ${element.symbol}`;
    field('name').textContent = element.name;
    field('summary').textContent = element.summary;
    field('description').textContent = element.description;
    field('useWhen').textContent = element.useWhen;
    field('watchOutFor').textContent = element.watchOutFor;
    field('family').textContent = `${category.name}. ${category.blurb}`;
    field('cost').textContent = `${costLabels[element.cost]} (${element.cost} of 5)`;

    relatedList.replaceChildren(
      ...element.related.map((id) => {
        const other = getElement(id)!;
        const link = document.createElement('a');
        link.href = `${HASH_PREFIX}${other.id}`;
        setColors(link, other.category);
        const symbol = document.createElement('b');
        symbol.textContent = other.symbol;
        link.append(symbol, other.name);
        return link;
      })
    );

    if (!dialog.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    history.replaceState(null, '', `${HASH_PREFIX}${element.id}`);
  }

  function step(offset: number) {
    if (!current) return;
    const index = (current.number - 1 + offset + elements.length) % elements.length;
    show(elements[index]);
  }

  dialog.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  query(dialog, '[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll<HTMLButtonElement>('[data-dialog-step]').forEach((button) => {
    button.addEventListener('click', () => step(Number(button.dataset.dialogStep)));
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>(`a[href^="${HASH_PREFIX}"]`) : null;
    const element = link ? elementFromHash(link.getAttribute('href')!) : undefined;
    if (!element) return;
    event.preventDefault();
    show(element);
  });

  const openFromHash = () => {
    const element = elementFromHash(location.hash);
    if (element) show(element);
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

const grid = document.querySelector<HTMLElement>('[data-pt-grid]');
const dialog = document.querySelector<HTMLDialogElement>('[data-pt-dialog]');
if (grid) initTable(grid);
if (dialog) initDialog(dialog);
