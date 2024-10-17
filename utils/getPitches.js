import { getDiatonicTransposition } from "./methods";

const range = require("../fixtures/pitch/range.json");

export function getPitches(clef, prefix) {
  if (!clef)
    return {
      pitches: undefined,
      pitchesArray: [],
      prefix,
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
          ? `${acc}[${prefix ?? ""}${curr.id}] 0.125rem `
          : `${acc}[${prefix ?? ""}${curr.id}]`,
      "",
    ),
    pitchesArray: steps.reduce(
      (acc, curr, index) =>
        index !== steps.length && [...acc, `${prefix ?? ""}${curr.id}`],
      [],
    ),
    prefix,
    rangeClef,
    staffBounds: {
      upper: rangeClef.staffLinePitches[0],
      lower: rangeClef.staffLinePitches[rangeClef.staffLinePitches.length - 1],
    },
    translateY: rangeClef.translateY,
  };
}

const INTER_STAFF_SPACE = 7;

// overlap any number of staves' named (pitched) grid rows to render appropriate inter-staff spacing.
// should allow for customization of inter-staff spacing.
export function overlap(staves, space) {
  const result = staves.reduce(
    (acc, staff, i, staves) => {
      if (i + 1 !== staves.length) {
        // figure out which of the next staff's pitch rows should be an alias for
        // the current staff's staffBounds.lower
        const currentBoundsLower = staves[i].staffBounds.lower.id;
        const nextBoundsUpper = staves[i + 1].staffBounds.upper.id;
        // What's the pitch an octave above the top of the next staff?
        // This pitch will overlap the current staff's bottom line pitch.
        const nextPitchAtCurrentBoundsLower = `${staves[i + 1].prefix}${getDiatonicTransposition(nextBoundsUpper, space ?? INTER_STAFF_SPACE)}`;
        const nextIndexAtCurrentBoundsLower = staves[
          i + 1
        ].pitchesArray.findIndex(
          (pitch) => pitch === nextPitchAtCurrentBoundsLower,
        );

        const currentIndexAtCurrentBoundsLower = staves[
          i
        ].pitchesArray.findIndex(
          (pitch) => pitch === `${staves[i].prefix}${currentBoundsLower}`,
        );
        // The current staff's pitch index at which we start zipping things together.
        const currentIndexOfNextPitchesStart =
          currentIndexAtCurrentBoundsLower - nextIndexAtCurrentBoundsLower;
        const overlapArray = Array.from(
          {
            length:
              Math.max(
                staff.pitchesArray.length,
                staves[i + 1].pitchesArray.length,
              ) +
              currentIndexOfNextPitchesStart -
              Math.abs(
                staff.pitchesArray.length - staves[i + 1].pitchesArray.length,
              ),
            // staves[i].pitchesArray.length +
            // staves[i + 1].pitchesArray.length -
            // currentIndexOfNextPitchesStart,
          },
          (_, i) => i,
        );

        let definedRowsSoFar = [...acc.result];

        for (const rowIndex of overlapArray) {
          definedRowsSoFar[rowIndex + acc.index] =
            definedRowsSoFar[rowIndex + acc.index]?.length > 0
              ? [...definedRowsSoFar[rowIndex + acc.index]]
              : [];
          definedRowsSoFar[rowIndex + acc.index].push(
            ...(rowIndex < currentIndexOfNextPitchesStart
              ? [staves[i].pitchesArray[rowIndex]]
              : rowIndex >= staff.pitchesArray.length
                ? [
                    staves[i + 1].pitchesArray[
                      rowIndex - currentIndexOfNextPitchesStart
                    ],
                  ]
                : [
                    staves[i].pitchesArray[rowIndex],
                    staves[i + 1].pitchesArray[
                      rowIndex - currentIndexOfNextPitchesStart
                    ],
                  ]),
          );
        }

        return {
          result: definedRowsSoFar,
          index: acc.index + currentIndexOfNextPitchesStart,
        };
      } else {
        return acc;
      }
    },
    { result: [], index: 0 },
  ).result;

  return result.reduce(
    (acc, curr, index) =>
      index !== result.length
        ? `${acc}[${curr.join(" ")}] 0.125rem `
        : `${acc}[${curr.join(" ")}]`,
    "",
  );
}
