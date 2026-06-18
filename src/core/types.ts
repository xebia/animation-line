export const VARIANT_NAMES = [
  'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
  'pliegues', 'cubo', 'flujo', 'entrelazado', 'espiral',
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
