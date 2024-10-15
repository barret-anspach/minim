import { useMemo } from "react";

import { getPitches } from "../../utils/getPitches";
import Item from "../Item";
import StaffDisplayItem from "../StaffDisplayItem";
import { getDiatonicTransposition } from "../../utils/methods";

const meterGlyphMap = {
  key: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  value: ["", "", "", "", "", "", "", "", "", ""],
};

export default function Meter({
  type = "regular",
  clef,
  count,
  id,
  unit,
  start = "m-tim",
}) {
  const {
    rangeClef: { midline },
  } = getPitches(clef);
  const meter = useMemo(
    () => ({
      numerator: {
        pitch: `${id}${getDiatonicTransposition(midline, 2)}`,
        glyphs: Array.from({ length: count.toString().length }, (_, i) =>
          count.toString().slice(i, i + 1),
        ).map(
          (digit) =>
            meterGlyphMap.value[meterGlyphMap.key.find((k) => k === digit)],
        ),
      },
      denominator: {
        pitch: `${id}${getDiatonicTransposition(midline, -2)}`,
        glyphs: Array.from({ length: unit.toString().length }, (_, i) =>
          unit.toString().slice(i, i + 1),
        ).map(
          (digit) =>
            meterGlyphMap.value[meterGlyphMap.key.find((k) => k === digit)],
        ),
      },
    }),
    [count, id, midline, unit],
  );

  switch (type) {
    case "regular":
    default: {
      return (
        <StaffDisplayItem type="tim" start={start}>
          <Item pitch={meter.numerator.pitch}>
            {meter.numerator.glyphs.map((glyph) => glyph)}
          </Item>
          <Item pitch={meter.denominator.pitch}>
            {meter.denominator.glyphs.map((glyph) => glyph)}
          </Item>
        </StaffDisplayItem>
      );
    }
  }
}
