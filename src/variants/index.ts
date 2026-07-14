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
import { frunce } from './frunce';
import { dipolo } from './dipolo';
import { tramado } from './tramado';
import { mallax } from './mallax';
import { teselas } from './teselas';
import { panal } from './panal';
import { cruces } from './cruces';
import { extrusion } from './extrusion';
import { bloques } from './bloques';
import { torres } from './torres';
import { barras } from './barras';
import { escaleras } from './escaleras';
import { pozos } from './pozos';
import { placas } from './placas';
import { rayado } from './rayado';
import { nidos } from './nidos';
import { prismas } from './prismas';
import { capas } from './capas';
import { circuito } from './circuito';
import { celdilla } from './celdilla';
import { nodos } from './nodos';
import { damero } from './damero';
import { subdivision } from './subdivision';
import { pixeles } from './pixeles';
import { terrazas } from './terrazas';
import { voxel } from './voxel';
import { cintas } from './cintas';
import { rejas } from './rejas';
import { laberinto } from './laberinto';
import { espiga } from './espiga';
import { trenzado } from './trenzado';
import { mosaico } from './mosaico';
import { cruceta } from './cruceta';
import { radial } from './radial';
import { guiones } from './guiones';
import { sierra } from './sierra';
import { escalonado } from './escalonado';
import { diamante } from './diamante';

export const VARIANTS: Record<VariantName, Variant> = {
  oscilacion, onda, interferencia, malla, rejilla, pliegues, cubo,
  flujo, entrelazado, espiral, tubo, cono, cinta, helice, embudo, duna,
  quilla, helicoide, voluta, celosia, aurora, moire,
  tunel, terreno, orbitas, pulso, giroscopio, toroide, cristal, frunce, dipolo,
  tramado, mallax, teselas, panal, cruces, extrusion,
  bloques, torres, barras, escaleras, pozos,
  placas, rayado, nidos, prismas, capas, circuito,
  celdilla, nodos,
  damero, subdivision,
  pixeles, terrazas, voxel,
  cintas, rejas,
  laberinto, espiga, trenzado, mosaico, cruceta,
  radial, guiones, sierra, escalonado, diamante,
};
