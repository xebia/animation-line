import { describe, it, expect } from 'vitest';
import { squareTiles, hexTiles, breathe, openSides } from '../../src/core/tiling';

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

describe('openSides', () => {
  it('devuelve un lado por vértice, acortado por los dos extremos: la figura no cierra', () => {
    const sq = [0, 0, 100, 0, 100, 100, 0, 100]; // cuadrado de lado 100
    const sides = openSides(sq, 10);
    expect(sides.length).toBe(4);
    expect(sides[0]).toEqual([10, 0, 90, 0]); // el lado superior arranca y acaba despegado
    // ningún extremo coincide con un vértice del cuadrado → las esquinas quedan abiertas
    const corners = [[0, 0], [100, 0], [100, 100], [0, 100]];
    for (const s of sides) {
      for (const [x, y] of [[s[0], s[1]], [s[2], s[3]]]) {
        expect(corners.some((c) => c[0] === x && c[1] === y)).toBe(false);
      }
    }
  });

  it('nunca se come el lado entero, por grande que sea el hueco', () => {
    const [side] = openSides([0, 0, 10, 0, 10, 10, 0, 10], 999);
    expect(side[2] - side[0]).toBeGreaterThan(0); // sigue quedando trazo
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
