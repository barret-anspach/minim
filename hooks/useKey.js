import { useMemo } from "react"

import { useMeasuresContext } from "../contexts/MeasuresContext";
import { accidentalMap } from "./../constants/accidentals";
const range = require('./../fixtures/pitch/range.json');

export function useKey({ clefType, measureIndex }) {
  const { context: { measures } } = useMeasuresContext();

  // If it's the last measure in a system and there's a key change in the next measure,
  // or a current key change,
  // or the first measure in a system,
  const value = useMemo(() => {
    const prevFifths = measureIndex > 0
      ? measures[measureIndex - 1].key.fifths
      : undefined;
    const fifths = measures[measureIndex].key.fifths;

    const unsignedInteger = Math.abs(fifths);
    const sign = Math.sign(fifths);

    const accidentals = sign === 0
      ? []
      : range.clefs[clefType].keyAccidentals[sign === 1 ? 'sharp' : 'flat']
        .slice(0, unsignedInteger)
        .map(pitch => ({
          pitch,
          glyph: accidentalMap.value[
            accidentalMap.key.indexOf(sign === 0
              ? 'accidentalNatural'
              : sign === 1
                ? 'accidentalSharp'
                : 'accidentalFlat')
          ]
        }));
    
    return {
      key: measures[measureIndex].key,
      accidentals,
      accidentalStep: accidentals.reduce((acc, k) => [...acc, k.pitch.slice(0, 1).toUpperCase()], [])
    };
  }, [clefType, measureIndex, measures])

  return value;
}