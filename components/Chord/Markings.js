import { Fragment, useCallback, useMemo } from "react";
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
import { dynamicMap } from "../Dynamic/Dynamic";

const metadata = require("../../public/fonts/bravura/bravura_metadata.json");

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
  dynamic: "below",
  staccatissimo: "note",
  staccatissimoWedge: "note",
  staccatissimoStroke: "note",
  stress: "above",
  unstress: "above",
  laissezVibrer: "above",
  marcato: "above",
  marcatoStaccato: "above",
  marcatoTenuto: "above",
  accent: "outside",
  accentStaccato: "outside",
  tenuto: "note",
  tenutoStaccato: "outside",
  tenutoAccent: "outside",
  staccato: "note",
};

// TODO: reconsider how placement is done, esp. when considering injecting
// dynamics into the placement scheme.
export default function Markings({
  beam,
  chordBounds,
  event,
  id,
  period,
  pitchPrefix,
  rangeClef,
  stem,
}) {
  const staffBounds = {
    upper: rangeClef.staffLinePitches[0].id,
    lower: rangeClef.staffLinePitches.at(-1).id,
  };
  // For each staff of the current part, are there multiple voices?
  // voiceNumbersByPartStaff[event.staff].length === 1 ? single : multiple.
  const voiceNumbersByPartStaff = Object.values(
    period.flows[event.flowId],
  ).reduce(
    (acc, e) =>
      !["displayEvent"].includes(e.type) && event.partIndex === e.partIndex
        ? {
            ...acc,
            [e.staff]: [...new Set([...(acc[e.staff] ?? []), e.voice])],
          }
        : acc,
    {},
  );
  const getStemDirection = useCallback(
    () => beam?.direction ?? stem?.direction ?? "down",
    [beam?.direction, stem?.direction],
  );
  const markingPitch = useCallback(
    (region) => {
      const direction = getStemDirection();
      const highestPitch = getHighestPitch(
        event.rest
          ? rangeClef.midline
          : direction === "up"
            ? (beam?.pitch ?? stem?.pitch.start ?? chordBounds.upper)
            : chordBounds.upper,
        staffBounds.upper,
      );
      const lowestPitch = getLowestPitch(
        event.rest
          ? rangeClef.midline
          : direction === "down"
            ? (beam?.pitch ?? stem?.pitch.start ?? chordBounds.lower)
            : chordBounds.lower,
        staffBounds.lower,
      );
      if (
        event.partVoices > 0 &&
        voiceNumbersByPartStaff[event.staff].length > 1
      ) {
        // TODO: rests need to shift up/down when multipart staff
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
            up: highestPitch,
            down: lowestPitch,
          };
        }
        case "below": {
          return {
            up: lowestPitch,
            down: lowestPitch,
          };
        }
      }
    },
    [
      beam?.pitch,
      chordBounds?.lower,
      chordBounds?.upper,
      event.partVoices,
      event.rest,
      event.staff,
      event.voice,
      getStemDirection,
      rangeClef.midline,
      staffBounds.lower,
      staffBounds.upper,
      stem?.pitch.start,
      voiceNumbersByPartStaff,
    ],
  );
  const markingsByPosition = useMemo(
    () =>
      Object.entries(event.markings).reduce((acc, [name, options], index) => {
        const region = regions[name];
        const pitch = markingPitch(region);
        const stemDirection = options.pointing ?? getStemDirection();
        const noteOnLine = event.rest
          ? true // TODO: Not always true!!! Workaround for now.
          : isNoteOnLine(
              rangeClef.staffLinePitches[0].id,
              chordBounds[stemDirection === "up" ? "lower" : "upper"],
            );
        const position =
          options.pointing ??
          // Are there multiple voices on the event's staff?
          (event.partVoices > 0 &&
          voiceNumbersByPartStaff[event.staff].length > 1
            ? event.voice % event.partVoices === 1
              ? "up"
              : "down"
            : region === "below"
              ? "down"
              : region === "above"
                ? "up"
                : stemDirection === "up" // region === "note" or "outside"
                  ? "down"
                  : "up");
        const key =
          name === "dynamic"
            ? dynamicMap.key[dynamicMap.shorthand.indexOf(options.value)]
            : `${articulationMap.key[articulationMap.shorthand.indexOf(name)]}${
                position === "up" ? "Above" : "Below"
              }`;
        const height = metadata.glyphBBoxes[key]
          ? `${
              (metadata.glyphBBoxes[key].bBoxNE[1] -
                metadata.glyphBBoxes[key].bBoxSW[1]) /
              4
            }rem`
          : 0;
        const marking = {
          name,
          properties: {
            column: `e${event.position.start}-not`,
            item:
              options.type === "dynamic"
                ? {
                    type: "dynamic",
                    glyph:
                      dynamicMap.value[
                        dynamicMap.shorthand.indexOf(options.value)
                      ],
                    height,
                    key,
                  }
                : {
                    type: "marking",
                    glyph:
                      articulationMap[position === "up" ? "above" : "below"][
                        articulationMap.shorthand.indexOf(name)
                      ],
                    height,
                    key,
                  },
            key: `${id}_art_${region}${index}`,
            noteOnLine,
            noteWithinStaff: event.rest
              ? true // TODO: Not always true!!! Workaround for now.
              : getDiatonicInterval(
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
            rowPrefix: `${pitchPrefix}s${beam?.staff ?? stem?.noteStaff ?? options.staff}`,
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
      }, {}),
    [
      beam,
      chordBounds,
      event.markings,
      event.partVoices,
      event.position.start,
      event.rest,
      event.staff,
      event.voice,
      getStemDirection,
      id,
      markingPitch,
      pitchPrefix,
      rangeClef.staffLinePitches,
      staffBounds.lower,
      staffBounds.upper,
      stem,
      voiceNumbersByPartStaff,
    ],
  );
  const markings = useMemo(
    () =>
      Object.entries(markingsByPosition).reduce(
        (acc, [position, markingsAtPosition]) => [
          ...acc,
          markingsAtPosition
            .sort((a, b) => {
              const lookup =
                position === "up"
                  ? Object.keys(regions)
                  : Object.keys(regions).reverse();
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
              const pitch = getDiatonicTransposition(
                properties.pitch,
                interval,
              );
              const row = `${properties.rowPrefix}${pitch}`;

              return index === 0
                ? {
                    column: properties.column,
                    position: properties.position,
                    key: properties.key,
                    name,
                    pitch,
                    row,
                    items: [properties.item],
                  }
                : {
                    ...markingsAcc,
                    items: [...markingsAcc.items, properties.item],
                  };
            }, {}),
        ],
        [],
      ),
    [markingsByPosition],
  );

  return (
    <>
      {markings.map((marking) => (
        <Item
          key={marking.key}
          className={clsx(styles.markings, styles[marking.position])}
          column={marking.column}
          pitch={marking.row}
        >
          {marking.items.map((item, itemIndex) => (
            <span
              key={`${marking.key}_i${itemIndex}`}
              className={clsx(styles.articulation, styles[item.type])}
              style={{ height: item.height }}
            >
              {item.glyph}
            </span>
          ))}
        </Item>
      ))}
    </>
  );
}
