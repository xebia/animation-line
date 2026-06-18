import { Renderer as OGLRenderer, Program, Mesh, Geometry, Texture } from 'ogl';
import type { OGLRenderingContext } from 'ogl';
import type { Polyline } from './types';
import type { ResolvedBackground } from './background';
import { buildGradientPixels } from './palette';
import { polylinesToSegments } from './lineGeometry';

const VERT = `
attribute vec2 position;
attribute float s;
varying float vS;
void main() { vS = s; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uGradient;
uniform float uAlpha;
varying float vS;
void main() {
  vec3 c = texture2D(uGradient, vec2(vS, 0.5)).rgb;
  gl_FragColor = vec4(c, uAlpha);
}
`;

export class Renderer {
  private gl: OGLRenderingContext;
  private renderer: OGLRenderer;
  private program: Program;
  private gradient: Texture;
  private mesh: Mesh;
  private geometry: Geometry;
  private bg: ResolvedBackground = { clear: [0, 0, 0, 1], blend: 'add' };
  private ro?: ResizeObserver;
  private W = 1;
  private H = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new OGLRenderer({ canvas, alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gradient = new Texture(this.gl, { image: buildGradientPixels(['#000', '#fff']), width: 256, height: 1, generateMipmaps: false });
    this.program = new Program(this.gl, {
      vertex: VERT, fragment: FRAG, transparent: true,
      uniforms: { uGradient: { value: this.gradient }, uAlpha: { value: 0.85 } },
    });
    this.geometry = new Geometry(this.gl, {
      position: { size: 2, data: new Float32Array() },
      s: { size: 1, data: new Float32Array() },
    });
    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program, mode: this.gl.LINES });

    this.canvas.style.display = 'block';
    this.resize();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.canvas.parentElement ?? this.canvas);
    }
  }

  setPalette(palette: string[]): void {
    this.gradient.image = buildGradientPixels(palette);
    this.gradient.needsUpdate = true;
  }

  setBackground(bg: ResolvedBackground): void {
    this.bg = bg;
    this.program.uniforms.uAlpha.value = bg.blend === 'add' ? 0.85 : 1.0;
  }

  resize(): void {
    // Measure the container, not the canvas: OGL writes explicit px into the
    // canvas inline style, which would otherwise defeat the 100% fill.
    const target = this.canvas.parentElement ?? this.canvas;
    const rect = target.getBoundingClientRect();
    this.W = Math.max(1, Math.round(rect.width));
    this.H = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(this.W, this.H);
    // Re-assert fill so the canvas tracks its container instead of OGL's px.
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
  }

  get size(): { W: number; H: number } {
    return { W: this.W, H: this.H };
  }

  draw(polylines: Polyline[]): void {
    const { W, H } = this.size;
    const seg = polylinesToSegments(polylines, W, H);
    this.geometry = new Geometry(this.gl, {
      position: { size: 2, data: seg.position },
      s: { size: 1, data: seg.s },
    });
    this.mesh.geometry = this.geometry;

    const gl = this.gl;
    gl.clearColor(...this.bg.clear);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    if (this.bg.blend === 'add') gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.renderer.render({ scene: this.mesh });
  }

  destroy(): void {
    this.ro?.disconnect();
    const ext = this.gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  }
}
