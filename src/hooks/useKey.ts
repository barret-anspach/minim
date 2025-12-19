import { useMemo } from "react";

import { accidentalMap } from "./../constants/accidentals.js";
import range from "./../fixtures/pitch/range.json";

import { Minim } from "./../types/minim/index.js";

type Props = {
  clefType: Minim.Range.ClefType;
  event: Minim.Event.EventItem;
  period: Minim.Period.PeriodItem;
};

export function useKey({ clefType, event, period }: Props) {
  const key = period.measures[event.flowId].find(
    (m) => m.position.start <= (event.position as Minim.Bounds).start,
  )?.key;

  const value = useMemo(() => {
    if (!key) return undefined;

    const fifths = key.fifths;
    const unsignedInteger = Math.abs(fifths);
    const sign = Math.sign(fifths);
    const accidentals =
      sign === 0
        ? []
        : (range.clefs[clefType] as Minim.Range.Clef).keyAccidentals[
            sign === 1 ? "sharp" : "flat"
          ]
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
        (acc: string[], k) => [...acc, k.pitch.slice(0, 1).toUpperCase()],
        [] as string[],
      ),
    };
  }, [clefType, key]);

  return value;
}
