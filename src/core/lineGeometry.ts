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
