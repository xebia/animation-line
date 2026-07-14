import type { Polyline } from './types';

export interface SegmentOpts {
  zoom?: number;
  pan?: { x: number; y: number };
  thickness?: number; // grosor de línea en px (default de la instancia)
}

export interface SegmentBuffers {
  position: Float32Array; // clip space, 2 por vértice
  s: Float32Array;        // coordenada de gradiente, 1 por vértice
  edge: Float32Array;     // -1..1 a lo ancho de la línea (feather en shader)
  a: Float32Array;        // alfa por polilínea (fade de profundidad)
  hw: Float32Array;       // media-anchura en px por polilínea (feather en shader)
}

/** Media-anchura real de la línea en px: grosor/2 + margen de feather. */
export function halfWidthPx(thickness: number): number {
  return thickness / 2 + 0.75;
}

// Umbral para saltar la unión cuando dos segmentos son casi colineales
// (el hueco es sub-píxel y el abanico solo añadiría vértices).
const COLLINEAR = 0.99;

/**
 * Expande polilíneas (en px) a triángulos en clip space, con grosor real.
 * zoom/pan se aplican aquí (CPU) para que el grosor sea constante en px.
 * Cada polilínea puede llevar su propio grosor (`w`); sin él usa el de la
 * instancia, así que una misma variante mezcla trazos finos y gruesos.
 * Cada segmento → quad (2 triángulos, 6 vértices) con atributo edge ±1;
 * en cada vértice interior con giro apreciable se añade un abanico (round
 * join) en el lado exterior del giro, y en los extremos un remate
 * semicircular (round cap). Los abanicos usan edge=0 en el centro y 1 en
 * el borde, así el feather del shader los funde con los quads.
 */
export function polylinesToSegments(
  polylines: Polyline[], W: number, H: number, opts: SegmentOpts = {},
): SegmentBuffers {
  const zoom = opts.zoom ?? 1;
  const panX = opts.pan?.x ?? 0;
  const panY = opts.pan?.y ?? 0;
  const defaultHw = halfWidthPx(opts.thickness ?? 1.5);
  const toClipX = (px: number) => ((px / W) * 2 - 1) * zoom + panX;
  const toClipY = (py: number) => (1 - (py / H) * 2) * zoom + panY;
  const pos: number[] = [];
  const ss: number[] = [];
  const ee: number[] = [];
  const aa: number[] = [];
  const hh: number[] = [];

  for (const pl of polylines) {
    const alpha = pl.a ?? 1;
    const hw = pl.w === undefined ? defaultHw : halfWidthPx(pl.w); // media-anchura de esta polilínea
    const p = pl.pts;
    const n = p.length / 2;
    if (n < 2) continue;
    const meta = (count: number) => {
      for (let k = 0; k < count; k++) { ss.push(pl.s); aa.push(alpha); hh.push(hw); }
    };

    // Abanico alrededor de (cx,cy) entre los ángulos a1→a2 por el camino corto (px space)
    const fan = (cx: number, cy: number, a1: number, a2: number) => {
      let d = a2 - a1;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI + 1e-6) d += 2 * Math.PI;
      const steps = Math.max(1, Math.ceil(Math.abs(d) / 0.7));
      const CX = toClipX(cx), CY = toClipY(cy);
      for (let k = 0; k < steps; k++) {
        const b1 = a1 + (d * k) / steps, b2 = a1 + (d * (k + 1)) / steps;
        pos.push(
          CX, CY,
          toClipX(cx + Math.cos(b1) * hw), toClipY(cy + Math.sin(b1) * hw),
          toClipX(cx + Math.cos(b2) * hw), toClipY(cy + Math.sin(b2) * hw),
        );
        ee.push(0, 1, 1);
        meta(3);
      }
    };
    // Ángulo de s·normal para una dirección (dx,dy); normal = (-dy, dx)
    const nAngle = (dx: number, dy: number, s: number) => Math.atan2(s * dx, -s * dy);

    let pdx = 0, pdy = 0; // dirección del segmento anterior (unitaria, px space)
    for (let i = 0; i < n - 1; i++) {
      const ax = p[i * 2], ay = p[i * 2 + 1];
      const bx = p[(i + 1) * 2], by = p[(i + 1) * 2 + 1];
      let dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const nx = -dy * hw, ny = dx * hw; // normal escalada, px space
      const a1x = toClipX(ax + nx), a1y = toClipY(ay + ny);
      const a2x = toClipX(ax - nx), a2y = toClipY(ay - ny);
      const b1x = toClipX(bx + nx), b1y = toClipY(by + ny);
      const b2x = toClipX(bx - nx), b2y = toClipY(by - ny);
      pos.push(a1x, a1y, a2x, a2y, b1x, b1y, a2x, a2y, b2x, b2y, b1x, b1y);
      ee.push(1, -1, 1, -1, -1, 1);
      meta(6);

      if (i > 0 && pdx * dx + pdy * dy < COLLINEAR) {
        // Unión redondeada en el lado exterior del giro
        const side = pdx * dy - pdy * dx > 0 ? -1 : 1;
        fan(ax, ay, nAngle(pdx, pdy, side), nAngle(dx, dy, side));
      }
      pdx = dx; pdy = dy;
    }

    // Caps semicirculares: medio disco mirando hacia fuera en cada extremo
    {
      let dx = p[2] - p[0], dy = p[3] - p[1];
      let l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      fan(p[0], p[1], nAngle(dx, dy, 1), nAngle(dx, dy, 1) + Math.PI);
      const m = n - 1;
      let ex = p[m * 2] - p[(m - 1) * 2], ey = p[m * 2 + 1] - p[(m - 1) * 2 + 1];
      l = Math.hypot(ex, ey) || 1; ex /= l; ey /= l;
      fan(p[m * 2], p[m * 2 + 1], nAngle(ex, ey, -1), nAngle(ex, ey, -1) + Math.PI);
    }
  }
  return {
    position: new Float32Array(pos),
    s: new Float32Array(ss),
    edge: new Float32Array(ee),
    a: new Float32Array(aa),
    hw: new Float32Array(hh),
  };
}
