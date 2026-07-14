import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

const RINGS = 8; // anillos concéntricos por nodo

/** Panal: el laberinto hexagonal — anillos concéntricos finísimos alrededor de cada nodo, con
 *  una Y en el centro. Al ser tantos y tan finos, el campo se lee como curvas de nivel. Los
 *  anillos laten hacia fuera con retardo, así que la onda parece emitirse desde cada nodo. */
export const panal: Variant = {
  name: 'panal',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 3.2);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.05, rotAmp: 0, freq: 0.9 });
      const flip = (tile.i + tile.j) & 1 ? Math.PI / 3 : 0; // nodos alternos, Y invertida

      for (let k = 0; k < RINGS; k++) {
        // cada anillo late detrás del anterior: la onda sale del nodo hacia fuera
        const pulse = 1 + 0.05 * Math.sin(k * 0.8 - t * 0.0018 + (tile.i + tile.j) * 0.4);
        // el anillo mayor llega justo a la media distancia entre nodos (0.5·cell en la rejilla
        // triangular): los panales se tocan y el laberinto cierra, dejando solo los triángulos
        // intersticiales, igual que en la referencia
        const r = cell * (0.05 + k * 0.064) * b.scale * pulse;
        const pts: number[] = [];
        for (let v = 0; v <= 6; v++) {
          const a = (v / 6) * Math.PI * 2 + flip;
          pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        out.push({ pts, s: b.s, a: 0.9, w: 0.8 }); // trazo finísimo: la trama es de líneas, no de barras
      }

      // Y central: tres brazos algo más marcados, el corazón del laberinto
      const arm = cell * 0.2 * b.scale;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.PI / 2 + flip;
        out.push({
          pts: [cx, cy, cx + Math.cos(a) * arm, cy + Math.sin(a) * arm],
          s: Math.min(1, b.s + 0.25),
          w: 1.6,
        });
      }
    }
    return out;
  },
};
