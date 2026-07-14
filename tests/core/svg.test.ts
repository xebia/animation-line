import { describe, it, expect } from 'vitest';
import { polylinesToSvg } from '../../src/core/svg';
import { VARIANTS } from '../../src/variants';

const PAL = ['#ff0000', '#0000ff'];

describe('polylinesToSvg', () => {
  it('pinta un path por polilínea, con su color, grosor y alfa', () => {
    const svg = polylinesToSvg(
      [{ pts: [0, 0, 100, 50], s: 0, w: 3 }, { pts: [0, 100, 100, 100], s: 1, a: 0.5 }],
      { W: 200, H: 150, palette: PAL, background: { type: 'solid', color: '#000000' }, thickness: 1.5 },
    );
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.match(/<path /g)!.length).toBe(2);
    expect(svg).toContain('d="M0 0L100 50"');
    expect(svg).toContain('stroke="rgb(255,0,0)"');   // s=0 → primer color de la paleta
    expect(svg).toContain('stroke="rgb(0,0,255)"');   // s=1 → último
    expect(svg).toContain('stroke-width="3"');        // el w de la polilínea
    expect(svg).toContain('stroke-width="1.5"');      // sin w → el thickness de la instancia
    expect(svg).toContain('stroke-opacity="0.5"');
    expect(svg).toContain('<rect width="200" height="150" fill="#000000"/>');
  });

  it('traduce el fondo de gradiente a un linearGradient', () => {
    const svg = polylinesToSvg([{ pts: [0, 0, 10, 10], s: 0.5 }], {
      W: 100, H: 100, palette: PAL,
      background: { type: 'gradient', from: '#111111', to: '#222222', angle: 90 },
    });
    expect(svg).toContain('<linearGradient id="bg"');
    expect(svg).toContain('stop-color="#111111"');
    expect(svg).toContain('fill="url(#bg)"');
  });

  it('el fondo transparente no pinta rectángulo', () => {
    const svg = polylinesToSvg([{ pts: [0, 0, 10, 10], s: 0 }], {
      W: 100, H: 100, palette: PAL, background: { type: 'transparent' },
    });
    expect(svg).not.toContain('<rect');
  });

  it('exporta una variante real con geometría dentro', () => {
    const svg = polylinesToSvg(VARIANTS.teselas.generate({ t: 500, W: 800, H: 600 }), {
      W: 800, H: 600, palette: PAL, background: { type: 'solid', color: '#0b1f3a' },
    });
    expect(svg.match(/<path /g)!.length).toBeGreaterThan(20);
    expect(svg).toContain('</svg>');
    expect(svg).not.toContain('NaN');
  });
});
