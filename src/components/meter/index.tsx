import { useMemo } from "react";

import Item from "./../../components/item/index.js";
import StaffDisplayItem from "./../../components/staffDisplayItem/index.js";

import { getPitches } from "./../../utils/getPitches.js";
import { getDiatonicTransposition } from "./../../utils/methods.js";

import { MNX } from "./../../types/mnx/index.js";

const meterGlyphMap = {
  key: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  value: ["", "", "", "", "", "", "", "", "", ""],
};

type Props = {
  clef: MNX.Defs.Clef;
  count: number;
  id: string;
  unit: MNX.Defs.Time["unit"];
  start: string;
  type?: "regular" | string;
};

export default function Meter({
  type = "regular",
  clef,
  count,
  id,
  unit,
  start = "m-tim",
}: Props) {
  if (!clef) return null;

  const pitches = getPitches(clef);
  const midline = pitches?.rangeClef?.midline;

  if (!midline) return null;

  const meter = useMemo(
    () => ({
      numerator: {
        pitch: `${id}${getDiatonicTransposition(midline, 2)}`,
        glyphs: Array.from({ length: count.toString().length }, (_, i) =>
          count.toString().slice(i, i + 1),
        ).map((digit) => meterGlyphMap.value[meterGlyphMap.key.indexOf(digit)]),
      },
      denominator: {
        pitch: `${id}${getDiatonicTransposition(midline, -2)}`,
        glyphs: Array.from({ length: unit.toString().length }, (_, i) =>
          unit.toString().slice(i, i + 1),
        ).map((digit) => meterGlyphMap.value[meterGlyphMap.key.indexOf(digit)]),
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
