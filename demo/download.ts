/** Descarga un texto como fichero (aquí, el SVG del fotograma actual). */
export function downloadText(name: string, text: string, type = 'image/svg+xml'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  // el revoke tiene que esperar: si se hace en el mismo tick, el navegador cancela la
  // descarga de los SVG grandes antes de haberla leído
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Botón "SVG" de una card. */
export function svgButton(onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'dl';
  b.textContent = 'SVG';
  b.title = 'Descargar este fotograma como SVG vectorial (sin animación)';
  b.onclick = onClick;
  return b;
}
