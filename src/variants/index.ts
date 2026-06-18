import type { Variant, VariantName } from '../core/types';
import { oscilacion } from './oscilacion';
import { onda } from './onda';
import { interferencia } from './interferencia';
import { malla } from './malla';
import { rejilla } from './rejilla';
import { pliegues } from './pliegues';
import { cubo } from './cubo';

export const VARIANTS: Record<VariantName, Variant> = {
  oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo,
};
