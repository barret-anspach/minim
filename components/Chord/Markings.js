import { useCallback, useMemo } from "react";
import clsx from "clsx";
import Item from "../Item";
import styles from "./Chord.module.css";
import {
  getDiatonicInterval,
  getDiatonicTransposition,
  getHighestPitch,
  getLowestPitch,
  isNoteOnLine,
} from "../../utils/methods";

// N.B. keys are in sorted stack order for position === "up".
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
  stress: "above",
  unstress: "above",
  laissezVibrer: "above",
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
  outside: ["accent", "accentStaccato", "tenutoAccent", "tenutoStaccato"],
  above: [
    "stress",
    "unstress",
    "laissezVibrer",
    "marcato",
    "marcatoStaccato",
    "marcatoTenuto",
  ],
};

// TODO: reconsider how placement is done, esp. when considering injecting
// dynamics into the placement scheme.
export default function Markings({
  beam,
  chordBounds,
  event,
  id,
  pitchPrefix,
  rangeClef,
  stem,
}) {
  const staffBounds = {
    upper: rangeClef.staffLinePitches[0].id,
    lower: rangeClef.staffLinePitches.at(-1).id,
  };
  const getStemDirection = useCallback(
    () => beam.direction ?? stem.direction,
    [beam.direction, stem.direction],
  );
  const markingPitch = useCallback(
    (region) => {
      const highestPitch = getHighestPitch(
        beam.pitch ?? stem.pitch.start ?? chordBounds.upper,
        staffBounds.upper,
      );
      const lowestPitch = getLowestPitch(
        beam.pitch ?? stem.pitch.start ?? chordBounds.lower,
        staffBounds.lower,
      );

      if (event.partVoices > 0) {
        const pitch =
          event.voice % event.partVoices === 1 ? highestPitch : lowestPitch;
        return {
          up: pitch,
          down: pitch,
        };
      }

      switch (region) {
        case "note": {
          return { up: chordBounds.upper, down: chordBounds.lower };
        }
        case "above": {
          return {
            up: highestPitch,
            down: highestPitch,
          };
        }
        case "outside": {
          return {
            up: lowestPitch,
            down: lowestPitch,
          };
        }
      }
    },
    [
      beam.pitch,
      chordBounds.lower,
      chordBounds.upper,
      event.partVoices,
      event.voice,
      staffBounds.lower,
      staffBounds.upper,
      stem.pitch.start,
    ],
  );
  const markingsByPosition = Object.entries(event.markings).reduce(
    (acc, [name, options], index) => {
      const region = regions[name];
      const pitch = markingPitch(region);
      const stemDirection = options.pointing ?? getStemDirection();
      const noteOnLine = isNoteOnLine(
        rangeClef.staffLinePitches[0].id,
        chordBounds[stemDirection === "up" ? "lower" : "upper"],
      );
      const position =
        options.pointing ??
        (event.partVoices > 0
          ? event.voice % event.partVoices === 1
            ? "up"
            : "down"
          : region === "above"
            ? "up"
            : stemDirection === "up"
              ? "down"
              : "up");
      const marking = {
        name,
        properties: {
          column: `e${event.position.start}-not`,
          glyph:
            articulationMap[position === "up" ? "above" : "below"][
              articulationMap.shorthand.indexOf(name)
            ],
          key: `${id}_art_${region}${index}`,
          noteOnLine,
          noteWithinStaff:
            getDiatonicInterval(
              staffBounds.upper,
              chordBounds[stemDirection === "up" ? "lower" : "upper"],
            ) < 0 &&
            getDiatonicInterval(
              chordBounds[stemDirection === "up" ? "lower" : "upper"],
              staffBounds.lower,
            ) > 0,
          pitch: pitch[position],
          position,
          region,
          rowPrefix: `${pitchPrefix}s${beam.staff ?? stem.noteStaff}`,
          stemDirection,
        },
        options: {
          ...options,
        },
      };
      return !acc[position]
        ? {
            ...acc,
            [position]: [marking],
          }
        : {
            ...acc,
            [position]: [...acc[position], marking],
          };
    },
    {},
  );
  const markings = useMemo(() => {
    return Object.entries(markingsByPosition).reduce(
      (acc, [position, markingsAtPosition]) => [
        ...acc,
        markingsAtPosition
          .sort((a, b) => {
            const lookup =
              position === "up"
                ? articulationMap.shorthand
                : articulationMap.shorthand.reverse();
            return lookup.indexOf(a.name) - lookup.indexOf(b.name);
          })
          .reduce((markingsAcc, { name, properties }, index) => {
            const interval =
              index === 0
                ? properties.region === "note" &&
                  properties.noteOnLine &&
                  properties.noteWithinStaff
                  ? properties.position === "up"
                    ? 3
                    : -3
                  : properties.position === "up"
                    ? 2
                    : -2
                : properties.position === "up"
                  ? 1
                  : -1;
            const pitch = getDiatonicTransposition(properties.pitch, interval);
            const row = `${properties.rowPrefix}${pitch}`;

            return index === 0
              ? {
                  column: properties.column,
                  position: properties.position,
                  key: properties.key,
                  name,
                  pitch,
                  row,
                  glyphs: [properties.glyph],
                }
              : {
                  ...markingsAcc,
                  glyphs: [...markingsAcc.glyphs, properties.glyph],
                };
          }, {}),
      ],
      [],
    );
  }, [markingsByPosition]);

  return (
    <>
      {markings.map((marking) => (
        <Item
          key={marking.key}
          className={clsx(styles.articulation, styles[marking.position])}
          column={marking.column}
          pitch={marking.row}
        >
          {marking.glyphs.map((glyph, glyphIndex) => (
            <span key={`${marking.key}_glyph${glyphIndex}`}>{glyph}</span>
          ))}
        </Item>
      ))}
    </>
  );
}
