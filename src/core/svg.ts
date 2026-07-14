import type { Polyline, Background } from './types';
import { colorAt } from './palette';
import { resolveBackground } from './background';

export interface SvgOpts {
  W: number;
  H: number;
  palette: string[];
  background: Background;
  thickness?: number;             // grosor por defecto, si la polilínea no trae el suyo
  zoom?: number;
  pan?: { x: number; y: number };
}

function rgb(palette: string[], s: number): string {
  const [r, g, b] = colorAt(palette, s);
  return `rgb(${r},${g},${b})`;
}

function num(v: number): string {
  return (Math.round(v * 100) / 100).toString(); // dos decimales: el SVG no engorda de balde
}

/** Congela un fotograma de una variante en un SVG vectorial y estático.
 *  Cada polilínea es un <path> con su color del gradiente, su grosor y su alfa; el zoom y el
 *  pan se resuelven con la misma transformación que aplica el renderer, pero en un <g>. */
export function polylinesToSvg(polylines: Polyline[], o: SvgOpts): string {
  const { W, H, palette, background } = o;
  const zoom = o.zoom ?? 1;
  const panX = o.pan?.x ?? 0;
  const panY = o.pan?.y ?? 0;
  // px → clip → px otra vez: sale una afín simple, así que basta un transform en el grupo
  const tx = (W * (1 - zoom + panX)) / 2;
  const ty = (H * (1 - zoom - panY)) / 2;

  const defs: string[] = [];
  let bg = '';
  if (background.type === 'gradient') {
    const a = ((background.angle ?? 45) * Math.PI) / 180;
    const dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
    defs.push(
      `<linearGradient id="bg" x1="${num(0.5 - dx)}" y1="${num(0.5 + dy)}" ` +
      `x2="${num(0.5 + dx)}" y2="${num(0.5 - dy)}">` +
      `<stop offset="0" stop-color="${background.from}"/>` +
      `<stop offset="1" stop-color="${background.to}"/></linearGradient>`,
    );
    bg = `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  } else if (background.type === 'solid') {
    bg = `<rect width="${W}" height="${H}" fill="${background.color}"/>`;
  }

  const paths = polylines.map((pl) => {
    const p = pl.pts;
    if (p.length < 4) return '';
    let d = `M${num(p[0])} ${num(p[1])}`;
    for (let i = 2; i < p.length; i += 2) d += `L${num(p[i])} ${num(p[i + 1])}`;
    const w = pl.w ?? o.thickness ?? 1.5;
    const a = pl.a ?? 1;
    const alpha = a < 1 ? ` stroke-opacity="${num(a)}"` : '';
    return `<path d="${d}" stroke="${rgb(palette, pl.s)}" stroke-width="${num(w)}"${alpha}/>`;
  }).filter(Boolean).join('');

  // sobre fondo claro el renderer multiplica (las líneas oscurecen el fondo); se replica aquí
  // para que el SVG no salga lavado respecto a lo que se ve en pantalla
  const blend = resolveBackground(background).blend === 'multiply'
    ? ' style="mix-blend-mode:multiply"' : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    defs.length ? `<defs>${defs.join('')}</defs>` : '',
    bg,
    `<g transform="translate(${num(tx)} ${num(ty)}) scale(${num(zoom)})" fill="none"${blend} `,
    `stroke-linecap="round" stroke-linejoin="round">${paths}</g>`,
    '</svg>',
  ].join('');
}
