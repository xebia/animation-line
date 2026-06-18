# Line Field Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `xebia-animation-line`, a framework-agnostic, themeable library of autonomous (non-interactive) WebGL line-field animations inspired by slope.agency.

**Architecture:** Each *variant* is a pure CPU geometry generator `generate(env) → Polyline[]` in pixel coordinates (the exact math validated in the brainstorming demo). A shared OGL `Renderer` flattens polylines to GL `LINES`, colours them via a palette gradient texture (per-vertex `s ∈ [0,1]`), paints the configurable background, and runs the rAF loop. The public `LineField` class wires a variant + theme + mode (`auto` time loop or `scroll` progress) and respects `prefers-reduced-motion`. Variants never read the pointer.

**Tech Stack:** TypeScript, Vite (dev server + ES module build), [`ogl`](https://github.com/oframe/ogl) (~30 kb WebGL), Vitest (unit tests), optional React wrapper.

---

## File Structure

```
xebia-animation-line/
  package.json, tsconfig.json, vite.config.ts, vitest.config.ts, .gitignore
  src/
    core/
      types.ts          # LineFieldOptions, Variant, Polyline, VariantEnv, VariantName
      geom.ts           # lerp, auto(t), project3d() — shared math helpers
      palette.ts        # colorAt(palette, s); buildGradientPixels(palette) → Uint8Array(256*4)
      background.ts      # resolveBackground(opts) → {clear:[r,g,b,a], blend:'add'|'normal', gradient?}
      reducedMotion.ts  # prefersReducedMotion()
      scroll.ts         # ScrollProgress: maps element viewport position → t∈[0,1]
      lineGeometry.ts   # polylinesToSegments(Polyline[]) → {position:Float32Array, s:Float32Array}
      Renderer.ts       # OGL wiring: canvas, program, gradient texture, loop, resize, destroy
      LineField.ts      # public class: variant + theme + mode + reduced-motion
    variants/
      index.ts          # VARIANTS registry: Record<VariantName, Variant>
      oscilacion.ts onda.ts interferencia.ts malla.ts rejilla.ts
      pliegues.ts cubo.ts
    react/LineField.tsx # optional React wrapper
    index.ts            # public exports
  demo/
    index.html main.ts  # gallery: variant + palette + background selectors
  tests/                # mirrors src/ unit tests
```

**Coordinate convention:** variants emit polyline points in **pixel space** `[0,W]×[0,H]` (y-down), using the `env.W`/`env.H` passed in. `lineGeometry.polylinesToSegments` later converts to clip space. This lets us port the validated demo math verbatim.

---

## Task 0: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `src/index.ts`

- [ ] **Step 1: Initialise git and npm**

Run:
```bash
cd /Users/israelperezgonzalez/Documents/Desarrollo/xebia-animation-line
git init
npm init -y
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install ogl
npm install -D typescript vite vitest @types/node jsdom
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
.superpowers/
*.log
.DS_Store
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `vite.config.ts`** (library build + demo dev server)

```ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XebiaAnimationLine',
      formats: ['es'],
      fileName: 'xebia-animation-line',
    },
    rollupOptions: { external: ['ogl', 'react', 'react-dom'] },
  },
});
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 7: Add scripts to `package.json`**

Set the `"scripts"` field to:
```json
{
  "dev": "vite",
  "build": "vite build && tsc --emitDeclarationOnly",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 8: Create a placeholder `src/index.ts`** so build/test have an entry

```ts
export const VERSION = '0.0.0';
```

- [ ] **Step 9: Verify tooling works**

Run: `npm test`
Expected: Vitest runs and reports "No test files found" (exit 0) or passes with 0 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold xebia-animation-line (vite + ts + ogl + vitest)"
```

---

## Task 1: Core types

**Files:**
- Create: `src/core/types.ts`
- Test: `tests/core/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import type { LineFieldOptions, Polyline, VariantEnv } from '../../src/core/types';
import { VARIANT_NAMES } from '../../src/core/types';

describe('types', () => {
  it('exposes the 7 variant names', () => {
    expect(VARIANT_NAMES).toEqual([
      'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
      'pliegues', 'cubo',
    ]);
  });

  it('shapes compile', () => {
    const env: VariantEnv = { t: 0, W: 800, H: 600 };
    const pl: Polyline = { pts: [0, 0, 1, 1], s: 0.5 };
    const opts: LineFieldOptions = {
      variant: 'oscilacion',
      palette: ['#000000', '#ffffff'],
      background: { type: 'solid', color: '#000000' },
    };
    expect(env.W + pl.s + opts.palette.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/types.test.ts`
Expected: FAIL — cannot find module `../../src/core/types`.

- [ ] **Step 3: Write `src/core/types.ts`**

```ts
export const VARIANT_NAMES = [
  'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
  'pliegues', 'cubo',
] as const;

export type VariantName = (typeof VARIANT_NAMES)[number];

export type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle?: number }
  | { type: 'transparent' };

export interface LineFieldOptions {
  variant: VariantName;
  palette: string[];            // 2+ hex colours → gradient
  background: Background;
  mode?: 'auto' | 'scroll';     // default 'auto'
  speed?: number;               // default 1
  lineCount?: number;           // optional density override
}

/** Pixel-space polyline: pts = [x0,y0, x1,y1, ...] in [0,W]×[0,H], y-down. */
export interface Polyline { pts: number[]; s: number; }

export interface VariantEnv { t: number; W: number; H: number; lineCount?: number; }

export interface Variant {
  name: VariantName;
  generate(env: VariantEnv): Polyline[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/types.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts tests/core/types.test.ts
git commit -m "feat: core types (LineFieldOptions, Variant, Polyline)"
```

