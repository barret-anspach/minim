import { useMemo } from "react";

const range = require("../fixtures/pitch/range.json");

export function usePitches(clef) {
  if (!clef)
    return {
      pitches: undefined,
      rangeClef: undefined,
      staffBounds: undefined,
      translateY: undefined,
    };
  const rangeClef = Object.values(range.clefs).find(
    (v) => clef.sign === v.sign,
  );
  const [upperBound, lowerBound] = [
    rangeClef.bounds.find((b) => b.node === "upperBound"),
    rangeClef.bounds.find((b) => b.node === "lowerBound"),
  ];
  const steps = range.gamut.base.slice(
    range.gamut.base.findIndex((p) => p.id === upperBound.base.id),
    range.gamut.base.findIndex((p) => p.id === lowerBound.base.id),
  );
  return {
    pitches: steps.reduce(
      (acc, curr, index) =>
        index !== steps.length
          ? `${acc}[${curr.id}] 0.125rem `
          : `${acc}[${curr.id}]`,
      "",
    ),
    rangeClef,
    staffBounds: {
      upper: rangeClef.staffLinePitches[0],
      lower: rangeClef.staffLinePitches[rangeClef.staffLinePitches.length - 1],
    },
    translateY: rangeClef.translateY,
  };
}
