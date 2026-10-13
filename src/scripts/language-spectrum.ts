import {
  averagePlace,
  consensusRank,
  domainFit,
  domainLabels,
  facets,
  formatLensValue,
  formatSourceRank,
  getFamily,
  getLanguage,
  influenceName,
  languages,
  lenses,
  lensValue,
  mapViews,
  matchScore,
  memoryLabels,
  popularitySources,
  projects,
  runtimeLabels,
  sourcePlaces,
  typingLabels,
  weightLabels,
  ancestors,
  type DomainKey,
  type FacetKey,
  type FamilyKey,
  type Language,
  type Lens,
  type LensKey
} from '../data/programming-languages';
import { relax, swarm } from '../lib/spectrum-layout';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lensByKey = new Map(lenses.map((lens) => [lens.key, lens]));
const rankOf = (language: Language) => consensusRank.get(language.id)!;

function query<T extends Element = HTMLElement>(root: ParentNode, selector: string) {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setColors(target: HTMLElement | SVGElement, family: FamilyKey) {
  const { fill, ink } = getFamily(family);
  target.style.setProperty('--fill', fill);
  target.style.setProperty('--ink', ink);
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
}

function formatList(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function fraction(lens: Lens, language: Language) {
  return (lensValue(lens.key, language) - lens.min) / (lens.max - lens.min);
}

function lensReading(lens: Lens, language: Language) {
  if (lens.key === 'popularity') return `#${rankOf(language)} of ${languages.length}`;
  return formatLensValue(lens, lensValue(lens.key, language));
}

function tileFrom(target: EventTarget | null) {
  const tile = target instanceof Element ? target.closest<HTMLElement>('[data-ls-tile]') : null;
  const language = tile ? getLanguage(tile.dataset.id!) : undefined;
  return tile && language ? { tile, language } : undefined;
}

function miniTile(language: Language) {
  const link = element('a', 'ls-mini');
  link.href = `#lang-${language.id}`;
  link.dataset.lsTile = '';
  link.dataset.id = language.id;
  link.setAttribute('aria-label', language.name);
  setColors(link, language.family);
  const symbol = element('span', `ls-mini__symbol${language.symbol.length > 2 ? ' is-long' : ''}`, language.symbol);
  symbol.setAttribute('aria-hidden', 'true');
  link.append(symbol);
  return link;
}

function scoreBars(language: Language) {
  return facets.map((facet) => {
    const item = element('li');
    const bar = element('span', 'ls-bar');
    bar.setAttribute('aria-hidden', 'true');
    const fill = element('i');
    fill.style.setProperty('--v', String(language.scores[facet.key]));
    bar.append(fill);
    item.append(element('span', undefined, facet.name), bar, element('b', undefined, String(language.scores[facet.key])));
    return item;
  });
}

/* Tooltip */

const tooltip = query(document, '[data-ls-tooltip]');
const tooltipValue = query(tooltip, '[data-ls-tooltip-value]');
const tooltipName = query(tooltip, '[data-ls-tooltip-name]');
const tooltipMeta = query(tooltip, '[data-ls-tooltip-meta]');

function showTooltip(anchor: HTMLElement, value: string, language: Language, meta: string) {
  tooltipValue.textContent = value;
  tooltipName.textContent = language.name;
  tooltipMeta.textContent = meta;
  tooltip.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const tip = tooltip.getBoundingClientRect();
  const left = Math.min(window.innerWidth - tip.width - 8, Math.max(8, rect.left + rect.width / 2 - tip.width / 2));
  let top = rect.top - tip.height - 10;
  if (top < 8) top = rect.bottom + 10;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  tooltip.hidden = true;
}

function bindTooltips(root: HTMLElement, describe: (language: Language) => { value: string; meta: string }) {
  const show = (event: Event) => {
    const hit = tileFrom(event.target);
    if (!hit) return;
    const { value, meta } = describe(hit.language);
    showTooltip(hit.tile, value, hit.language, meta);
  };
  root.addEventListener('pointerover', show);
  root.addEventListener('focusin', show);
  root.addEventListener('pointerout', (event) => {
    if (tileFrom(event.target)) hideTooltip();
  });
  root.addEventListener('focusout', hideTooltip);
}

window.addEventListener('scroll', hideTooltip, { passive: true });

/* Lineup preview */

function initLineup() {
  const wall = query(document, '.ls-lineup__wall');
  const preview = query(document, '[data-ls-preview]');
  const key = query(preview, '[data-ls-preview-key]');
  const card = query(preview, '[data-ls-preview-card]');
  const field = (name: string) => query(card, `[data-preview="${name}"]`);

  const show = (event: Event) => {
    const hit = tileFrom(event.target);
    if (!hit) return;
    const { language } = hit;
    field('kicker').textContent = `${getFamily(language.family).name} · ${language.year} · popularity #${rankOf(language)}`;
    field('name').textContent = language.name;
    field('tagline').textContent = language.tagline;
    field('traits').replaceChildren(
      ...[
        `${typingLabels[language.typingKind]} typing`,
        memoryLabels[language.memoryKind],
        runtimeLabels[language.runtimeKind],
        `${language.admired.toFixed(0)}% admired`
      ].map((text) => element('li', undefined, text))
    );
    field('bars').replaceChildren(...scoreBars(language));
    key.hidden = true;
    card.hidden = false;
  };

  wall.addEventListener('pointerover', show);
  wall.addEventListener('focusin', show);
}

/* Spectrum */

function initSpectrum() {
  const section = query(document, '#spectrum');
  const swarmElement = query(section, '[data-ls-swarm]');
  const field = query(swarmElement, '.ls-swarm__field');
  const axis = query(section, '[data-ls-swarm-axis]');
  const tiles = new Map([...field.querySelectorAll<HTMLElement>('[data-ls-tile]')].map((tile) => [tile.dataset.id!, tile]));
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-lens]')];
  const chips = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-family]')];
  const text = (name: string) => query(section, `[data-ls-lens-${name}]`);

  let lens = lensByKey.get('performance')!;
  const selected = new Set<FamilyKey>();
  let hovered: FamilyKey | null = null;

  function layout() {
    const sample = tiles.values().next().value!;
    const gap = parseFloat(getComputedStyle(swarmElement).getPropertyValue('--ls-gap')) || 4;
    const placements = swarm(
      languages.map((language) => ({ id: language.id, x: fraction(lens, language) * 100, priority: rankOf(language) })),
      field.clientWidth,
      sample.offsetWidth + gap
    );
    let levels = 0;
    for (const [id, placement] of placements) {
      const tile = tiles.get(id)!;
      tile.style.setProperty('--x', placement.x.toFixed(2));
      tile.style.setProperty('--level', String(placement.level));
      levels = Math.max(levels, placement.level + 1);
    }
    swarmElement.style.setProperty('--levels', String(levels));
  }

  function paintFamilies() {
    const active = hovered ? new Set([hovered]) : selected.size > 0 ? selected : null;
    for (const [id, tile] of tiles) tile.toggleAttribute('data-dim', active !== null && !active.has(getLanguage(id)!.family));
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(selected.has(chip.dataset.lsFamily as FamilyKey))));
  }

  function setLens(key: LensKey) {
    lens = lensByKey.get(key)!;
    buttons.forEach((button) => button.setAttribute('aria-checked', String(button.dataset.lsLens === key)));
    text('question').textContent = lens.question;
    text('note').textContent = lens.note;
    text('low').textContent = `← ${lens.low}`;
    text('high').textContent = `${lens.high} →`;
    axis.replaceChildren(
      ...lens.ticks.map((tick) => {
        const label = element('span', undefined, String(tick));
        label.style.setProperty('--x', (((tick - lens.min) / (lens.max - lens.min)) * 100).toFixed(2));
        return label;
      })
    );
    layout();
  }

  buttons.forEach((button) => button.addEventListener('click', () => setLens(button.dataset.lsLens as LensKey)));
  chips.forEach((chip) => {
    const family = chip.dataset.lsFamily as FamilyKey;
    chip.addEventListener('click', () => {
      if (selected.has(family)) selected.delete(family);
      else selected.add(family);
      paintFamilies();
    });
    chip.addEventListener('pointerenter', () => {
      hovered = family;
      paintFamilies();
    });
    chip.addEventListener('pointerleave', () => {
      hovered = null;
      paintFamilies();
    });
  });

  bindTooltips(field, (language) => ({ value: lensReading(lens, language), meta: `${getFamily(language.family).name} · ${lens.name}` }));
  new ResizeObserver(() => requestAnimationFrame(layout)).observe(field);

  return { setLens };
}