---

## Task 2: Geometry helpers (`geom.ts`)

**Files:**
- Create: `src/core/geom.ts`
- Test: `tests/core/geom.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { lerp, auto, project3d } from '../../src/core/geom';

describe('geom', () => {
  it('lerp interpolates', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('auto returns oscillators in [0,1], deterministic', () => {
    const a = auto(1234);
    const b = auto(1234);
    expect(a).toEqual(b);
    expect(a.mx).toBeGreaterThanOrEqual(0);
    expect(a.mx).toBeLessThanOrEqual(1);
    expect(a.my).toBeGreaterThanOrEqual(0);
    expect(a.my).toBeLessThanOrEqual(1);
  });

  it('project3d returns finite screen coords', () => {
    const p = project3d(0.5, -0.3, 0.2, 0.4, 0.6, 100, 800, 600);
    expect(Number.isFinite(p.X)).toBe(true);
    expect(Number.isFinite(p.Y)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/geom.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/geom.ts`**

```ts
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Autonomous oscillators (replace the demo's mouse params). t in ms. */
export function auto(t: number): { mx: number; my: number } {
  return {
    mx: 0.5 + 0.5 * Math.sin(t * 0.00026),
    my: 0.5 + 0.5 * Math.sin(t * 0.00019 + 1.3),
  };
}

/** Rotate (x,y,z) about Y then X, apply perspective, map to pixel space. */
export function project3d(
  x: number, y: number, z: number,
  rotX: number, rotY: number, S: number,
  W: number, H: number, f = 4.2,
): { X: number; Y: number; d: number } {
  const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
  const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
  const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
  const sc = f / (f + z2);
  return { X: W / 2 + x1 * S * sc, Y: H / 2 + y1 * S * sc, d: z2 };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/geom.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/geom.ts tests/core/geom.test.ts
git commit -m "feat: geometry helpers (lerp, auto, project3d)"
```

---

## Task 3: Palette (`palette.ts`)

**Files:**
- Create: `src/core/palette.ts`
- Test: `tests/core/palette.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { colorAt, buildGradientPixels } from '../../src/core/palette';

describe('palette', () => {
  it('returns endpoints exactly', () => {
    expect(colorAt(['#000000', '#ffffff'], 0)).toEqual([0, 0, 0]);
    expect(colorAt(['#000000', '#ffffff'], 1)).toEqual([255, 255, 255]);
  });

  it('mixes the midpoint', () => {
    expect(colorAt(['#000000', '#ffffff'], 0.5)).toEqual([128, 128, 128]);
  });

  it('clamps out-of-range', () => {
    expect(colorAt(['#000000', '#ffffff'], -1)).toEqual([0, 0, 0]);
    expect(colorAt(['#000000', '#ffffff'], 2)).toEqual([255, 255, 255]);
  });

  it('builds a 256*4 RGBA gradient', () => {
    const px = buildGradientPixels(['#000000', '#ffffff']);
    expect(px.length).toBe(256 * 4);
    expect(px[3]).toBe(255);          // alpha set
    expect([px[0], px[1], px[2]]).toEqual([0, 0, 0]);
    expect([px[255 * 4], px[255 * 4 + 1], px[255 * 4 + 2]]).toEqual([255, 255, 255]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/palette.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/palette.ts`**

```ts
import { lerp } from './geom';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorAt(palette: string[], t: number): [number, number, number] {
  const p = palette.length >= 2 ? palette : [palette[0] ?? '#000000', palette[0] ?? '#000000'];
  const c = Math.max(0, Math.min(1, t));
  const seg = c * (p.length - 1);
  const i = Math.min(Math.floor(seg), p.length - 2);
  const f = seg - i;
  const a = hexToRgb(p[i]);
  const b = hexToRgb(p[i + 1]);
  return [
    Math.round(lerp(a[0], b[0], f)),
    Math.round(lerp(a[1], b[1], f)),
    Math.round(lerp(a[2], b[2], f)),
  ];
}

export function buildGradientPixels(palette: string[]): Uint8Array {
  const px = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const [r, g, b] = colorAt(palette, i / 255);
    px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b; px[i * 4 + 3] = 255;
  }
  return px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/palette.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/palette.ts tests/core/palette.test.ts
git commit -m "feat: palette colorAt + gradient texture pixels"
```

---

## Task 4: Background resolver (`background.ts`)

**Files:**
- Create: `src/core/background.ts`
- Test: `tests/core/background.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { resolveBackground } from '../../src/core/background';

describe('resolveBackground', () => {
  it('solid → opaque clear colour, normal blend', () => {
    const r = resolveBackground({ type: 'solid', color: '#0a1b2b' });
    expect(r.clear).toEqual([10 / 255, 27 / 255, 43 / 255, 1]);
    expect(r.blend).toBe('add');
    expect(r.gradient).toBeUndefined();
  });

  it('transparent → alpha 0', () => {
    const r = resolveBackground({ type: 'transparent' });
    expect(r.clear[3]).toBe(0);
  });

  it('gradient → returns from/to and additive blend', () => {
    const r = resolveBackground({ type: 'gradient', from: '#000000', to: '#ffffff' });
    expect(r.gradient).toEqual({ from: '#000000', to: '#ffffff', angle: 45 });
    expect(r.blend).toBe('add');
  });

  it('light solid uses normal blend (no additive glow)', () => {
    const r = resolveBackground({ type: 'solid', color: '#eef2f7' });
    expect(r.blend).toBe('normal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/background.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/background.ts`**

