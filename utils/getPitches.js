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
    range.gamut.base.findIndex((p) => p.id === lowerBound.base.id) + 1,
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
      (acc, curr) => [...acc, `${prefix ?? ""}${curr.id}`],
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

const SPACE_BETWEEN_STAVES_IN_PART = 12;
const SPACE_BETWEEN_PARTS = 18;
const SPACE_BETWEEN_FLOWS = 24;
const defaultOptions = {
  staffSpace: SPACE_BETWEEN_STAVES_IN_PART,
  partSpace: SPACE_BETWEEN_PARTS,
  flowSpace: SPACE_BETWEEN_FLOWS,
};

// overlap any number of staves' named (pitched) grid rows to render appropriate inter-staff spacing.
export function overlapStaffRows(staves, options = defaultOptions) {
  const result = staves.reduce(
    (acc, staff, i, staves) => {
      // Compare only two staves at a time.
      if (i + 1 !== staves.length) {
        const space =
          staff.flowId !== staves[i + 1].flowId
            ? options.flowSpace
            : staff.partIndex !== staves[i + 1].partIndex
              ? options.partSpace
              : options.staffSpace;
        // figure out which of the next staff's pitch rows should be
        // an alias for the current staff's staffBounds.lower.id.
        const currentBoundsLower = staff.staffBounds.lower.id;
        const nextBoundsUpper = staves[i + 1].staffBounds.upper.id;
        // What's the pitch an octave above the top of the next staff?
        // This pitch will overlap the current staff's bottom line pitch.
        const nextPitchAtCurrentBoundsLower = `${staves[i + 1].prefix}${getDiatonicTransposition(nextBoundsUpper, space ?? SPACE_BETWEEN_STAVES_IN_PART)}`;
        const nextIndexAtCurrentBoundsLower = staves[
          i + 1
        ].pitchesArray.findIndex(
          (pitch) => pitch === nextPitchAtCurrentBoundsLower,
        );

        const currentIndexAtCurrentBoundsLower = staves[
          i
        ].pitchesArray.findIndex(
          (pitch) => pitch === `${staff.prefix}${currentBoundsLower}`,
        );
        // The current staff's pitch index at which we start zipping things together.
        const currentIndexOfNextPitchesStart =
          currentIndexAtCurrentBoundsLower - nextIndexAtCurrentBoundsLower;
        // we're offsetting the next staff's pitches against the first staff's.
        const overlapArray = Array.from(
          {
            length: Math.max(
              staff.pitchesArray.length,
              staves[i + 1].pitchesArray.length +
                currentIndexOfNextPitchesStart,
            ),
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
              ? [staff.pitchesArray[rowIndex]]
              : rowIndex >= staff.pitchesArray.length
                ? [
                    staves[i + 1].pitchesArray[
                      rowIndex - currentIndexOfNextPitchesStart
                    ],
                  ]
                : [
                    staff.pitchesArray[rowIndex],
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