/* Trade-off map */

function initMap() {
  const section = query(document, '#map');
  const frame = query(section, '.ls-plot__frame');
  const grid = query(section, '[data-ls-plot-grid]');
  const leaders = query<SVGSVGElement>(section, '[data-ls-leaders]');
  const note = query(section, '[data-ls-view-note]');
  const quadrants = [...section.querySelectorAll<HTMLElement>('[data-ls-quadrant]')];
  const tiles = new Map([...frame.querySelectorAll<HTMLElement>('[data-ls-tile]')].map((tile) => [tile.dataset.id!, tile]));
  const viewButtons = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-view]')];
  const selectX = query<HTMLSelectElement>(section, '[data-ls-axis="x"]');
  const selectY = query<HTMLSelectElement>(section, '[data-ls-axis="y"]');
  const label = (name: string) => query(section, `[data-ls-plot-${name}]`);
  const svgNs = 'http://www.w3.org/2000/svg';

  let x = lensByKey.get(mapViews[0].x)!;
  let y = lensByKey.get(mapViews[0].y)!;
  function layout() {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const size = tiles.values().next().value!.offsetWidth;
    const targets = languages.map((language) => ({
      id: language.id,
      x: fraction(x, language) * width,
      y: (1 - fraction(y, language)) * height
    }));
    const positions = relax(targets, width, height, size + 4);

    leaders.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const marks: SVGElement[] = [];
    for (const target of targets) {
      const position = positions.get(target.id)!;
      const tile = tiles.get(target.id)!;
      tile.style.setProperty('--px', ((position.x / width) * 100).toFixed(2));
      tile.style.setProperty('--py', ((position.y / height) * 100).toFixed(2));
      if (Math.hypot(position.x - target.x, position.y - target.y) > size * 0.55) {
        const line = document.createElementNS(svgNs, 'line');
        line.setAttribute('x1', String(target.x));
        line.setAttribute('y1', String(target.y));
        line.setAttribute('x2', String(position.x));
        line.setAttribute('y2', String(position.y));
        const dot = document.createElementNS(svgNs, 'circle');
        dot.setAttribute('cx', String(target.x));
        dot.setAttribute('cy', String(target.y));
        dot.setAttribute('r', '2.5');
        marks.push(line, dot);
      }
    }
    leaders.replaceChildren(...marks);
  }

  function renderGrid() {
    const lines: HTMLElement[] = [];
    const add = (axis: 'x' | 'y', lens: Lens) => {
      for (const tick of lens.ticks) {
        const at = (tick - lens.min) / (lens.max - lens.min);
        const position = String(((axis === 'x' ? at : 1 - at) * 100).toFixed(2));
        const line = element('i');
        line.dataset.axis = axis;
        line.style.setProperty('--at', position);
        const value = element('b', undefined, String(tick));
        value.dataset.axis = axis;
        value.style.setProperty('--at', position);
        lines.push(line, value);
      }
      const mid = element('i');
      mid.dataset.axis = axis;
      mid.dataset.mid = '';
      mid.style.setProperty('--at', '50');
      lines.push(mid);
    };
    add('x', x);
    add('y', y);
    grid.replaceChildren(...lines);
  }

  function setAxes(xKey: LensKey, yKey: LensKey) {
    x = lensByKey.get(xKey)!;
    y = lensByKey.get(yKey)!;
    selectX.value = xKey;
    selectY.value = yKey;
    const view = mapViews.find((candidate) => candidate.x === xKey && candidate.y === yKey);
    viewButtons.forEach((button) => button.setAttribute('aria-checked', String(button.dataset.lsView === view?.key)));
    note.textContent = view
      ? view.note
      : `${x.name} runs left to right and ${y.name.toLowerCase()} bottom to top. ${x.question} ${y.question}`;
    const labels = view
      ? view.quadrants
      : [`${y.high}, ${x.low}`, `${y.high}, ${x.high}`, `${y.low}, ${x.low}`, `${y.low}, ${x.high}`];
    quadrants.forEach((quadrant, index) => (quadrant.textContent = labels[index]));
    label('xlow').textContent = `← ${x.low}`;
    label('xname').textContent = x.name;
    label('xhigh').textContent = `${x.high} →`;
    label('ylow').textContent = `← ${y.low}`;
    label('yname').textContent = y.name;
    label('yhigh').textContent = `${y.high} →`;
    renderGrid();
    layout();
  }

  function setView(key: string) {
    const view = mapViews.find((candidate) => candidate.key === key);
    if (view) setAxes(view.x, view.y);
  }

  viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.lsView!)));
  selectX.addEventListener('change', () => setAxes(selectX.value as LensKey, y.key));
  selectY.addEventListener('change', () => setAxes(x.key, selectY.value as LensKey));
  bindTooltips(frame, (language) => ({
    value: `${lensReading(x, language)} · ${lensReading(y, language)}`,
    meta: `${x.name} · ${y.name}`
  }));
  new ResizeObserver(() => requestAnimationFrame(layout)).observe(frame);
  renderGrid();

  return { setView };
}

