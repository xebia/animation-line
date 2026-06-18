import type { LineFieldOptions } from './types';
import { VARIANTS } from '../variants';
import { resolveBackground } from './background';
import { prefersReducedMotion } from './reducedMotion';
import { Renderer } from './Renderer';

interface Internals {
  renderer?: Pick<Renderer, 'setPalette' | 'setBackground' | 'setZoom' | 'resize' | 'size' | 'draw' | 'destroy'>;
  autoStart?: boolean;
  reducedMotion?: boolean;
}

export class LineField {
  private renderer: Internals['renderer'];
  private raf = 0;
  private running = false;
  private reduced: boolean;

  constructor(private el: HTMLElement, private opts: LineFieldOptions, internals: Internals = {}) {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
    el.appendChild(canvas);
    this.renderer = internals.renderer ?? new Renderer(canvas);
    this.reduced = internals.reducedMotion ?? prefersReducedMotion();
    this.applyOptions();
    if (internals.autoStart ?? true) this.start();
  }

  private applyOptions(): void {
    this.renderer!.setPalette(this.opts.palette);
    this.renderer!.setBackground(resolveBackground(this.opts.background));
    this.renderer!.setZoom(this.opts.zoom ?? 1);
    this.renderer!.resize();
  }

  setOptions(partial: Partial<LineFieldOptions>): void {
    this.opts = { ...this.opts, ...partial };
    this.applyOptions();
  }

  /** Render one frame at time t (ms). Autonomous loop only — no pointer, no scroll. */
  tick(t: number): void {
    const variant = VARIANTS[this.opts.variant];
    const { W, H } = this.renderer!.size;
    const time = t * (this.opts.speed ?? 0.35); // 0.35 = modo suave (más lento) por defecto
    this.renderer!.draw(variant.generate({ t: time, W, H, lineCount: this.opts.lineCount }));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    if (this.reduced) { this.tick(0); this.running = false; return; }
    const loop = (t: number) => { if (!this.running) return; this.tick(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy(): void {
    this.stop();
    this.renderer!.destroy();
  }
}
