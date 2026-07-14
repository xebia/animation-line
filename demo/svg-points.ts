// Exportar a SVG las animaciones de puntos, que pintan directamente en Canvas 2D.
// En vez de reescribirlas, se les pasa un contexto falso que anota lo que dibujan
// (círculos y algún trazo) y luego se vuelca a SVG. Así el SVG sale de la misma
// animación que se ve en pantalla, sin duplicar la geometría en ningún sitio.
import type { Col, PBg } from './points';

interface Shape { kind: 'circle' | 'path'; d: string; color: string; alpha: number; width?: number }

function esc(v: number): string {
  return (Math.round(v * 100) / 100).toString();
}

class Recorder {
  shapes: Shape[] = [];
  fillStyle = '#fff';
  strokeStyle = '#fff';
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  lineWidth = 1;
  private path: string[] = [];
  private circle: { x: number; y: number; r: number } | null = null;

  beginPath(): void { this.path = []; this.circle = null; }
  moveTo(x: number, y: number): void { this.path.push(`M${esc(x)} ${esc(y)}`); }
  lineTo(x: number, y: number): void { this.path.push(`L${esc(x)} ${esc(y)}`); }
  arc(x: number, y: number, r: number): void { this.circle = { x, y, r }; }

  fill(): void {
    if (this.circle) {
      const { x, y, r } = this.circle;
      this.shapes.push({
        kind: 'circle',
        d: `cx="${esc(x)}" cy="${esc(y)}" r="${esc(Math.max(r, 0.1))}"`,
        color: this.fillStyle,
        alpha: this.globalAlpha,
      });
    } else if (this.path.length) {
      this.shapes.push({ kind: 'path', d: this.path.join(''), color: this.fillStyle, alpha: this.globalAlpha });
    }
  }

  stroke(): void {
    if (!this.path.length) return;
    this.shapes.push({
      kind: 'path', d: this.path.join(''), color: this.strokeStyle,
      alpha: this.globalAlpha, width: this.lineWidth,
    });
  }

  // El fondo lo pinta el SVG aparte; aquí no hacen falta.
  fillRect(): void { /* noop */ }
  createLinearGradient(): { addColorStop(): void } { return { addColorStop() { /* noop */ } }; }
  drawImage(): void { /* noop */ }
  save(): void { /* noop */ }
  restore(): void { /* noop */ }
  setTransform(): void { /* noop */ }
  closePath(): void { /* noop */ }
}

type PointFn = (ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) => void;

export function pointsToSvg(
  fn: PointFn, W: number, H: number, t: number, col: Col, bg: PBg,
): string {
  const rec = new Recorder();
  fn(rec as unknown as CanvasRenderingContext2D, W, H, t, col);

  const bgFill = bg.solid
    ? `<rect width="${W}" height="${H}" fill="${bg.solid}"/>`
    : `<defs><linearGradient id="bg" x1="0" y1="1" x2="1" y2="0">` +
      `<stop offset="0" stop-color="${bg.from}"/><stop offset="1" stop-color="${bg.to}"/>` +
      `</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/>`;

  // en canvas los puntos se suman sobre fondo oscuro (globalCompositeOperation 'lighter');
  // sin eso, en el SVG se ven apagados. 'screen' es el equivalente en CSS.
  const blend = bg.light ? '' : ' style="mix-blend-mode:screen"';

  const body = rec.shapes.map((s) => {
    const op = s.alpha < 1 ? ` opacity="${esc(s.alpha)}"` : '';
    if (s.kind === 'circle') return `<circle ${s.d} fill="${s.color}"${op}/>`;
    return s.width === undefined
      ? `<path d="${s.d}" fill="${s.color}"${op}/>`
      : `<path d="${s.d}" fill="none" stroke="${s.color}" stroke-width="${esc(s.width)}"${op}/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `${bgFill}<g${blend}>${body}</g></svg>`;
}
