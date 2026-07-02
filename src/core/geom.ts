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

/** Factor irregular determinista (~[1-amp, 1+amp]) para romper la simetría geométrica. */
export function irr(a: number, amp = 0.18): number {
  return 1 + amp * (
    Math.sin(a * 2.3 + 1.0) * 0.5 +
    Math.sin(a * 3.7 + 2.1) * 0.3 +
    Math.sin(a * 5.1 + 4.0) * 0.2
  );
}

/** Alfa de profundidad: d (media de project3d().d de la línea) → fade.
 *  Frente (d=-range) opaco, fondo (d=+range) tenue. */
export function depthAlpha(d: number, range = 1): number {
  const tt = Math.max(0, Math.min(1, (range - d) / (2 * range)));
  return 0.35 + 0.65 * tt;
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
