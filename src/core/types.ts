/** Campos de líneas: la forma nace de un haz de líneas que recorre el lienzo. */
export const LINE_NAMES = [
  'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
  'pliegues', 'cubo', 'flujo', 'entrelazado', 'espiral',
  'tubo', 'cono', 'cinta', 'helice', 'embudo', 'duna',
  'quilla', 'helicoide', 'voluta', 'celosia',
  'aurora', 'moire', 'tunel', 'terreno', 'orbitas', 'pulso',
  'giroscopio', 'toroide', 'cristal', 'frunce', 'dipolo',
] as const;

/** Tramas: una forma se repite en una rejilla que cubre el lienzo y respira. */
export const PATTERN_NAMES = [
  'tramado', 'mallax', 'teselas', 'extrusion',
  // familia 3D: cámara axonométrica compartida (core/iso.ts), cubos de aristas abiertas
  'bloques', 'torres', 'barras', 'escaleras', 'pozos',
  'placas', 'rayado', 'nidos', 'prismas', 'capas', 'circuito',
  // familia de malla: tejido continuo de barras finas con el nudo abierto
  'celdilla', 'nodos',
  // teselados estrictos: ángulos exactos, giros a saltos de 45°/90°
  'damero', 'subdivision',
  'pixeles', 'terrazas', 'voxel',
  'cintas', 'rejas',
] as const;

export const VARIANT_NAMES = [...LINE_NAMES, ...PATTERN_NAMES] as const;

export type LineName = (typeof LINE_NAMES)[number];
export type PatternName = (typeof PATTERN_NAMES)[number];
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
 *  a: alfa opcional 0–1 (fade de profundidad en variantes 3D), default 1.
 *  w: grosor opcional en px de este trazo; sin él, el thickness de la instancia. */
export interface Polyline { pts: number[]; s: number; a?: number; w?: number; }

export interface VariantEnv { t: number; W: number; H: number; lineCount?: number; }

export interface Variant {
  name: VariantName;
  generate(env: VariantEnv): Polyline[];
}
