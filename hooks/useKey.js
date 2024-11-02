import { useMemo } from "react";

import { accidentalMap } from "./../constants/accidentals";
const range = require("./../fixtures/pitch/range.json");

export function useKey({ clefType, event, period }) {
  const key = period.measures[event.flowId].find(
    (m) => m.position.start <= event.position.start,
  )?.key;

  const value = useMemo(() => {
    const fifths = key.fifths;
    const unsignedInteger = Math.abs(fifths);
    const sign = Math.sign(fifths);
    const accidentals =
      sign === 0
        ? []
        : range.clefs[clefType].keyAccidentals[sign === 1 ? "sharp" : "flat"]
            .slice(0, unsignedInteger)
            .map((pitch) => ({
              pitch,
              glyph:
                accidentalMap.value[
                  accidentalMap.key.indexOf(
                    sign === 0
                      ? "accidentalNatural"
                      : sign === 1
                        ? "accidentalSharp"
                        : "accidentalFlat",
                  )
                ],
            }));

    return {
      key: key,
      accidentals,
      accidentalStep: accidentals.reduce(
        (acc, k) => [...acc, k.pitch.slice(0, 1).toUpperCase()],
        [],
      ),
    };
  }, [clefType, key]);

  return value;
}
