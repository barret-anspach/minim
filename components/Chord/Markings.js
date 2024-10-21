import { Fragment, useCallback, useMemo } from "react";
import Item from "../Item";
import styles from "./Chord.module.css";
import {
  getDiatonicTransposition,
  getHighestPitch,
  isNoteOnLine,
} from "../../utils/methods";

const articulationMap = {
  key: [
    "articStaccatissimo",
    "articStaccatissimoWedge",
    "articStaccatissimoStroke",
    "articStress",
    "articUnstress",
    "articLaissezVibrer",
    "articMarcato",
    "articMarcatoStaccato",
    "articMarcatoTenuto",
    "articAccent",
    "articAccentStaccato",
    "articTenuto",
    "articTenutoStaccato",
    "articTenutoAccent",
    "articStaccato",
  ],
  shorthand: [
    "staccatissimo",
    "staccatissimoWedge",
    "staccatissimoStroke",
    "stress",
    "unstress",
    "laissezVibrer",
    "marcato",
    "marcatoStaccato",
    "marcatoTenuto",
    "accent",
    "accentStaccato",
    "tenuto",
    "tenutoStaccato",
    "tenutoAccent",
    "staccato",
  ],
  above: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
  below: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
};

// Regions into which a marking might be placed
const regions = {
  staccato: "note",
  staccatissimo: "note",
  staccatissimoWedge: "note",
  staccatissimoStroke: "note",
  tenuto: "note",
  accent: "outside",
  accentStaccato: "outside",
  tenutoAccent: "outside",
  tenutoStaccato: "outside",
  stress: "outside",
  unstress: "outside",
  laissezVibrer: "outside",
  marcato: "above",
  marcatoStaccato: "above",
  marcatoTenuto: "above",
  note: [
    "staccato",
    "staccatissimo",
    "staccatissimoWedge",
    "staccatissimoStroke",
    "tenuto",
  ],
  outside: [
    "accent",
    "accentStaccato",
    "tenutoAccent",
    "tenutoStaccato",
    "stress",
    "unstress",
    "laissezVibrer",
  ],
  above: ["marcato", "marcatoStaccato", "marcatoTenuto"],
};

export default function Markings({
  beam,
  chordBounds,
  event,
  id,
  pitchPrefix,
  rangeClef,
  stem,
}) {
  const markingDirection = useCallback(
    (articulation) => articulation.pointing ?? beam.direction ?? stem.direction,
    [beam.direction, stem.direction],
  );
  const staffBounds = {
    upper: rangeClef.bounds.find((n) => n.node === "upperBound").base.id,
    lower: rangeClef.bounds.find((n) => n.node === "lowerBound").base.id,
  };
  const groups = Object.entries(event.markings).reduce(
    (acc, [name, options]) => {
      return !acc[regions[name]]
        ? {
            ...acc,
            [regions[name]]: [{ name, options }],
          }
        : {
            ...acc,
            [regions[name]]: [...acc[regions[name]], { name, options }],
          };
    },
    {},
  );
  const markings = useMemo(() => {
    return Object.entries(groups).reduce(
      (acc, [groupName, group], articulationIndex, groups) => [
        ...acc,
        ...Object.entries(group).map(([index, { name, options }]) => {
          const direction = markingDirection(options);
          const interval = 1 * (direction === "up" ? 1 : -1);
          const notePitch = chordBounds[direction === "up" ? "upper" : "lower"];
          const outsidePitch = getHighestPitch(
            beam.pitch ?? stem.pitch.start ?? notePitch,
            staffBounds[direction === "up" ? "upper" : "lower"],
          );
          const abovePitch = getHighestPitch(
            beam.pitch ?? stem.pitch.start ?? notePitch,
            staffBounds.upper,
          );
          // const pitch =
          //   articulationIndex !== 0
          //     ? getDiatonicTransposition(
          //         acc[articulationIndex - 1].pitch,
          //         interval,
          //       )
          //     : getDiatonicTransposition(
          //         beam.pitch ??
          //           stem.pitch.start ??
          //           chordBounds[direction === "up" ? "upper" : "lower"],
          //         interval,
          //       );
          const pitch =
            articulationIndex !== 0
              ? getDiatonicTransposition(
                  acc[articulationIndex - 1].pitch,
                  interval,
                )
              : getDiatonicTransposition(
                  groupName === "above"
                    ? abovePitch
                    : groupName === "outside"
                      ? outsidePitch
                      : notePitch,
                  interval,
                );
          const row = `${pitchPrefix}s${beam.staff ?? stem.noteStaff}${pitch}`;
          const glyph =
            articulationMap[direction === "up" ? "above" : "below"][
              articulationMap.shorthand.indexOf(name)
            ];

          return {
            column: `e${event.position.start}-not`,
            direction,
            glyph,
            key: `${id}_art${articulationIndex}_${groupName}${index}`,
            name,
            pitch,
            row,
          };
        }),
      ],
      [],
    );
  }, [
    beam.pitch,
    beam.staff,
    chordBounds,
    event.position.start,
    groups,
    id,
    markingDirection,
    pitchPrefix,
    stem.noteStaff,
    stem.pitch.start,
  ]);

  return (
    <>
      {markings.map((marking) => (
        <Item
          key={marking.key}
          className={styles.articulation}
          column={marking.column}
          pitch={marking.row}
        >
          {marking.glyph}
        </Item>
      ))}
    </>
  );
}
