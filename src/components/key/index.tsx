import { useMemo } from "react";

import Item from "./../../components/item/index.js";
import StaffDisplayItem from "./../../components/staffDisplayItem/index.js";

import { accidentalMap } from "./../../constants/accidentals.js";
import range from "./../../fixtures/pitch/range.json";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";

type KeyProps = {
  clefType: Minim.Range.ClefType;
  fifths: Minim.Component.Key["fifths"];
  id: MNX.Defs.ID;
  prevFifths?: Minim.Component.Key["fifths"];
  column?: Minim.Grid.Column;
};

export default function Key({
  clefType,
  column = "m-key",
  fifths,
  id,
  prevFifths,
}: KeyProps) {
  const unsignedInteger = useMemo(() => Math.abs(fifths), [fifths]);
  const sign = useMemo(() => Math.sign(fifths), [fifths]);
  const accidentals = useMemo(
    () =>
      sign === 0 ||
      (prevFifths !== undefined && prevFifths !== fifths && fifths === 0)
        ? range.clefs[clefType].keyAccidentals[
            Math.sign(prevFifths!) === 1 ? "sharp" : "flat"
          ]
            .slice(0, Math.abs(prevFifths!))
            .map((pitch) => ({
              pitch: `${id ?? ""}${pitch}`,
              glyph:
                accidentalMap.value[
                  accidentalMap.key.indexOf("accidentalNatural")
                ],
            }))
        : range.clefs[clefType].keyAccidentals[sign === 1 ? "sharp" : "flat"]
            .slice(0, unsignedInteger)
            .map((pitch) => ({
              pitch: `${id ?? ""}${pitch}`,
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
            })),
    [clefType, fifths, id, prevFifths, sign, unsignedInteger],
  );

  return (
    <StaffDisplayItem type="key" start={column} data-key>
      {accidentals.length > 0 &&
        accidentals.map((accidental, index) => (
          <Item
            key={`key_acc${index}`}
            pitch={accidental.pitch}
            column={`${index + 1}`}
          >
            {accidental.glyph}
          </Item>
        ))}
    </StaffDisplayItem>
  );
}