/* Rankings */

function initRankings() {
  const section = query(document, '#rankings');
  const svg = query<SVGSVGElement>(section, '[data-ls-bump]');
  const lines = new Map([...svg.querySelectorAll<SVGGElement>('[data-ls-bump-line]')].map((line) => [line.dataset.lsBumpLine!, line]));
  const stories = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-story]')];
  const name = query(section, '[data-ls-readout-name]');
  const text = query(section, '[data-ls-readout-text]');
  const ranks = query(section, '[data-ls-readout-ranks]');

  function summary(language: Language) {
    const places = popularitySources
      .filter((source) => language.ranks[source.key] !== undefined)
      .map((source) => ({ source, place: sourcePlaces[source.key].get(language.id)! }))
      .sort((a, b) => a.place - b.place);
    const best = places[0];
    const worst = places[places.length - 1];
    const spread =
      best && worst && best !== worst
        ? ` Best on ${best.source.short} (${formatSourceRank(best.source.key, language.ranks[best.source.key])}), lowest on ${worst.source.short} (${formatSourceRank(worst.source.key, language.ranks[worst.source.key])}).`
        : '';
    const missing = popularitySources.length - places.length;
    const unranked = missing > 0 ? ` ${missing} of the 7 sources don’t rank it at all.` : '';
    return `Average position ${averagePlace.get(language.id)!.toFixed(1)} among these ${languages.length}, for a consensus rank of #${rankOf(language)}.${spread}${unranked}`;
  }

  function activate(id: string, story?: string) {
    const language = getLanguage(id)!;
    svg.setAttribute('data-active', '');
    for (const [key, line] of lines) line.classList.toggle('is-active', key === id);
    const line = lines.get(id)!;
    line.parentNode!.appendChild(line);
    name.textContent = language.name;
    text.textContent = story ?? summary(language);
    ranks.replaceChildren(
      ...popularitySources.map((source) => {
        const row = element('div');
        row.append(element('dt', undefined, source.short), element('dd', undefined, formatSourceRank(source.key, language.ranks[source.key])));
        return row;
      })
    );
  }

  function showStory(id: string) {
    const button = stories.find((story) => story.dataset.lsStory === id);
    stories.forEach((story) => story.setAttribute('aria-pressed', String(story === button)));
    activate(id, button?.dataset.text);
  }

  stories.forEach((story) => story.addEventListener('click', () => showStory(story.dataset.lsStory!)));
  const fromEvent = (event: Event) => {
    const line = event.target instanceof Element ? event.target.closest<SVGGElement>('[data-ls-bump-line]') : null;
    if (!line || line.classList.contains('is-active')) return;
    stories.forEach((story) => story.setAttribute('aria-pressed', 'false'));
    activate(line.dataset.lsBumpLine!);
  };
  svg.addEventListener('pointerover', fromEvent);
  svg.addEventListener('focusin', fromEvent);

  svg.setAttribute('data-active', '');
  lines.get('python')!.classList.add('is-active');
  lines.get('python')!.parentNode!.appendChild(lines.get('python')!);

  return { showStory };
}

