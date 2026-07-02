import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Moiré: dos familias de líneas paralelas casi alineadas que rotan muy
 *  despacio en sentidos opuestos — la interferencia crea bandas que viajan
 *  y respiran. Líneas rectas largas, muy barato de generar. */
export const moire: Variant = {
  name: 'moire',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const perFamily = Math.round((lineCount ?? 72) / 2);
    const cx = W / 2, cy = H / 2;
    const L = Math.hypot(W, H) * 0.75; // media-longitud: cubre el canvas rotado
    const base = 0.5 + t * 0.00003;    // deriva lentísima del conjunto
    const delta = 0.045 + 0.03 * Math.sin(t * 0.00025); // desalineación entre familias
    const breathe = 1 + 0.12 * Math.sin(t * 0.0004);    // el espaciado respira
    const out: Polyline[] = [];
    for (let f = 0; f < 2; f++) {
      const ang = base + (f === 0 ? -delta : delta) / 2;
      const dx = Math.cos(ang), dy = Math.sin(ang);   // dirección de la línea
      const nx = -dy, ny = dx;                        // normal (separación)
      const gap = (Math.min(W, H) / perFamily) * 1.35 * (f === 0 ? breathe : 1);
      for (let i = 0; i < perFamily; i++) {
        const off = (i - (perFamily - 1) / 2) * gap;
        const px = cx + nx * off, py = cy + ny * off;
        out.push({
          pts: [px - dx * L, py - dy * L, px + dx * L, py + dy * L],
          s: i / (perFamily - 1),
          a: f === 0 ? 1 : 0.75,
        });
      }
    }
    return out;
  },
};
