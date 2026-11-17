/*
  Outline drawings on a 48 by 48 grid. Each one is shown large behind its
  project, bleeding off the right and bottom edges, so the shapes are bold and
  fill the grid.
*/
type Point = readonly [number, number];

const round = (value: number) => Math.round(value * 100) / 100;

// Open circles joined by lines that stop at each circle's edge.
function graph(edges: readonly (readonly [Point, Point])[], radius: number) {
  const nodes = [...new Set(edges.flat())];
  const lines = edges.map(([[x1, y1], [x2, y2]]) => {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const dx = ((x2 - x1) / length) * radius;
    const dy = ((y2 - y1) / length) * radius;
    return `M${round(x1 + dx)} ${round(y1 + dy)}L${round(x2 - dx)} ${round(y2 - dy)}`;
  });
  return `<path d="${lines.join('')}"/>${nodes.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${radius}"/>`).join('')}`;
}

const root: Point = [24, 6];
const left: Point = [9, 19];
const right: Point = [39, 19];
const shared: Point = [24, 29];

export const projectGlyphs = {
  // A call graph: two callers that share a callee.
  canopy: graph(
    [
      [root, left],
      [root, right],
      [left, shared],
      [right, shared],
      [left, [6, 42]],
      [shared, [24, 43]],
      [right, [42, 42]]
    ],
    3
  ),
  // A lightning bolt.
  archevolt: '<path d="M30 2 10 27h13l-5 19 20-25H25z"/>',
  // A shell prompt that turns into a waveform.
  openspeak:
    '<path d="m3 13 11 11L3 35"/><rect x="20" y="18" width="4" height="12" rx="2"/><rect x="27" y="4" width="4" height="40" rx="2"/><rect x="34" y="11" width="4" height="26" rx="2"/><rect x="41" y="19" width="4" height="10" rx="2"/>',
  // Added over removed.
  difftastic: '<path d="M20 3h8v9h9v8h-9v9h-8v-9h-9v-8h9z"/><rect x="11" y="36" width="26" height="8"/>',
  // A branch leaving the trunk for its own worktree.
  hypr: '<circle cx="11" cy="8" r="4"/><circle cx="11" cy="40" r="4"/><circle cx="35" cy="13" r="4"/><path d="M11 12v24M35 17v3a9 9 0 0 1-9 9H11"/>',
  // A tub of popcorn.
  popcorn: '<path d="m10 21 4 25h20l4-25z"/><path d="m19 21 1.5 25M29 21l-1.5 25"/><path d="M10 21a6 6 0 0 1 5-10 9.5 9.5 0 0 1 18 0 6 6 0 0 1 5 10"/>'
} as const;

export type ProjectGlyphName = keyof typeof projectGlyphs;
