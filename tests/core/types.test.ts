import { describe, it, expect } from 'vitest';
import type { LineFieldOptions, Polyline, VariantEnv } from '../../src/core/types';
import { VARIANT_NAMES } from '../../src/core/types';

describe('types', () => {
  it('exposes the 80 variant names: 31 de líneas + 49 tramas', () => {
    expect(VARIANT_NAMES).toEqual([
      'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
      'pliegues', 'cubo', 'flujo', 'entrelazado', 'espiral',
      'tubo', 'cono', 'cinta', 'helice', 'embudo', 'duna',
      'quilla', 'helicoide', 'voluta', 'celosia',
      'aurora', 'moire', 'tunel', 'terreno', 'orbitas', 'pulso',
      'giroscopio', 'toroide', 'cristal', 'frunce', 'dipolo',
      'tramado', 'mallax', 'teselas', 'cruces', 'extrusion',
      'bloques', 'torres', 'barras', 'escaleras', 'pozos',
      'placas', 'rayado', 'nidos', 'prismas', 'capas', 'circuito',
      'celdilla', 'nodos',
      'damero', 'subdivision',
      'pixeles', 'terrazas', 'voxel',
      'cintas', 'rejas',
      'laberinto', 'espiga', 'trenzado', 'mosaico', 'cruceta',
      'guiones', 'escalonado', 'diamante',
      'aspas', 'cuadrados', 'hexagonos', 'triangulos', 'ganchos',
      'flechas', 'puntadas', 'listones', 'semis', 'tejido',
      'mimbre', 'triaxial', 'enrejado', 'redondeada', 'hexmalla', 'sarga',
    ]);
  });

  it('shapes compile', () => {
    const env: VariantEnv = { t: 0, W: 800, H: 600 };
    const pl: Polyline = { pts: [0, 0, 1, 1], s: 0.5 };
    const opts: LineFieldOptions = {
      variant: 'oscilacion',
      palette: ['#000000', '#ffffff'],
      background: { type: 'solid', color: '#000000' },
    };
    expect(env.W + pl.s + opts.palette.length).toBeGreaterThan(0);
  });
});
