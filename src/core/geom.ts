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