/* Lineage */

function initLineage(openProfile: (id: string) => void) {
  const section = query(document, '#lineage');
  const svg = query<SVGSVGElement>(section, '[data-ls-lineage]');
  const caption = query(section, '[data-ls-lineage-caption]');
  const nodes = new Map([...svg.querySelectorAll<SVGGElement>('[data-ls-node]')].map((node) => [node.dataset.lsNode!, node]));
  const edges = [...svg.querySelectorAll<SVGPathElement>('.ls-lineage__edges path')];
  const defaultCaption = caption.textContent;
  const yearOf = (id: string) => getLanguage(id)?.year ?? ancestors.find((ancestor) => ancestor.id === id)?.year;

  function activate(id: string) {
    const incoming = edges.filter((edge) => edge.dataset.to === id).map((edge) => edge.dataset.from!);
    const outgoing = edges.filter((edge) => edge.dataset.from === id).map((edge) => edge.dataset.to!);
    const related = new Set([...incoming, ...outgoing]);
    svg.setAttribute('data-active', '');
    edges.forEach((edge) => {
      edge.classList.toggle('is-in', edge.dataset.to === id);
      edge.classList.toggle('is-out', edge.dataset.from === id);
    });
    for (const [key, node] of nodes) {
      node.classList.toggle('is-active', key === id);
      node.classList.toggle('is-related', related.has(key));
    }
    const name = influenceName(id);
    const parts = [`${name} (${yearOf(id)})`];
    if (incoming.length > 0) parts.push(`borrowed from ${formatList(incoming.map(influenceName))}`);
    if (outgoing.length > 0) parts.push(`${incoming.length > 0 ? 'and ' : ''}passed ideas to ${formatList(outgoing.map(influenceName))}`);
    caption.textContent = `${parts.join(' ')}.`;
  }

  function clear() {
    svg.removeAttribute('data-active');
    edges.forEach((edge) => edge.classList.remove('is-in', 'is-out'));
    nodes.forEach((node) => node.classList.remove('is-active', 'is-related'));
    caption.textContent = defaultCaption;
  }

  const nodeFrom = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<SVGGElement>('[data-ls-node]') : null;

  svg.addEventListener('pointerover', (event) => {
    const node = nodeFrom(event.target);
    if (node) activate(node.dataset.lsNode!);
  });
  svg.addEventListener('pointerleave', clear);
  svg.addEventListener('focusin', (event) => {
    const node = nodeFrom(event.target);
    if (node) activate(node.dataset.lsNode!);
  });
  svg.addEventListener('focusout', (event) => {
    if (!svg.contains(event.relatedTarget as Node | null)) clear();
  });
  svg.addEventListener('click', (event) => {
    const node = nodeFrom(event.target);
    if (node && getLanguage(node.dataset.lsNode!)) openProfile(node.dataset.lsNode!);
  });
  svg.addEventListener('keydown', (event) => {
    const node = nodeFrom(event.target);
    if (!node || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (getLanguage(node.dataset.lsNode!)) openProfile(node.dataset.lsNode!);
  });

  return { activate };
}

/* Head to head */

const comparatives: Record<FacetKey, string> = {
  performance: 'is faster than',
  safety: 'is safer than',
  approachability: 'is easier to learn than',
  expressiveness: 'is more expressive than',
  concurrency: 'handles concurrency better than',
  ecosystem: 'has a bigger ecosystem than',
  tooling: 'has better tooling than',
  reach: 'runs in more places than',
  stability: 'is more stable than',
  jobs: 'has more jobs than',
  momentum: 'has more momentum than'
};

function initCompare() {
  const section = query(document, '#compare');
  const selects = [...section.querySelectorAll<HTMLSelectElement>('[data-ls-pick]')];
  const matchupButtons = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-matchup]')];
  const tracks = new Map([...section.querySelectorAll<HTMLElement>('[data-ls-track]')].map((track) => [track.dataset.lsTrack as FacetKey, track]));
  const diffs = query(section, '[data-ls-diffs]');
  const traits = query<HTMLTableElement>(section, '[data-ls-traits]');
  const snippets = query(section, '[data-ls-snippets]');

  let picks: (string | null)[] = selects.map((select) => select.value || null);

  function key(slot: number) {
    const badge = element('span', 'ls-picker__key', 'ABC'[slot]);
    badge.setAttribute('aria-hidden', 'true');
    return badge;
  }

  function render() {
    const chosen = picks.flatMap((id, slot) => (id ? [{ slot, language: getLanguage(id)! }] : []));

    for (const facet of facets) {
      const groups = new Map<number, typeof chosen>();
      for (const pick of chosen) {
        const score = pick.language.scores[facet.key];
        groups.set(score, [...(groups.get(score) ?? []), pick]);
      }
      const dots: HTMLElement[] = [];
      for (const [score, group] of groups) {
        group.forEach((pick, index) => {
          const dot = element('span', 'ls-dot', pick.language.symbol);
          dot.dataset.slot = String(pick.slot);
          dot.style.setProperty('--x', String((score - 0.5) * 10));
          dot.style.setProperty('--offset', String((index - (group.length - 1) / 2) * 0.7));
          dot.setAttribute('role', 'img');
          dot.setAttribute('aria-label', `${pick.language.name}: ${score} out of 10`);
          dots.push(dot);
        });
      }
      tracks.get(facet.key)!.replaceChildren(...dots);
    }

    if (chosen.length < 2) {
      diffs.replaceChildren(element('li', undefined, 'Choose at least two languages to see where they differ.'));
    } else {
      const spreads = facets
        .map((facet) => {
          const scores = chosen.map((pick) => pick.language.scores[facet.key]);
          return { facet, spread: Math.max(...scores) - Math.min(...scores) };
        })
        .sort((a, b) => b.spread - a.spread);
      const items = spreads
        .filter((entry) => entry.spread >= 2)
        .slice(0, 5)
        .map(({ facet }) => {
          const ordered = [...chosen].sort((a, b) => b.language.scores[facet.key] - a.language.scores[facet.key]);
          const item = element('li');
          item.append(element('strong', undefined, facet.name));
          if (chosen.length === 2) {
            const [high, low] = ordered;
            item.append(
              `${high.language.name} ${comparatives[facet.key]} ${low.language.name} (${high.language.scores[facet.key]} vs ${low.language.scores[facet.key]}).`
            );
          } else {
            item.append(ordered.map((pick) => `${pick.language.name} ${pick.language.scores[facet.key]}`).join(' · '));
          }
          return item;
        });
      const ties = spreads.filter((entry) => entry.spread === 0).map((entry) => entry.facet.name.toLowerCase());
      if (ties.length > 0) {
        const item = element('li');
        item.append(element('strong', undefined, 'Level'), `They score the same on ${formatList(ties)}.`);
        items.push(item);
      }
      if (items.length === 0) items.push(element('li', undefined, 'These languages are within a point of each other on every facet.'));
      diffs.replaceChildren(...items);
    }

    const rows: [string, (language: Language) => string][] = [
      ['Family', (language) => getFamily(language.family).name],
      ['First appeared', (language) => `${language.year}, ${language.creator}`],
      ['Popularity', (language) => `#${rankOf(language)} of ${languages.length} · ${language.admired.toFixed(1)}% admired`],
      ['Typing', (language) => language.typing],
      ['Memory', (language) => language.memory],
      ['Runs as', (language) => language.runtime],
      ['Concurrency', (language) => language.concurrency],
      ['Null handling', (language) => language.nulls],
      ['Packages', (language) => language.packages],
      [
        'Home turf',
        (language) =>
          Object.entries(language.domains)
            .filter(([, fit]) => fit === 3)
            .map(([domain]) => domainLabels[domain as DomainKey])
            .join(', ')
      ]
    ];
    const head = element('thead');
    const headRow = element('tr');
    headRow.append(element('th'));
    for (const pick of chosen) {
      const cell = element('th');
      cell.scope = 'col';
      cell.dataset.slot = String(pick.slot);
      cell.append(key(pick.slot), pick.language.name);
      headRow.append(cell);
    }
    head.append(headRow);
    const body = element('tbody');
    for (const [label, value] of rows) {
      const row = element('tr');
      const header = element('th', undefined, label);
      header.scope = 'row';
      row.append(header, ...chosen.map((pick) => element('td', undefined, value(pick.language))));
      body.append(row);
    }
    traits.replaceChildren(head, body);

    snippets.style.setProperty('--count', String(Math.max(1, chosen.length)));
    snippets.replaceChildren(
      ...chosen.map((pick) => {
        const figure = query(document, `[data-ls-snippet="${pick.language.id}"]`).cloneNode(true) as HTMLElement;
        figure.dataset.slot = String(pick.slot);
        return figure;
      })
    );

    const signature = picks.filter(Boolean).join(' ');
    matchupButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lsMatchup === signature)));
  }

  function set(ids: string[]) {
    picks = [0, 1, 2].map((slot) => ids[slot] ?? null);
    selects.forEach((select, slot) => (select.value = picks[slot] ?? ''));
    render();
  }

  selects.forEach((select, slot) =>
    select.addEventListener('change', () => {
      picks[slot] = select.value || null;
      render();
    })
  );
  matchupButtons.forEach((button) => button.addEventListener('click', () => set(button.dataset.lsMatchup!.split(' '))));
  render();

  return { set };
}

