import type { Background } from './types';

export interface ResolvedBackground {
  draw: boolean;                       // pintar el quad de fondo (false = transparente)
  from: [number, number, number];
  to: [number, number, number];
  angle: number;                       // radianes
  blend: 'add' | 'normal' | 'multiply';// mezcla de las líneas
  clearAlpha: number;                  // alpha del clear (0 transparente, 1 opaco)
}

function hexToUnit(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function lum(rgb: [number, number, number]): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function resolveBackground(bg: Background): ResolvedBackground {
  if (bg.type === 'transparent') {
    // 'normal' (no aditivo) + alpha 1.0 → las líneas se pintan sólidas sobre la imagen,
    // sin ese efecto translúcido/lavado que daba el blend aditivo.
    return { draw: false, from: [0, 0, 0], to: [0, 0, 0], angle: 0, blend: 'normal', clearAlpha: 0 };
  }
  const from = bg.type === 'gradient' ? hexToUnit(bg.from) : hexToUnit(bg.color);
  const to = bg.type === 'gradient' ? hexToUnit(bg.to) : from;
  const angle = ((bg.type === 'gradient' ? bg.angle ?? 45 : 45) * Math.PI) / 180;
  // Claro → "multiply" (líneas oscurecen el fondo). Oscuro → "normal" (sin acumulación
  // aditiva, así no se queman los cruces formando manchas de luz).
  const blend = (lum(from) + lum(to)) / 2 > 0.55 ? 'multiply' : 'normal';
  return { draw: true, from, to, angle, blend, clearAlpha: 1 };
}
