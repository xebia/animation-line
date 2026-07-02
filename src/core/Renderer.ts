import { Renderer as OGLRenderer, Program, Mesh, Geometry, Texture } from 'ogl';
import type { OGLRenderingContext } from 'ogl';
import type { Polyline } from './types';
import type { ResolvedBackground } from './background';
import { buildGradientPixels } from './palette';
import { polylinesToSegments, halfWidthPx } from './lineGeometry';

const VERT = `
attribute vec2 position;
attribute float s;
attribute float edge;
attribute float a;
varying float vS;
varying float vEdge;
varying float vA;
void main() { vS = s; vEdge = edge; vA = a; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uGradient;
uniform float uAlpha;
uniform float uHalf;    // media-anchura de línea en px
uniform float uPremult; // 1 en blend multiply (fondo claro)
varying float vS;
varying float vEdge;
varying float vA;
void main() {
  vec3 c = texture2D(uGradient, vec2(vS, 0.5)).rgb;
  float feather = clamp((1.0 - abs(vEdge)) * uHalf / 0.75, 0.0, 1.0);
  float al = uAlpha * vA * feather;
  gl_FragColor = vec4(mix(c, c * al, uPremult), al);
}
`;

const BG_VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;

const BG_FRAG = `
precision highp float;
uniform vec3 uFrom;
uniform vec3 uTo;
uniform float uAngle;
varying vec2 vUv;
void main() {
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  float tg = clamp(dot(vUv - 0.5, dir) + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(mix(uFrom, uTo, tg), 1.0);
}
`;

export class Renderer {
  private gl: OGLRenderingContext;
  private renderer: OGLRenderer;
  private program: Program;
  private bgProgram: Program;
  private gradient: Texture;
  private mesh: Mesh;
  private bgMesh: Mesh;
  private geometry: Geometry;
  private capacity = 0; // vértices reservados (se recrea solo al crecer)
  private bg: ResolvedBackground = { draw: true, from: [0, 0, 0], to: [0, 0, 0], angle: 0, blend: 'add', clearAlpha: 1 };
  private ro?: ResizeObserver;
  private W = 1;
  private H = 1;
  private zoom = 1;
  private pan = { x: 0, y: 0 };
  private thickness = 1.7;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new OGLRenderer({ canvas, alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.renderer.autoClear = false;
    this.gl = this.renderer.gl;

    this.gradient = new Texture(this.gl, { image: buildGradientPixels(['#000', '#fff']), width: 256, height: 1, generateMipmaps: false });
    this.program = new Program(this.gl, {
      vertex: VERT, fragment: FRAG, transparent: true, cullFace: false, depthTest: false,
      uniforms: {
        uGradient: { value: this.gradient }, uAlpha: { value: 0.85 },
        uHalf: { value: halfWidthPx(this.thickness) }, uPremult: { value: 0 },
      },
    });
    this.geometry = this.makeGeometry(0);
    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program, mode: this.gl.TRIANGLES });

    this.bgProgram = new Program(this.gl, {
      vertex: BG_VERT, fragment: BG_FRAG, cullFace: false, depthTest: false,
      uniforms: { uFrom: { value: [0, 0, 0] }, uTo: { value: [0, 0, 0] }, uAngle: { value: 0 } },
    });
    const bgGeo = new Geometry(this.gl, { position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) } });
    this.bgMesh = new Mesh(this.gl, { geometry: bgGeo, program: this.bgProgram, mode: this.gl.TRIANGLES });

    this.canvas.style.display = 'block';
    this.resize();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.canvas.parentElement ?? this.canvas);
    }
  }

  private makeGeometry(vertices: number): Geometry {
    const gl = this.gl;
    this.capacity = vertices;
    return new Geometry(gl, {
      position: { size: 2, data: new Float32Array(vertices * 2), usage: gl.DYNAMIC_DRAW },
      s: { size: 1, data: new Float32Array(vertices), usage: gl.DYNAMIC_DRAW },
      edge: { size: 1, data: new Float32Array(vertices), usage: gl.DYNAMIC_DRAW },
      a: { size: 1, data: new Float32Array(vertices), usage: gl.DYNAMIC_DRAW },
    });
  }

  setPalette(palette: string[]): void {
    this.gradient.image = buildGradientPixels(palette);
    this.gradient.needsUpdate = true;
  }

  setBackground(bg: ResolvedBackground): void {
    this.bg = bg;
    const gl = this.gl;
    this.program.uniforms.uAlpha.value = bg.blend === 'add' ? 0.85 : 1.0;
    this.program.uniforms.uPremult.value = bg.blend === 'multiply' ? 1 : 0;
    if (bg.blend === 'multiply') this.program.setBlendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    else if (bg.blend === 'normal') this.program.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    else this.program.setBlendFunc(gl.SRC_ALPHA, gl.ONE); // add
    this.bgProgram.uniforms.uFrom.value = bg.from;
    this.bgProgram.uniforms.uTo.value = bg.to;
    this.bgProgram.uniforms.uAngle.value = bg.angle;
  }

  setZoom(zoom: number): void { this.zoom = zoom; }
  setPan(x: number, y: number): void { this.pan = { x, y }; }
  setThickness(t: number): void {
    this.thickness = t;
    this.program.uniforms.uHalf.value = halfWidthPx(t);
  }

  resize(): void {
    const target = this.canvas.parentElement ?? this.canvas;
    const rect = target.getBoundingClientRect();
    this.W = Math.max(1, Math.round(rect.width));
    this.H = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(this.W, this.H);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
  }

  get size(): { W: number; H: number } {
    return { W: this.W, H: this.H };
  }

  draw(polylines: Polyline[]): void {
    const { W, H } = this.size;
    const seg = polylinesToSegments(polylines, W, H, { zoom: this.zoom, pan: this.pan, thickness: this.thickness });
    const vcount = seg.position.length / 2;

    if (vcount > this.capacity) {
      // crecer con margen para no recrear en cada frame
      this.geometry.remove();
      this.geometry = this.makeGeometry(Math.ceil(vcount * 1.5));
      this.mesh.geometry = this.geometry;
    }
    const at = this.geometry.attributes;
    const upload: Array<[string, Float32Array]> = [['position', seg.position], ['s', seg.s], ['edge', seg.edge], ['a', seg.a]];
    for (const [name, data] of upload) {
      (at[name].data as Float32Array).set(data);
      at[name].needsUpdate = true;
    }
    this.geometry.setDrawRange(0, vcount);

    const gl = this.gl;
    gl.clearColor(this.bg.from[0], this.bg.from[1], this.bg.from[2], this.bg.clearAlpha);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.bg.draw) this.renderer.render({ scene: this.bgMesh });
    this.renderer.render({ scene: this.mesh });
  }

  destroy(): void {
    this.ro?.disconnect();
    const ext = this.gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  }
}
