export interface SwarmItem {
  id: string;
  /** Position along the axis, 0–100. */
  x: number;
  /** Lower values are placed first, closest to the axis. */
  priority: number;
}

export interface SwarmPlacement {
  x: number;
  level: number;
}

/** Stacks tiles upwards wherever they would overlap along a single axis. */
export function swarm(items: SwarmItem[], widthPx: number, spacingPx: number) {
  const minDistance = (spacingPx / widthPx) * 100;
  const placed: SwarmPlacement[] = [];
  const result = new Map<string, SwarmPlacement>();

  for (const item of [...items].sort((a, b) => a.priority - b.priority)) {
    let level = 0;
    while (placed.some((other) => other.level === level && Math.abs(other.x - item.x) < minDistance)) level++;
    const placement = { x: item.x, level };
    placed.push(placement);
    result.set(item.id, placement);
  }

  return result;
}

export interface PlotPoint {
  id: string;
  x: number;
  y: number;
}

/**
 * Pushes overlapping square tiles apart along their axis of least overlap, so every tile
 * stays readable while staying as close as possible to its true position.
 */
export function relax(points: PlotPoint[], width: number, height: number, spacing: number, iterations = 160) {
  const nodes = points.map((point) => ({ ...point }));
  const half = spacing / 2;

  for (let iteration = 0; iteration < iterations; iteration++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = spacing - Math.abs(dx);
        const overlapY = spacing - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;

        moved = true;
        if (overlapX <= overlapY) {
          const sign = dx === 0 ? ((i + j) % 2 === 0 ? 1 : -1) : Math.sign(dx);
          a.x -= (sign * overlapX) / 2;
          b.x += (sign * overlapX) / 2;
        } else {
          const sign = dy === 0 ? ((i + j) % 2 === 0 ? 1 : -1) : Math.sign(dy);
          a.y -= (sign * overlapY) / 2;
          b.y += (sign * overlapY) / 2;
        }
      }
    }

    for (const node of nodes) {
      node.x = Math.min(width - half, Math.max(half, node.x));
      node.y = Math.min(height - half, Math.max(half, node.y));
    }
    if (!moved) break;
  }

  return new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
}
