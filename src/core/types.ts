export const VARIANT_NAMES = [
  'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
  'pliegues', 'cubo', 'flujo', 'entrelazado', 'espiral',
  'tubo', 'cono', 'cinta', 'helice', 'embudo', 'duna',
  'quilla', 'helicoide', 'voluta', 'celosia',
  'aurora', 'moire', 'mobius', 'tunel', 'terreno', 'orbitas', 'pulso',
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
  speed?: number;               // default 0.35 (modo suave/lento); animación autónoma, sin scroll
  lineCount?: number;           // optional density override
  zoom?: number;                // default 1; >1 = close-up (amplía y recorta bordes)
  pan?: { x: number; y: number }; // desplaza la zona visible (clip space), default {0,0}
  thickness?: number;             // grosor de línea en px, default 1.7
}

/** Pixel-space polyline: pts = [x0,y0, x1,y1, ...] in [0,W]×[0,H], y-down.
 *  a: alfa opcional 0–1 (fade de profundidad en variantes 3D), default 1. */
export interface Polyline { pts: number[]; s: number; a?: number; }

export interface VariantEnv { t: number; W: number; H: number; lineCount?: number; }

export interface Variant {
  name: VariantName;
  generate(env: VariantEnv): Polyline[];
}
