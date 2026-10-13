/**
 * Registr typů cvičení. Nový typ = nová továrna se stejným rozhraním
 * (viz simple.js) a jeden řádek tady.
 */
import { createChoice, createFill, createOutput, createBug } from "./simple.js";
import { createOrder } from "./order.js";
import { createCode } from "./code.js";

const TYPES = {
  choice: createChoice,
  fill: createFill,
  output: createOutput,
  bug: createBug,
  order: createOrder,
  code: createCode,
};

/**
 * @param {object} def   data cvičení z obsahu lekce
 * @param {{onReadyChange: Function}} ctx
 */
export function createExercise(def, ctx) {
  const factory = TYPES[def.type];
  if (!factory) throw new Error(`Neznámý typ cvičení: ${def.type}`);
  return factory(def, ctx);
}

export const EXERCISE_TYPES = Object.keys(TYPES);
