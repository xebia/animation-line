# Variantes de patrón teselado (líneas / WebGL)

Fecha: 2026-07-14

## Objetivo

Cinco variantes nuevas del motor de líneas basadas en patrones geométricos teselados
(referencias en `docs/reference/pattern-*.png`). Autónomas, sin ratón ni scroll, y
consistentes en movimiento con las 31 variantes existentes.

## Referencias

| Fichero | Patrón |
|---|---|
| `pattern-1-cruces.png` | Cruces/plus y estrellas de 4 puntas sobre rejilla técnica fina |
| `pattern-2-celosia-diagonal.png` | Trazos diagonales cortos que forman rombos |
| `pattern-3-laberinto-hex.png` | Laberinto hexagonal concéntrico con nodos en Y |
| `pattern-4-triestrellas.png` | Tri-estrellas / hexágonos abiertos |
| `pattern-5-malla-x.png` | Malla de X redondeadas gruesas |

## Decisiones

- **Motor**: solo líneas (WebGL). Son patrones de trazo puro; heredan paleta, fondo,
  grosor, zoom y pan sin tocar el bucle de render.
- **Movimiento**: la rejilla respira y deforma. El patrón sigue siendo legible; una onda
  recorre el campo escalando, girando y desplazando cada celda. Nada de ensamblar/disolver
  ni de proyección 3D.
- **Grosor mixto**: se añade grosor por polilínea al motor. Las referencias 1 y 5 mezclan
  pesos (rejilla finísima + cruces gruesas) y hoy el grosor es un único valor por instancia.

## Núcleo

Cambio acotado y retrocompatible: sin `w`, una polilínea usa el `thickness` de la instancia,
así que las 31 variantes actuales no cambian de aspecto.

- `core/types.ts`: `Polyline` gana `w?: number` — grosor en px de ese trazo.
- `core/lineGeometry.ts`: la media-anchura deja de ser un escalar de la llamada y se calcula
  por polilínea; se emite como atributo `hw` por vértice (los abanicos de *join* y *cap* usan
  la media-anchura de su propia polilínea).
- `core/Renderer.ts`: el shader sustituye el uniform `uHalf` por el atributo `hw` en el
  cálculo del *feather*.

## `core/tiling.ts` (nuevo)

Único sitio donde vive el teselado y el movimiento, para que las cinco respiren igual.

- `squareTiles(W, H, cell)` → centros de celda de una rejilla cuadrada.
- `hexTiles(W, H, cell)` → centros de celda de una rejilla hexagonal.
  Ambos con sangrado: emiten celdas fuera del lienzo para que el patrón no muera en el borde.
- `breathe(cx, cy, t, opts)` → `{ scale, rot, dx, dy, s }`: la onda que recorre el campo.
  Devuelve la escala, el giro, el desplazamiento de esa celda y su posición `s` en el gradiente.

Cada variante solo describe **su forma dentro de una celda**; el helper la repite y la anima.

## Variantes

Rejilla cuadrada:

1. `cruces` — cruz gruesa por celda sobre rejilla técnica fina (dos grosores). Las cruces
   giran y crecen con la onda; en la cresta se abren en estrella de 4 puntas.
2. `tramado` — trazos diagonales cortos. La onda gira cada trazo entre las dos diagonales,
   y el patrón de rombos se compone y se deshace.
3. `mallax` — malla de X redondeadas gruesas. La onda engorda y adelgaza los brazos.

Rejilla hexagonal:

4. `panal` — laberinto hexagonal concéntrico con nodos en Y. Los anillos laten hacia dentro
   y hacia fuera.
5. `teselas` — tri-estrellas / hexágonos abiertos. Los brazos se abren y cierran alrededor
   de cada nodo.

Los cinco nombres se añaden a `VARIANT_NAMES` y al registro de `variants/index.ts`, y las
variantes aparecen en el grid del demo de líneas.

## Tests

- Por variante, como en `tests/variants/`: devuelve polilíneas, coordenadas finitas, y es
  determinista para un mismo `t`.
- `tests/core/lineGeometry`: una polilínea con `w` propio produce una anchura distinta de la
  del `thickness` global, y sin `w` el comportamiento no cambia (retrocompatibilidad).
- `tests/core/tiling`: los iteradores cubren el lienzo con sangrado, y `breathe` es
  determinista y acotado.
