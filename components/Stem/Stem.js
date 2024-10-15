import { useMemo } from "react";
import clsx from "clsx";

import Item from "../Item";

import { getStem } from "../../utils/methods";

import styles from "./Stem.module.css";
import { DURATION } from "../../constants/durations";
const metadata = require("./../../public/fonts/bravura/bravura_metadata.json");
const range = require("./../../fixtures/pitch/range.json");

const flagMap = {
  key: ["eighth", "16th", "32nd", "64th"],
  value: [
    { down: "", up: "", upShort: "" },
    { down: "", up: "", upShort: "" },
    { down: "", up: "", upShort: "" },
    { down: "", up: "", upShort: "" },
  ],
};

/**
 * An unbeamed Stem should roughly span an octave.
 * If a stem is on or below the Staff's midline, stem should be pointed down.
 * A beamed Stem's direction should be away from the beamed note farthest from the midline.
 */
export default function Stem({
  beam = null,
  rangeClef,
  direction = null,
  event,
  notes,
  pitchPrefix = "",
}) {
  const stem = useMemo(
    () =>
      getStem(
        notes,
        rangeClef.staffLinePitches[2].id,
        direction,
        beam,
        pitchPrefix,
      ),
    [beam, direction, notes, pitchPrefix, rangeClef.staffLinePitches],
  );
  const _stemDirection = useMemo(
    () => beam?.direction ?? direction ?? stem.direction,
    [beam?.direction, direction, stem.direction],
  );
  const _stemColumn = useMemo(
    () =>
      `e${event.position.start}${_stemDirection === "up" ? "-ste-up" : "-not"}`,
    [event.position.start, _stemDirection],
  );
  const style = useMemo(
    () => ({
      "--column": _stemColumn,
      "--pitch": `${stem.row.start}/${stem.row.end}`,
    }),
    [_stemColumn, stem.row.end, stem.row.start],
  );

  return (
    <>
      <svg
        viewBox={`0 0 1 1`}
        width={`${metadata.engravingDefaults.stemThickness / 4}rem`}
        height="100%"
        preserveAspectRatio="none"
        overflow="visible"
        className={clsx([
          styles.stem,
          _stemDirection === "up" ? styles.up : styles.down,
        ])}
        style={style}
      >
        <rect x={0} y={0} width={1} height={1} fill="currentColor" />
      </svg>
      {/** TODO: Flag, if not part of a beam group */}
      {/** Flag, if less than quarter */}
      {!beam && event.dimensions.length < DURATION.QUARTER && (
        <Item
          className={clsx(
            styles.flag,
            _stemDirection === "up" ? styles.up : styles.down,
          )}
          column={_stemColumn}
          pitch={`${stem.row.start}/${stem.row.end}`}
        >
          {
            flagMap.value[
              flagMap.key.findIndex((k) => k === event.duration.base)
            ][_stemDirection]
          }
        </Item>
      )}
    </>
  );
}
