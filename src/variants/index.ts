import type { Variant, VariantName } from '../core/types';
import { oscilacion } from './oscilacion';
import { onda } from './onda';
import { interferencia } from './interferencia';
import { malla } from './malla';
import { rejilla } from './rejilla';
import { pliegues } from './pliegues';
import { cubo } from './cubo';
import { flujo } from './flujo';
import { entrelazado } from './entrelazado';
import { espiral } from './espiral';
import { tubo } from './tubo';
import { cono } from './cono';
import { cinta } from './cinta';
import { helice } from './helice';
import { embudo } from './embudo';
import { duna } from './duna';
import { quilla } from './quilla';
import { helicoide } from './helicoide';
import { voluta } from './voluta';
import { celosia } from './celosia';
import { aurora } from './aurora';
import { moire } from './moire';
import { tunel } from './tunel';
import { terreno } from './terreno';
import { orbitas } from './orbitas';
import { pulso } from './pulso';
import { giroscopio } from './giroscopio';
import { toroide } from './toroide';
import { cristal } from './cristal';

export const VARIANTS: Record<VariantName, Variant> = {
  oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo,
  flujo, entrelazado, espiral, tubo, cono, cinta, helice, embudo, duna,
  quilla, helicoide, voluta, celosia, aurora, moire,
  tunel, terreno, orbitas, pulso, giroscopio, toroide, cristal,
};
