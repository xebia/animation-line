import { LineField, VARIANT_NAMES } from '../src/index';
import type { Background } from '../src/index';

const PALETTE = ['#3fd6a0', '#5ad1ff', '#9b8cff'];
const BACKGROUND: Background = { type: 'gradient', from: '#06101a', to: '#0a1b2b' };

const grid = document.getElementById('grid')!;

for (const name of VARIANT_NAMES) {
  const cell = document.createElement('a');
  cell.className = 'cell';
  cell.href = `./single.html#${name}`;       // clic → vista individual
  cell.title = name;

  const stage = document.createElement('div');
  stage.className = 'stage';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = name;

  cell.append(stage, label);
  grid.appendChild(cell);

  // Cada animación en su propio rectángulo (instancia independiente, autónoma).
  new LineField(stage, { variant: name, palette: PALETTE, background: BACKGROUND });
}