/* Choosing a language */

const fitLabels = ['Unusual choice', 'Possible', 'Common choice', 'Home turf'];

function initChoose() {
  const section = query(document, '#choose');
  const projectButtons = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-project]')];
  const inputs = new Map([...section.querySelectorAll<HTMLInputElement>('[data-ls-weight]')].map((input) => [input.dataset.lsWeight as FacetKey, input]));
  const outputs = new Map([...section.querySelectorAll<HTMLOutputElement>('[data-ls-weight-label]')].map((output) => [output.dataset.lsWeightLabel as FacetKey, output]));
  const domainSelect = query<HTMLSelectElement>(section, '[data-ls-domain]');
  const results = query(section, '[data-ls-results]');

  let domains: DomainKey[] = projects[0].domains;

  function weights() {
    return Object.fromEntries(facets.map((facet) => [facet.key, Number(inputs.get(facet.key)!.value)])) as Record<FacetKey, number>;
  }

  function render() {
    const current = weights();
    for (const facet of facets) outputs.get(facet.key)!.textContent = weightLabels[current[facet.key]];
    const matching = projects.find(
      (project) => facets.every((facet) => project.weights[facet.key] === current[facet.key]) && project.domains.join() === domains.join()
    );
    projectButtons.forEach((button) => button.setAttribute('aria-checked', String(button.dataset.lsProject === matching?.key)));

    if (facets.every((facet) => current[facet.key] === 0)) {
      results.replaceChildren(element('li', 'ls-result__why', 'Give at least one facet some weight to see a ranking.'));
      return;
    }

    const ranked = languages
      .map((language) => ({ language, score: matchScore(language, current, domains), fit: domainFit(language, domains) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    results.replaceChildren(
      ...ranked.map(({ language, score, fit }, index) => {
        const item = element('li', 'ls-result');
        const strengths = facets
          .filter((facet) => current[facet.key] > 0)
          .sort((a, b) => current[b.key] * language.scores[b.key] - current[a.key] * language.scores[a.key])
          .slice(0, 2)
          .map((facet) => `${facet.name.toLowerCase()} ${language.scores[facet.key]}`);
        const why = [domains.length > 0 ? fitLabels[fit] : null, `strongest on ${formatList(strengths)}`].filter(Boolean).join(' · ');
        const label = element('span');
        label.append(element('span', 'ls-result__name', language.name), element('span', 'ls-result__why', why));
        const bar = element('span', 'ls-bar');
        bar.setAttribute('aria-hidden', 'true');
        const fill = element('i');
        fill.style.setProperty('--v', score.toFixed(2));
        bar.append(fill);
        item.append(element('span', 'ls-result__rank', String(index + 1).padStart(2, '0')), miniTile(language), label, bar, element('span', 'ls-result__score', score.toFixed(1)));
        return item;
      })
    );
  }

  function applyProject(key: string) {
    const project = projects.find((candidate) => candidate.key === key)!;
    for (const facet of facets) inputs.get(facet.key)!.value = String(project.weights[facet.key]);
    domains = project.domains;
    domainSelect.value = project.domains[0] ?? '';
    render();
  }

  projectButtons.forEach((button) => button.addEventListener('click', () => applyProject(button.dataset.lsProject!)));
  inputs.forEach((input) => input.addEventListener('input', render));
  domainSelect.addEventListener('change', () => {
    domains = domainSelect.value ? [domainSelect.value as DomainKey] : [];
    render();
  });
  render();
}

/* Matrix */

function initMatrix() {
  const section = query(document, '#matrix');
  const tabs = [...section.querySelectorAll<HTMLButtonElement>('[data-ls-tab]')];
  const panels = [...section.querySelectorAll<HTMLElement>('[data-ls-panel]')];
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((other) => other.setAttribute('aria-selected', String(other === tab)));
      panels.forEach((panel) => (panel.hidden = panel.dataset.lsPanel !== tab.dataset.lsTab));
    })
  );

  const table = query<HTMLTableElement>(section, '[data-ls-matrix]');
  const body = table.tBodies[0];
  const sortButtons = [...table.querySelectorAll<HTMLButtonElement>('[data-ls-sort]')];
  let sortKey = 'rank';
  let ascending = true;

  sortButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const key = button.dataset.lsSort!;
      ascending = key === sortKey ? !ascending : !button.hasAttribute('data-desc');
      sortKey = key;
      const text = button.dataset.type === 'text';
      const rows = [...body.rows].sort((a, b) => {
        const left = a.dataset[key]!;
        const right = b.dataset[key]!;
        const order = text ? left.localeCompare(right) : Number(left) - Number(right);
        return (ascending ? order : -order) || Number(a.dataset.rank) - Number(b.dataset.rank);
      });
      body.append(...rows);
      sortButtons.forEach((other) =>
        other.closest('th')!.setAttribute('aria-sort', other === button ? (ascending ? 'ascending' : 'descending') : 'none')
      );
    })
  );
}

