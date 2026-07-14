import { describe, it, expect } from 'vitest';
import { squareTiles, hexTiles, breathe } from '../../src/core/tiling';

describe('squareTiles', () => {
  it('cubre el lienzo con una celda de sangrado por lado', () => {
    const tiles = squareTiles(800, 600, 200);
    expect(tiles.length).toBe((Math.ceil(800 / 200) + 2) * (Math.ceil(600 / 200) + 2));
    expect(tiles.some((t) => t.cx < 0 && t.cy < 0)).toBe(true);      // sangra por arriba-izquierda
    expect(tiles.some((t) => t.cx > 800 && t.cy > 600)).toBe(true);  // y por abajo-derecha
  });
});

describe('hexTiles', () => {
  it('desplaza media celda las filas impares (nodos equidistantes)', () => {
    const tiles = hexTiles(800, 600, 200);
    const row0 = tiles.filter((t) => t.j === 0);
    const row1 = tiles.filter((t) => t.j === 1);
    expect(row1[0].cx - row0[0].cx).toBeCloseTo(100);
    expect(row1[0].cy - row0[0].cy).toBeCloseTo(200 * 0.866);
  });
});

describe('breathe', () => {
  it('es determinista y acotada', () => {
    const b = breathe(400, 300, 1200, 800, 600);
    expect(b).toEqual(breathe(400, 300, 1200, 800, 600));
    expect(b.s).toBeGreaterThanOrEqual(0);
    expect(b.s).toBeLessThanOrEqual(1);
    expect(Math.abs(b.w)).toBeLessThanOrEqual(1);
    expect(b.scale).toBeGreaterThan(0);
  });

  it('la onda avanza con el tiempo y varía por el lienzo', () => {
    expect(breathe(400, 300, 0, 800, 600).w).not.toBeCloseTo(breathe(400, 300, 2000, 800, 600).w);
    expect(breathe(100, 100, 0, 800, 600).w).not.toBeCloseTo(breathe(700, 500, 0, 800, 600).w);
  });
});