```ts
import type { Background } from './types';

export interface ResolvedBackground {
  clear: [number, number, number, number];
  blend: 'add' | 'normal';
  gradient?: { from: string; to: string; angle: number };
}

function hexToUnit(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToUnit(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function resolveBackground(bg: Background): ResolvedBackground {
  if (bg.type === 'transparent') {
    return { clear: [0, 0, 0, 0], blend: 'add' };
  }
  if (bg.type === 'gradient') {
    return {
      clear: [...hexToUnit(bg.from), 1] as [number, number, number, number],
      blend: 'add',
      gradient: { from: bg.from, to: bg.to, angle: bg.angle ?? 45 },
    };
  }
  // solid: light backgrounds can't show additive glow → use normal blend
  const blend = luminance(bg.color) > 0.6 ? 'normal' : 'add';
  return { clear: [...hexToUnit(bg.color), 1] as [number, number, number, number], blend };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/background.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/background.ts tests/core/background.test.ts
git commit -m "feat: background resolver (solid/gradient/transparent + blend mode)"
```

---

## Task 5: Reduced motion (`reducedMotion.ts`)

**Files:**
- Create: `src/core/reducedMotion.ts`
- Test: `tests/core/reducedMotion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { prefersReducedMotion } from '../../src/core/reducedMotion';

describe('prefersReducedMotion', () => {
  it('returns true when the media query matches', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q }));
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/reducedMotion.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/reducedMotion.ts`**

```ts
export function prefersReducedMotion(): boolean {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/reducedMotion.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/reducedMotion.ts tests/core/reducedMotion.test.ts
git commit -m "feat: prefers-reduced-motion detection"
```

---

## Task 6: Scroll progress (`scroll.ts`)

**Files:**
- Create: `src/core/scroll.ts`
- Test: `tests/core/scroll.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { progressFromRect } from '../../src/core/scroll';

describe('progressFromRect', () => {
  const vh = 1000;
  it('is 0 when element top is at the bottom of viewport', () => {
    expect(progressFromRect({ top: 1000, height: 400 }, vh)).toBeCloseTo(0);
  });
  it('is 1 when element bottom is at the top of viewport', () => {
    expect(progressFromRect({ top: -400, height: 400 }, vh)).toBeCloseTo(1);
  });
  it('is 0.5 mid-pass and clamps outside', () => {
    expect(progressFromRect({ top: 300, height: 400 }, vh)).toBeCloseTo(0.5);
    expect(progressFromRect({ top: 5000, height: 400 }, vh)).toBe(0);
    expect(progressFromRect({ top: -5000, height: 400 }, vh)).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/scroll.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/scroll.ts`**

```ts
/** Map an element's vertical position over a full viewport pass to t∈[0,1]. */
export function progressFromRect(rect: { top: number; height: number }, viewportH: number): number {
  const total = viewportH + rect.height;
  const travelled = viewportH - rect.top;
  return Math.max(0, Math.min(1, travelled / total));
}

export class ScrollProgress {
  private raf = 0;
  private running = false;
  constructor(private el: HTMLElement, private onChange: (t: number) => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      const rect = this.el.getBoundingClientRect();
      this.onChange(progressFromRect({ top: rect.top, height: rect.height }, window.innerHeight));
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/scroll.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/scroll.ts tests/core/scroll.test.ts
git commit -m "feat: scroll progress mapping (no pointer)"
```

---

## Task 7: Line geometry flattening (`lineGeometry.ts`)

**Files:**
- Create: `src/core/lineGeometry.ts`
- Test: `tests/core/lineGeometry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { polylinesToSegments } from '../../src/core/lineGeometry';

describe('polylinesToSegments', () => {
  it('expands an N-point polyline into (N-1) clip-space segments', () => {
    // one polyline with 3 points → 2 segments → 4 vertices (8 floats for vec2)
    const r = polylinesToSegments([{ pts: [0, 0, 400, 300, 800, 600], s: 0.5 }], 800, 600);
    expect(r.position.length).toBe(4 * 2);
    expect(r.s.length).toBe(4);
    // first point (0,0) px → clip (-1, 1)
    expect(r.position[0]).toBeCloseTo(-1);
    expect(r.position[1]).toBeCloseTo(1);
    // last point (800,600) px → clip (1, -1)
    expect(r.position[6]).toBeCloseTo(1);
    expect(r.position[7]).toBeCloseTo(-1);
    expect(r.s.every((v) => v === 0.5)).toBe(true);
  });

  it('skips degenerate single-point polylines', () => {
    const r = polylinesToSegments([{ pts: [10, 10], s: 0 }], 800, 600);
    expect(r.position.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/lineGeometry.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write `src/core/lineGeometry.ts`**

```ts
import type { Polyline } from './types';

