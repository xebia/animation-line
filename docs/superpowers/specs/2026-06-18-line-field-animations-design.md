# Diseño — Librería de animaciones de campos de líneas (`xebia-animation-line`)

**Fecha:** 2026-06-18
**Estado:** Aprobado (pendiente de revisión final del spec)

## 1. Objetivo

Crear una librería de **animaciones de campos de líneas** reutilizables y framework-agnostic, inspiradas en el lenguaje visual de slope.agency (case study "Narrative"): composiciones geométricas de líneas que se trazan, se retuercen y se ondulan de forma autónoma. Cada animación es un módulo que se "deja caer" en un contenedor del DOM.

### Principios

- **No interactiva con el ratón.** Las animaciones van solas (bucle por tiempo) o dirigidas por scroll. Nunca reaccionan al puntero.
- **Tematizable.** Paleta de degradado y fondo son parámetros, no valores fijos.
- **Aislada y reutilizable.** Drop-in en cualquier proyecto (HTML puro o React), se autolimpia, respeta `prefers-reduced-motion`.
- **Calidad primero.** Render por WebGL para máxima fidelidad y rendimiento.

## 2. Alcance

### Dentro

- Motor de render WebGL común (OGL).
- Set de variantes (10): **oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo, flujo, entrelazado, espiral**.
- API pública `LineField` con opciones `variant`, `palette`, `background`, `speed`.
- Animación **autónoma** (bucle por tiempo). Sin ratón y **sin scroll**.
- Wrapper opcional para React.
- Galería demo (Vite) con selector de variante, paleta y fondo.

### Fuera (ampliación posterior)

- Variantes extra: **Cubo de puntos** y **Tubo enrollado**.
- Editor visual de presets / exportador de configuraciones.
- Wrappers para Vue/Svelte.

## 3. Decisiones técnicas

| Decisión | Elección | Motivo |
|----------|----------|--------|
| Motor de render | **WebGL con OGL** (~30 kb) | Máxima calidad; 3D real, miles de líneas a 60fps, glow/profundidad por shaders. Más ligero que Three.js. |
| Lenguaje / build | **TypeScript + Vite** | Tipado para una API de librería limpia; Vite para dev server + build de módulo ES. |
| Formato de paquete | Módulo ES | Importable desde cualquier bundler; tree-shakeable por variante. |
| Dependencias | Solo `ogl` | Mínimo peso. |

## 4. API pública

```ts
import { LineField } from 'xebia-animation-line';

const anim = new LineField(container: HTMLElement, options: LineFieldOptions);
anim.destroy();          // limpia canvas, listeners y contexto GL
anim.setOptions(partial) // actualiza variante/paleta/fondo en caliente
```

```ts
interface LineFieldOptions {
  variant: 'oscilacion' | 'onda' | 'interferencia' | 'malla' | 'rejilla'
         | 'pliegues' | 'cubo' | 'flujo' | 'entrelazado' | 'espiral';
  palette: string[];                  // 2+ colores hex → degradado
  background:
    | { type: 'solid'; color: string }
    | { type: 'gradient'; from: string; to: string; angle?: number }
    | { type: 'transparent' };
  speed?: number;                     // multiplicador de velocidad (por defecto 0.6, modo suave)
  lineCount?: number;                 // densidad
}
```

- Animación **autónoma**: bucle por tiempo, sin ratón ni scroll.
- `prefers-reduced-motion: reduce` → renderiza un fotograma estático representativo en lugar de animar.

## 5. Arquitectura

```
src/
  core/
    Renderer.ts      // setup OGL: canvas, programa, resize (DPR), loop rAF, destroy
    LineField.ts     // clase pública: orquesta variante + tema (bucle autónomo)
    palette.ts       // construye el degradado a partir de string[]
    background.ts    // pinta/configura el fondo (solid|gradient|transparent)
    reducedMotion.ts // detecta prefers-reduced-motion
    types.ts         // LineFieldOptions y tipos compartidos
  variants/          // cada variante: misma interfaz Variant
    types.ts         // interface Variant { build(ctx): void; update(t, opts): void }
    oscilacion.ts
    onda.ts
    rejilla3d.ts
    radial.ts
    geometrica.ts
    tech.ts
  index.ts           // API pública (exporta LineField y tipos)
  react/
    LineField.tsx    // wrapper React (monta/desmonta, pasa opciones)

demo/                // galería Vite: selector de variante/paleta/fondo
  index.html
  main.ts
```

### Límites de cada unidad

- **Renderer**: sabe de OGL y del bucle; no conoce variantes concretas. Expone contexto GL, tamaño y un hook de frame.
- **Variant**: sabe de su geometría/shader; recibe contexto del Renderer y `t`/opciones. No toca el DOM ni el scroll.
- **LineField**: pega todo (elige variante, aplica tema/fondo, conecta modo auto/scroll). Es lo único público.
- Añadir una variante nueva = un archivo en `variants/` que implementa `Variant`. No toca el núcleo.

## 6. Variantes (estado objetivo)

Catálogo enriquecido. Varias confirmadas por las referencias del usuario (capturas de Slope).

**Familia "campos de líneas regladas"**
1. **Oscilación lineal** — string-art retorcido, la "trompeta" (ref. imagen 2).
2. **Malla reglada** — versión en rejilla de la trompeta: se estrecha en una "cintura" y se abre en perspectiva (ref. imagen 4).
3. **Rejilla 3D** — malla que se ondula/dobla en perspectiva real.

**Familia "ondas"**
4. **Onda / Flow** — láminas onduladas entre dos curvas.
5. **Interferencia** — varias ondas que se mezclan con dispersión (patrones de interferencia).

**Familia "geométrica abstracta"**
6. **Pliegues / Folded** — láminas de líneas que se doblan en ángulo, con tramado tipo chevrón (ref. imagen 1).
7. **Cubo** — retículo 3D de líneas formando un cubo que rota y muta; degradado por profundidad (ref. imagen 3).

Todas con paleta y fondo parametrizables. **Estética común: suave, fluida y abstracta** (líneas finas, movimiento lento). "Malla reglada" usa alta densidad y torsión para que las líneas se intersequen/entretejan más.

> Descartadas por el usuario: "Circuito" (PCB), "Abstracto" (armonográfico), "Radial" (abanico), "Geométrica" (polígonos) y "Tech/Red" (nodos) — estas dos últimas por ser demasiado recargadas / poco abstractas.

### Modo suave (global)

Todas las variantes comparten un factor de velocidad reducido por defecto (`speed ≈ 0.6`) para un movimiento más fluido y elegante, en línea con las referencias. Es ajustable por opción.

## 7. Verificación

- **Galería demo** como banco de pruebas visual de cada variante × paleta × fondo.
- **Pruebas ligeras**:
  - `LineField` crea y `destroy()` libera contexto GL y listeners (sin fugas).
  - `setOptions` cambia variante/paleta/fondo en caliente sin recrear el canvas.
  - `prefers-reduced-motion` produce fotograma estático (no bucle).
- Validación visual en navegador como criterio de "conseguido el efecto" por variante.

## 8. Riesgos / notas

- WebGL en contextos sin GPU/headless: el modo reduced-motion y un fallback estático cubren el caso degradado.
- El repositorio aún no está inicializado en git; conviene `git init` + `.gitignore` (incluyendo `.superpowers/` y `node_modules/`) al empezar la implementación.
