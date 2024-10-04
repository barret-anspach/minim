import Item from "../Item";
import StaffDisplayItem from "../StaffDisplayItem";

import { accidentalMap } from "../../constants/accidentals";
const range = require("./../../fixtures/pitch/range.json");

// TODO: Refactor so that Staff has named rows for each anticipated keyAccidental index,
// And placing them is as easy as referencing `keyAccFlat1`, `keyAccFlat2`, etc
export default function Key({
  clefType,
  column = "m-key",
  fifths,
  id,
  prevFifths,
}) {
  const unsignedInteger = Math.abs(fifths);
  const sign = Math.sign(fifths);
  const accidentals =
    sign === 0 || (prevFifths !== fifths && fifths === 0)
      ? range.clefs[clefType].keyAccidentals[
          Math.sign(prevFifths) === 1 ? "sharp" : "flat"
        ]
          .slice(0, Math.abs(prevFifths))
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
          }));
  return (
    <StaffDisplayItem type="key" start={column}>
      {accidentals.length > 0 &&
        accidentals.map((accidental, index) => (
          <Item
            key={`key_acc${index}`}
            pitch={accidental.pitch}
            column={index + 1}
          >
            {accidental.glyph}
          </Item>
        ))}
    </StaffDisplayItem>
  );
}