/** Convert pixel-space polylines to GL_LINES vertex buffers in clip space. */
export function polylinesToSegments(
  polylines: Polyline[], W: number, H: number,
): { position: Float32Array; s: Float32Array } {
  const pos: number[] = [];
  const ss: number[] = [];
  const toClipX = (px: number) => (px / W) * 2 - 1;
  const toClipY = (py: number) => 1 - (py / H) * 2;
  for (const pl of polylines) {
    const n = pl.pts.length / 2;
    for (let i = 0; i < n - 1; i++) {
      const ax = pl.pts[i * 2], ay = pl.pts[i * 2 + 1];
      const bx = pl.pts[(i + 1) * 2], by = pl.pts[(i + 1) * 2 + 1];
      pos.push(toClipX(ax), toClipY(ay), toClipX(bx), toClipY(by));
      ss.push(pl.s, pl.s);
    }
  }
  return { position: new Float32Array(pos), s: new Float32Array(ss) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/lineGeometry.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/lineGeometry.ts tests/core/lineGeometry.test.ts
git commit -m "feat: flatten polylines to clip-space line segments"
```

---

## Tasks 8–16: Variants

> Final set: **oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo** (7). Tasks 13 `geometrica` and 15 `tech` were removed — see their stubs below.

Each variant is a pure generator. The test pattern is identical for all: deterministic output, finite coordinates, expected polyline count. Each task below gives the **full** generator code and a concrete test (no shared "see Task N").

> **Shared test helper** — create `tests/variants/helpers.ts` once:
> ```ts
> import type { Polyline } from '../../src/core/types';
> export function allFinite(pls: Polyline[]): boolean {
>   return pls.every((p) => p.pts.every(Number.isFinite) && Number.isFinite(p.s));
> }
> ```

### Task 8: Variant `oscilacion`

**Files:**
- Create: `src/variants/oscilacion.ts`, `tests/variants/helpers.ts`
- Test: `tests/variants/oscilacion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { oscilacion } from '../../src/variants/oscilacion';
import { allFinite } from './helpers';

describe('oscilacion', () => {
  it('produces N 2-point polylines, deterministic & finite', () => {
    const a = oscilacion.generate({ t: 1000, W: 800, H: 600 });
    const b = oscilacion.generate({ t: 1000, W: 800, H: 600 });
    expect(a.length).toBe(150);
    expect(a[0].pts.length).toBe(4);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Run test → FAIL** (`npx vitest run tests/variants/oscilacion.test.ts`)

- [ ] **Step 3: Write `src/variants/oscilacion.ts`** (create `tests/variants/helpers.ts` from the snippet above too)

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { auto } from '../core/geom';

export const oscilacion: Variant = {
  name: 'oscilacion',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 150;
    const { mx, my } = auto(t);
    const cx = W * 0.42, cy = H * 0.5;
    const r0 = 30 + 20 * Math.sin(t * 0.0006);
    const r1 = Math.min(W, H) * 0.46;
    const a = 3 + mx * 4;
    const phase = t * 0.00035;
    const twist = (my - 0.5) * 2.2;
    const out: Polyline[] = [];
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const x0 = cx + r0 * Math.cos(a * s * 6.283 + phase + twist * s);
      const y0 = cy + r0 * Math.sin(a * s * 6.283 + phase + twist * s);
      const ang = s * 4.712 - 0.6 + phase * 0.4;
      const x1 = cx + r1 * Math.cos(ang);
      const y1 = cy + r1 * Math.sin(ang) + (s - 0.5) * H * 0.15;
      out.push({ pts: [x0, y0, x1, y1], s });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run test → PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: oscilacion variant"`

### Task 9: Variant `onda`

**Files:** Create `src/variants/onda.ts`; Test `tests/variants/onda.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { onda } from '../../src/variants/onda';
import { allFinite } from './helpers';

describe('onda', () => {
  it('produces 150 2-point polylines, finite & deterministic', () => {
    const a = onda.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(150);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(onda.generate({ t: 500, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { auto, lerp } from '../core/geom';

export const onda: Variant = {
  name: 'onda',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 150;
    const { mx, my } = auto(t);
    const top = H * 0.32, bot = H * 0.68, amp = H * 0.16 * (0.6 + my);
    const out: Polyline[] = [];
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const x = lerp(W * 0.06, W * 0.94, s);
      const ph = t * 0.0011 + mx * 3;
      out.push({ pts: [x, top + Math.sin(s * 6.9 + ph) * amp, x, bot + Math.sin(s * 6.9 + ph + 1.2) * amp], s });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: onda variant"`

### Task 10: Variant `interferencia`

**Files:** Create `src/variants/interferencia.ts`; Test `tests/variants/interferencia.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { interferencia } from '../../src/variants/interferencia';
import { allFinite } from './helpers';

describe('interferencia', () => {
  it('produces 64 multi-point polylines, finite & deterministic', () => {
    const a = interferencia.generate({ t: 800, W: 800, H: 600 });
    expect(a.length).toBe(64);
    expect(a[0].pts.length).toBe(141 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(interferencia.generate({ t: 800, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { lerp } from '../core/geom';

export const interferencia: Variant = {
  name: 'interferencia',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const lines = 64;
    const src = [
      { x: 0.24, y: 0.40, f: 0.030 },
      { x: 0.72, y: 0.62, f: 0.024 },
      { x: 0.52, y: 0.30, f: 0.038 },
    ];
    const out: Polyline[] = [];
    for (let l = 0; l < lines; l++) {
      const s = l / (lines - 1);
      const baseY = lerp(H * 0.10, H * 0.90, s);
      const pts: number[] = [];
      for (let i = 0; i <= 140; i++) {
        const u = i / 140;
        const x = lerp(W * 0.03, W * 0.97, u);
        let disp = 0;
        src.forEach((q, qi) => {
          const sx = q.x * W, sy = q.y * H, d = Math.hypot(x - sx, baseY - sy);
          disp += Math.sin(d * q.f - t * 0.0022 * (1 + qi * 0.3) + u * qi) * (32 / (1 + d * 0.004));
        });
        pts.push(x, baseY + disp);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: interferencia variant (waves + dispersion)"`

### Task 11: Variant `malla` (ruled surface, ref img 4)

**Files:** Create `src/variants/malla.ts`; Test `tests/variants/malla.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { malla } from '../../src/variants/malla';
import { allFinite } from './helpers';

describe('malla', () => {
  it('produces rows+cols polylines (42+42), finite & deterministic', () => {
    const a = malla.generate({ t: 600, W: 800, H: 600 });
    expect(a.length).toBe(84);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(malla.generate({ t: 600, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

export const malla: Variant = {
  name: 'malla',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const rotY = t * 0.00022, rotX = 0.62 + 0.1 * Math.sin(t * 0.0003);
    const S = Math.min(W, H) * 0.36, tw = 1.35 + 0.55 * Math.sin(t * 0.00035);
    const rows = 42, cols = 42; // alta densidad → más intersección entre líneas
    const P = (u: number, v: number) => {
      const x = -1 + 2 * u, y = 1 - 2 * v;
      const z = ((-1 + 2 * u) * (1 - v) + (1 - 2 * u) * v) * tw;
      return project3d(x, y, z, rotX, rotY, S, W, H);
    };
    const out: Polyline[] = [];
    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1); const pts: number[] = [];
      for (let c = 0; c < cols; c++) { const p = P(c / (cols - 1), v); pts.push(p.X, p.Y); }
      out.push({ pts, s: r / (rows - 1) });
    }
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1); const pts: number[] = [];
      for (let r = 0; r < rows; r++) { const p = P(u, r / (rows - 1)); pts.push(p.X, p.Y); }
      out.push({ pts, s: c / (cols - 1) });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: malla reglada variant"`

### Task 12: Variant `rejilla` (wavy 3D grid)

**Files:** Create `src/variants/rejilla.ts`; Test `tests/variants/rejilla.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { rejilla } from '../../src/variants/rejilla';
import { allFinite } from './helpers';

describe('rejilla', () => {
  it('produces 48 polylines (24+24), finite & deterministic', () => {
    const a = rejilla.generate({ t: 700, W: 800, H: 600 });
    expect(a.length).toBe(48);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(rejilla.generate({ t: 700, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { auto } from '../core/geom';

export const rejilla: Variant = {
  name: 'rejilla',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const { mx, my } = auto(t);
    const rows = 24, cols = 24, rotY = (mx - 0.5) * 1.1, rotX = 0.5 + (my - 0.5) * 0.6, f = 520;
    const P = (u: number, v: number) => {
      const x = (u - 0.5) * 2, z = (v - 0.5) * 2;
      const y = 0.45 * Math.sin(x * 2.4 + t * 0.0011) * Math.cos(z * 2 - t * 0.0008);
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const sc = f / (f + z2 * 260);
      return { X: W / 2 + x1 * 260 * sc, Y: H / 2 + y1 * 260 * sc };
    };
    const out: Polyline[] = [];
    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1); const pts: number[] = [];
      for (let c = 0; c < cols; c++) { const p = P(c / (cols - 1), v); pts.push(p.X, p.Y); }
      out.push({ pts, s: r / (rows - 1) });
    }
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1); const pts: number[] = [];
      for (let r = 0; r < rows; r++) { const p = P(u, r / (rows - 1)); pts.push(p.X, p.Y); }
      out.push({ pts, s: c / (cols - 1) });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: rejilla 3D variant"`

### Task 13: ~~Variant `geometrica`~~ — REMOVED

Descartada por el usuario (demasiado gráfica / poco abstracta). No implementar.

### Task 14: Variant `pliegues` (folded planes, ref img 1)

**Files:** Create `src/variants/pliegues.ts`; Test `tests/variants/pliegues.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { pliegues } from '../../src/variants/pliegues';
import { allFinite } from './helpers';

describe('pliegues', () => {
  it('produces 60 polylines (30 cols + 30 rows), finite & deterministic', () => {
    const a = pliegues.generate({ t: 400, W: 800, H: 600 });
    expect(a.length).toBe(60);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(pliegues.generate({ t: 400, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

export const pliegues: Variant = {
  name: 'pliegues',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const rotY = -0.5 + 0.15 * Math.sin(t * 0.0003), rotX = 0.55;
    const S = Math.min(W, H) * 0.34, phase = t * 0.0006, folds = 3;
    const tent = (a: number) => { const x = a - Math.floor(a); return 1 - Math.abs(x * 2 - 1); };
    const P = (u: number, v: number) => {
      const x = -1 + 2 * u, z = -1 + 2 * v, y = (tent(u * folds + phase) - 0.5) * 1.2;
      return project3d(x, y, z, rotX, rotY, S, W, H);
    };
    const rows = 30, cols = 30;
    const out: Polyline[] = [];
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1); const pts: number[] = [];
      for (let r = 0; r < rows; r++) { const p = P(u, r / (rows - 1)); pts.push(p.X, p.Y); }
      out.push({ pts, s: c / (cols - 1) });
    }
    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1); const pts: number[] = [];
      for (let c = 0; c < cols; c++) { const p = P(c / (cols - 1), v); pts.push(p.X, p.Y); }
      out.push({ pts, s: r / (rows - 1) });
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: pliegues/folded variant"`

### Task 15: ~~Variant `tech`~~ — REMOVED

Descartada por el usuario (demasiado recargada / poco abstracta). No implementar.

### Task 16: Variant `cubo` (3D lattice, ref img 3)

**Files:** Create `src/variants/cubo.ts`; Test `tests/variants/cubo.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { cubo } from '../../src/variants/cubo';
import { allFinite } from './helpers';

describe('cubo', () => {
  it('produces lattice edge segments, finite & deterministic', () => {
    const a = cubo.generate({ t: 300, W: 800, H: 600 });
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((p) => p.pts.length === 4)).toBe(true);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(cubo.generate({ t: 300, W: 800, H: 600 }));
  });
});
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implementation**

```ts
import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

export const cubo: Variant = {
  name: 'cubo',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const n = 4, S = Math.min(W, H) * 0.16, rotY = t * 0.0004, rotX = 0.5 + 0.25 * Math.sin(t * 0.0003);
    const breathe = 1 + 0.18 * Math.sin(t * 0.0009), shear = 0.25 * Math.sin(t * 0.0006);
    const g = (i: number) => -1 + (2 * i) / (n - 1);
    const grid: { X: number; Y: number; d: number }[][][] = [];
    for (let i = 0; i < n; i++) {
      grid[i] = [];
      for (let j = 0; j < n; j++) {
        grid[i][j] = [];
        for (let k = 0; k < n; k++) {
          const x = g(i) * breathe, y = g(j) * breathe + shear * g(k), z = g(k) * breathe;
          grid[i][j][k] = project3d(x, y, z, rotX, rotY, S, W, H);
        }
      }
    }
    const dcol = (p: { d: number }) => Math.max(0, Math.min(1, (p.d + 1.6) / 3.2));
    const out: Polyline[] = [];
    const edge = (a: { X: number; Y: number; d: number }, b: { X: number; Y: number; d: number }) =>
      out.push({ pts: [a.X, a.Y, b.X, b.Y], s: dcol(a) });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      const p = grid[i][j][k];
      if (i < n - 1) edge(p, grid[i + 1][j][k]);
      if (j < n - 1) edge(p, grid[i][j + 1][k]);
      if (k < n - 1) edge(p, grid[i][j][k + 1]);
    }
    return out;
  },
};
```

- [ ] **Step 4: Run → PASS**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: cubo 3D lattice variant"`

---

## Task 17: Variant registry

**Files:**
- Create: `src/variants/index.ts`
- Test: `tests/variants/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { VARIANTS } from '../../src/variants';
import { VARIANT_NAMES } from '../../src/core/types';

describe('VARIANTS registry', () => {
  it('has an entry for every name, keyed correctly', () => {
    for (const name of VARIANT_NAMES) {
      expect(VARIANTS[name]).toBeDefined();
      expect(VARIANTS[name].name).toBe(name);
    }
    expect(Object.keys(VARIANTS).length).toBe(VARIANT_NAMES.length);
  });
});
```

- [ ] **Step 2: Run → FAIL** (`npx vitest run tests/variants/index.test.ts`)

- [ ] **Step 3: Write `src/variants/index.ts`**

```ts
import type { Variant, VariantName } from '../core/types';
import { oscilacion } from './oscilacion';
import { onda } from './onda';
import { interferencia } from './interferencia';
import { malla } from './malla';
import { rejilla } from './rejilla';
import { pliegues } from './pliegues';
import { cubo } from './cubo';

export const VARIANTS: Record<VariantName, Variant> = {
  oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo,
};
```

- [ ] **Step 4: Run → PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: variant registry"`

---

## Task 18: Renderer (OGL wiring)

> Visual/WebGL output is validated in the demo gallery (Task 21), not unit-tested (jsdom has no WebGL). This task wires OGL; verify via `npm run build` type-check and a smoke render in the gallery.

**Files:**
- Create: `src/core/Renderer.ts`

- [ ] **Step 1: Write `src/core/Renderer.ts`**

```ts
import { Renderer as OGLRenderer, Program, Mesh, Geometry, Texture } from 'ogl';
import type { Polyline } from './types';
import type { ResolvedBackground } from './background';
import { buildGradientPixels } from './palette';
import { polylinesToSegments } from './lineGeometry';

const VERT = `
attribute vec2 position;
attribute float s;
varying float vS;
void main() { vS = s; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uGradient;
uniform float uAlpha;
varying float vS;
void main() {
  vec3 c = texture2D(uGradient, vec2(vS, 0.5)).rgb;
  gl_FragColor = vec4(c, uAlpha);
}
`;

export class Renderer {
  private gl: WebGLRenderingContext;
  private renderer: OGLRenderer;
  private program: Program;
  private gradient: Texture;
  private mesh: Mesh;
  private geometry: Geometry;
  private bg: ResolvedBackground = { clear: [0, 0, 0, 1], blend: 'add' };

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new OGLRenderer({ canvas, alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gradient = new Texture(this.gl, { image: buildGradientPixels(['#000', '#fff']), width: 256, height: 1, generateMipmaps: false });
    this.program = new Program(this.gl, {
      vertex: VERT, fragment: FRAG, transparent: true,
      uniforms: { uGradient: { value: this.gradient }, uAlpha: { value: 0.85 } },
    });
    this.geometry = new Geometry(this.gl, {
      position: { size: 2, data: new Float32Array() },
      s: { size: 1, data: new Float32Array() },
    });
    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program, mode: this.gl.LINES });
  }

  setPalette(palette: string[]): void {
    this.gradient.image = buildGradientPixels(palette);
    this.gradient.needsUpdate = true;
  }

  setBackground(bg: ResolvedBackground): void {
    this.bg = bg;
    this.program.uniforms.uAlpha.value = bg.blend === 'add' ? 0.85 : 1.0;
  }

  resize(): void {
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  get size(): { W: number; H: number } {
    return { W: this.canvas.clientWidth, H: this.canvas.clientHeight };
  }

  draw(polylines: Polyline[]): void {
    const { W, H } = this.size;
    const seg = polylinesToSegments(polylines, W, H);
    this.geometry = new Geometry(this.gl, {
      position: { size: 2, data: seg.position },
      s: { size: 1, data: seg.s },
    });
    this.mesh.geometry = this.geometry;

    const gl = this.gl;
    gl.clearColor(...this.bg.clear);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    if (this.bg.blend === 'add') gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.renderer.render({ scene: this.mesh });
  }

  destroy(): void {
    const ext = this.gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: OGL renderer (gradient texture + line segments + blend)"`

---

## Task 19: LineField (public class)

**Files:**
- Create: `src/core/LineField.ts`
- Test: `tests/core/LineField.test.ts` (lifecycle with an injected fake renderer)

> To keep `LineField` testable in jsdom, the rAF loop and renderer are injectable. The test uses a fake renderer and a manual clock.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { LineField } from '../../src/core/LineField';

function fakeRenderer() {
  return {
    setPalette: vi.fn(), setBackground: vi.fn(), resize: vi.fn(),
    size: { W: 800, H: 600 }, draw: vi.fn(), destroy: vi.fn(),
  };
}

describe('LineField', () => {
  it('draws the selected variant on tick and stops on destroy', () => {
    const el = document.createElement('div');
    const r = fakeRenderer();
    const lf = new LineField(el, {
      variant: 'oscilacion', palette: ['#000', '#fff'],
      background: { type: 'solid', color: '#000' },
    }, { renderer: r as any, autoStart: false });

    lf.tick(1000);
    expect(r.draw).toHaveBeenCalledTimes(1);
    const polylines = r.draw.mock.calls[0][0];
    expect(polylines.length).toBe(150); // oscilacion default N

    lf.destroy();
    expect(r.destroy).toHaveBeenCalled();
  });

  it('renders a single static frame under reduced motion', () => {
    const el = document.createElement('div');
    const r = fakeRenderer();
    const lf = new LineField(el, {
      variant: 'onda', palette: ['#000', '#fff'],
      background: { type: 'solid', color: '#000' },
    }, { renderer: r as any, autoStart: false, reducedMotion: true });

    lf.start();
    expect(r.draw).toHaveBeenCalledTimes(1); // one frame, no loop
  });
});
```

- [ ] **Step 2: Run → FAIL** (`npx vitest run tests/core/LineField.test.ts`)

- [ ] **Step 3: Write `src/core/LineField.ts`**

```ts
import type { LineFieldOptions } from './types';
import { VARIANTS } from '../variants';
import { resolveBackground } from './background';
import { prefersReducedMotion } from './reducedMotion';
import { Renderer } from './Renderer';
import { ScrollProgress } from './scroll';

interface Internals {
  renderer?: Pick<Renderer, 'setPalette' | 'setBackground' | 'resize' | 'size' | 'draw' | 'destroy'>;
  autoStart?: boolean;
  reducedMotion?: boolean;
}

export class LineField {
  private renderer: Internals['renderer'];
  private raf = 0;
  private running = false;
  private reduced: boolean;
  private scroll?: ScrollProgress;
  private scrollT = 0;

  constructor(private el: HTMLElement, private opts: LineFieldOptions, internals: Internals = {}) {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
    el.appendChild(canvas);
    this.renderer = internals.renderer ?? new Renderer(canvas);
    this.reduced = internals.reducedMotion ?? prefersReducedMotion();
    this.applyOptions();
    if (internals.autoStart ?? true) this.start();
  }

  private applyOptions(): void {
    this.renderer!.setPalette(this.opts.palette);
    this.renderer!.setBackground(resolveBackground(this.opts.background));
    this.renderer!.resize();
  }

  setOptions(partial: Partial<LineFieldOptions>): void {
    this.opts = { ...this.opts, ...partial };
    this.applyOptions();
  }

  /** Render one frame at time t (ms). */
  tick(t: number): void {
    const variant = VARIANTS[this.opts.variant];
    const { W, H } = this.renderer!.size;
    const time = this.opts.mode === 'scroll' ? this.scrollT * 10000 : t * (this.opts.speed ?? 0.6); // 0.6 = modo suave por defecto
    this.renderer!.draw(variant.generate({ t: time, W, H, lineCount: this.opts.lineCount }));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    if (this.reduced) { this.tick(0); this.running = false; return; }
    if (this.opts.mode === 'scroll') {
      this.scroll = new ScrollProgress(this.el, (t) => { this.scrollT = t; this.tick(0); });
      this.scroll.start();
      return;
    }
    const loop = (t: number) => { if (!this.running) return; this.tick(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.scroll?.stop();
  }

  destroy(): void {
    this.stop();
    this.renderer!.destroy();
  }
}
```

- [ ] **Step 4: Run → PASS** (`npx vitest run tests/core/LineField.test.ts`)

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: LineField public class (auto/scroll/reduced-motion)"`

---

## Task 20: Public exports

**Files:**
- Modify: `src/index.ts`
- Test: `tests/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { LineField, VARIANTS, VARIANT_NAMES } from '../src/index';

describe('public API', () => {
  it('exports LineField, VARIANTS, VARIANT_NAMES', () => {
    expect(typeof LineField).toBe('function');
    expect(Object.keys(VARIANTS).length).toBe(7);
    expect(VARIANT_NAMES.length).toBe(7);
  });
});
```

- [ ] **Step 2: Run → FAIL** (`npx vitest run tests/index.test.ts`)

- [ ] **Step 3: Write `src/index.ts`**

```ts
export { LineField } from './core/LineField';
export { VARIANTS } from './variants';
export { VARIANT_NAMES } from './core/types';
export type { LineFieldOptions, Background, VariantName, Variant, Polyline } from './core/types';
```

- [ ] **Step 4: Run → PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: public API exports"`

---

## Task 21: Demo gallery

**Files:**
- Create: `demo/index.html`, `demo/main.ts`

- [ ] **Step 1: Create `demo/index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>xebia-animation-line · galería</title>
<style>
  *{box-sizing:border-box;margin:0;} html,body{height:100%;font-family:sans-serif;}
  #stage{position:fixed;inset:0;} #stage canvas{width:100%;height:100%;}
  .ui{position:fixed;z-index:10;display:flex;gap:6px;flex-wrap:wrap;}
  .variants{bottom:16px;left:50%;transform:translateX(-50%);max-width:94vw;justify-content:center;}
  .palettes{top:16px;right:16px;} .backgrounds{top:54px;right:16px;}
  button,.dot{cursor:pointer;}
  .ui button{border:1px solid #8888;background:#7f7f7f22;color:#cde;padding:7px 12px;border-radius:99px;font-size:12px;}
  .ui button.active{background:#fff;color:#0a1a24;font-weight:600;}
  .dot{width:20px;height:20px;border-radius:50%;border:2px solid #8888;}
</style></head>
<body>
  <div id="stage"></div>
  <div class="ui palettes" id="palettes"></div>
  <div class="ui backgrounds" id="backgrounds"></div>
  <div class="ui variants" id="variants"></div>
  <script type="module" src="./main.ts"></script>
</body></html>
```

- [ ] **Step 2: Create `demo/main.ts`**

```ts
import { LineField, VARIANT_NAMES } from '../src/index';
import type { LineFieldOptions, Background } from '../src/index';

const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'],
  ['#ff9bc4', '#b18cff', '#5ad1ff'],
  ['#ffd27a', '#ff8f6b', '#c96bff'],
];
const BACKGROUNDS: Background[] = [
  { type: 'gradient', from: '#06101a', to: '#0a1b2b' },
  { type: 'solid', color: '#000000' },
  { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' },
  { type: 'solid', color: '#eef2f7' },
];

const opts: LineFieldOptions = {
  variant: 'oscilacion', palette: PALETTES[0], background: BACKGROUNDS[0], mode: 'auto',
};
const stage = document.getElementById('stage')!;
let field = new LineField(stage, opts);

function rebuild() { field.destroy(); stage.innerHTML = ''; field = new LineField(stage, opts); }

const vEl = document.getElementById('variants')!;
VARIANT_NAMES.forEach((name) => {
  const b = document.createElement('button');
  b.textContent = name; if (name === opts.variant) b.classList.add('active');
  b.onclick = () => { opts.variant = name; [...vEl.children].forEach((c) => c.classList.remove('active')); b.classList.add('active'); field.setOptions({ variant: name }); };
  vEl.appendChild(b);
});
const pEl = document.getElementById('palettes')!;
PALETTES.forEach((p, i) => {
  const d = document.createElement('div'); d.className = 'dot';
  d.style.background = `linear-gradient(135deg, ${p.join(',')})`;
  d.onclick = () => { opts.palette = p; field.setOptions({ palette: p }); };
  pEl.appendChild(d);
});
const bEl = document.getElementById('backgrounds')!;
BACKGROUNDS.forEach((bg, i) => {
  const d = document.createElement('div'); d.className = 'dot';
  d.style.background = bg.type === 'gradient' ? `linear-gradient(135deg, ${bg.from}, ${bg.to})` : bg.type === 'solid' ? bg.color : '#fff';
  d.onclick = () => { opts.background = bg; rebuild(); };
  bEl.appendChild(d);
});

addEventListener('resize', () => field.setOptions({}));
```

- [ ] **Step 3: Run the gallery and visually verify each variant**

Run: `npm run dev`
Open the printed localhost URL. Confirm: all 9 variants animate autonomously (no mouse reaction), palette and background selectors work, light background switches to non-additive blend. Compare `oscilacion`/`malla`/`cubo`/`pliegues` against the reference images.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: demo gallery (variant/palette/background selectors)"`

---

## Task 22: React wrapper (optional)

**Files:**
- Create: `src/react/LineField.tsx`
- Modify: `src/index.ts` — add `export { LineFieldReact } from './react/LineField';`

- [ ] **Step 1: Install React peer deps as dev**

Run: `npm install -D react react-dom @types/react @types/react-dom`

- [ ] **Step 2: Write `src/react/LineField.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { LineField } from '../core/LineField';
import type { LineFieldOptions } from '../core/types';

export function LineFieldReact(props: LineFieldOptions & { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const { className, style, ...opts } = props;
  useEffect(() => {
    if (!ref.current) return;
    const field = new LineField(ref.current, opts);
    return () => field.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.variant, opts.mode]);
  return <div ref={ref} className={className} style={style} />;
}
```

- [ ] **Step 3: Add the export to `src/index.ts`**

```ts
export { LineFieldReact } from './react/LineField';
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; `dist/xebia-animation-line.js` and `.d.ts` produced.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: optional React wrapper + library build"`

---

## Task 23: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: all tests pass (types, geom, palette, background, reducedMotion, scroll, lineGeometry, 9 variants, registry, LineField, index).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean ES module + type declarations in `dist/`.

- [ ] **Step 3: Final visual pass in the gallery** (`npm run dev`) — confirm the 4 reference looks (oscilacion, malla, cubo, pliegues) and that nothing reacts to the mouse.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "test: full suite + build green"
```

---

## Notes for the implementer

- **No pointer interaction** anywhere — variants are pure functions of `t`/`W`/`H`. This is a hard project rule.
- **Determinism**: variants must not call `Math.random()` or `Date.now()`. `cubo` uses seeded/lattice constants. Tests assert `generate(env)` is repeatable.
- **Smooth mode**: a reduced default `speed` (≈0.6) gives the slow, fluid, abstract feel of the reference images. Variants keep their internal time constants; only the global multiplier changes.
- **Glow/bloom** is deliberately out of scope for v1 — lines + gradient only. Add later as a renderer post-pass.
- If a variant looks off versus its reference image, tune only the constants inside its `generate()` — the interface and tests stay stable.
