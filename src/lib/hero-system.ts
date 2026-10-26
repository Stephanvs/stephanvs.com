export type Point = readonly [x: number, y: number];

interface Frame {
	x: number;
	y: number;
	w: number;
	h: number;
}

interface BoundedContext {
	label: string;
	frame: Frame;
}

export const canvas = { width: 600, height: 420 } as const;

export const contexts = {
	inventory: { label: "Inventory", frame: { x: 20, y: 40, w: 176, h: 124 } },
	ordering: { label: "Ordering", frame: { x: 308, y: 20, w: 272, h: 164 } },
	billing: { label: "Billing", frame: { x: 340, y: 268, w: 240, h: 132 } },
	shipping: { label: "Shipping", frame: { x: 36, y: 252, w: 192, h: 148 } }
} satisfies Record<string, BoundedContext>;

export type ContextId = keyof typeof contexts;

export interface Service {
	context: ContextId;
	tangled: Point;
	resolved: Point;
}

export const services: readonly Service[] = [
	{ context: "inventory", tangled: [412, 236], resolved: [64, 92] },
	{ context: "inventory", tangled: [168, 316], resolved: [160, 84] },
	{ context: "inventory", tangled: [520, 96], resolved: [112, 132] },
	{ context: "ordering", tangled: [96, 196], resolved: [352, 76] },
	{ context: "ordering", tangled: [256, 300], resolved: [528, 64] },
	{ context: "ordering", tangled: [360, 120], resolved: [464, 148] },
	{ context: "ordering", tangled: [488, 352], resolved: [448, 100] },
	{ context: "billing", tangled: [228, 84], resolved: [392, 332] },
	{ context: "billing", tangled: [548, 224], resolved: [480, 308] },
	{ context: "billing", tangled: [300, 196], resolved: [536, 364] },
	{ context: "shipping", tangled: [456, 164], resolved: [84, 316] },
	{ context: "shipping", tangled: [120, 112], resolved: [192, 300] },
	{ context: "shipping", tangled: [352, 360], resolved: [140, 364] }
];

export interface MessagePath {
	event: string;
	from: ContextId;
	to: ContextId;
	lane: { x: number } | { y: number };
	everySeconds: number;
	phaseSeconds: number;
}

export const messages: readonly MessagePath[] = [
	{ event: "OrderPlaced", from: "ordering", to: "billing", lane: { x: 460 }, everySeconds: 4.6, phaseSeconds: 0 },
	{ event: "PaymentCaptured", from: "billing", to: "shipping", lane: { y: 336 }, everySeconds: 5.4, phaseSeconds: 1.3 },
	{ event: "ParcelShipped", from: "shipping", to: "inventory", lane: { x: 120 }, everySeconds: 5, phaseSeconds: 2.5 },
	{ event: "StockChanged", from: "inventory", to: "ordering", lane: { y: 104 }, everySeconds: 6.2, phaseSeconds: 0.6 }
];

export interface Coupling {
	a: Service;
	b: Service;
	cohesive: boolean;
}

export const couplings: readonly Coupling[] = services.flatMap((a, i) =>
	services.slice(i + 1).map((b) => ({ a, b, cohesive: a.context === b.context }))
);

export function route({ from, to, lane }: MessagePath): { start: Point; end: Point } {
	const source = contexts[from].frame;
	const target = contexts[to].frame;
	const sideBySide = "y" in lane;
	const at = sideBySide ? lane.y : lane.x;
	const [lo, hi] = sideBySide
		? [Math.max(source.y, target.y), Math.min(source.y + source.h, target.y + target.h)]
		: [Math.max(source.x, target.x), Math.min(source.x + source.w, target.x + target.w)];
	if (at <= lo || at >= hi) throw new Error(`Lane ${at} for ${from} -> ${to} misses the shared edge ${lo}..${hi}`);

	if (sideBySide) {
		const rightward = source.x < target.x;
		return {
			start: [rightward ? source.x + source.w : source.x, at],
			end: [rightward ? target.x : target.x + target.w, at]
		};
	}
	const downward = source.y < target.y;
	return {
		start: [at, downward ? source.y + source.h : source.y],
		end: [at, downward ? target.y : target.y + target.h]
	};
}