/* Profile dialog */

function initDialog() {
  const dialog = query<HTMLDialogElement>(document, '[data-ls-dialog]');
  const tile = query(dialog, '[data-ls-dialog-tile]');
  const order = [...document.querySelectorAll<HTMLElement>('[data-ls-profile]')].map((profile) => profile.dataset.lsProfile!);
  const field = (name: string) => query(dialog, `[data-ls-dialog-${name}]`);
  const tilePart = (name: string) => query(tile, `[data-tile="${name}"]`);
  let current: string | null = null;
  let opener: HTMLElement | null = null;

  function show(id: string) {
    const language = getLanguage(id);
    if (!language) return;
    current = id;
    const family = getFamily(language.family);
    setColors(tile, language.family);
    tilePart('year').textContent = String(language.year);
    tilePart('rank').textContent = `#${rankOf(language)}`;
    tilePart('symbol').textContent = language.symbol;
    tilePart('symbol').classList.toggle('is-long', language.symbol.length > 2);
    tilePart('name').textContent = language.name;
    field('position').textContent = `Profile ${order.indexOf(id) + 1} of ${order.length}`;
    field('name').textContent = language.name;
    field('tagline').textContent = language.tagline;
    const familyText = field('family');
    familyText.replaceChildren(element('strong', undefined, family.name), family.blurb);
    const body = query(document, `#lang-${id} [data-ls-profile-body]`).cloneNode(true);
    field('body').replaceChildren(body);

    if (!dialog.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    history.replaceState(null, '', `#lang-${id}`);
  }

  function step(offset: number) {
    if (!current) return;
    const index = (order.indexOf(current) + offset + order.length) % order.length;
    show(order[index]);
  }

  dialog.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    opener?.focus({ preventScroll: true });
    opener = null;
    current = null;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  query(dialog, '[data-ls-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll<HTMLButtonElement>('[data-ls-dialog-step]').forEach((button) =>
    button.addEventListener('click', () => step(Number(button.dataset.lsDialogStep)))
  );

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#lang-"]') : null;
    if (!link) return;
    const id = link.getAttribute('href')!.slice('#lang-'.length);
    if (!getLanguage(id)) return;
    event.preventDefault();
    hideTooltip();
    show(id);
  });

  const fromHash = () => {
    if (location.hash.startsWith('#lang-')) show(location.hash.slice('#lang-'.length));
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();

  return { show };
}

/* Wiring */

initLineup();
const spectrum = initSpectrum();
const map = initMap();
const rankings = initRankings();
const dialog = initDialog();
const lineage = initLineage(dialog.show);
const compare = initCompare();
initChoose();
initMatrix();

document.querySelectorAll<HTMLButtonElement>('[data-ls-show]').forEach((button) =>
  button.addEventListener('click', () => {
    const [kind, argument] = button.dataset.lsShow!.split(':');
    if (kind === 'lens') {
      spectrum.setLens(argument as LensKey);
      scrollToSection('spectrum');
    } else if (kind === 'map') {
      map.setView(argument);
      scrollToSection('map');
    } else if (kind === 'compare') {
      compare.set(argument.split(' '));
      scrollToSection('compare');
    } else if (kind === 'rank') {
      rankings.showStory(argument);
      scrollToSection('rankings');
    } else if (kind === 'lineage') {
      lineage.activate(argument);
      scrollToSection('lineage');
    }
  })
);
