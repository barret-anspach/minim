import { useMemo, useRef } from "react";
import clsx from "clsx";

import Item from "../Item";

import useVars from "../../hooks/useVars";
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
  clef,
  direction = null,
  event,
  notes,
  pitchPrefix = "",
}) {
  const stemRef = useRef(null);
  const _clef = Object.values(range.clefs).find((v) => clef.sign === v.sign);
  const stem = getStem(
    notes,
    _clef.staffLinePitches[2].id,
    direction,
    beam,
    pitchPrefix,
  );
  const _stemDirection = direction ?? stem.direction;
  const _stemColumn = useMemo(
    () =>
      `e${event.position.start}${_stemDirection === "up" ? "-ste-up" : "-not"}`,
    [event.position.start, _stemDirection],
  );

  useVars({
    varRef: stemRef,
    key: "--column",
    value: _stemColumn,
  });
  useVars({
    varRef: stemRef,
    key: "--pitch",
    value: `${stem.row.start}/${stem.row.end}`,
  });

  return (
    <>
      <svg
        ref={stemRef}
        viewBox={`0 0 1 1`}
        width={`${metadata.engravingDefaults.stemThickness / 4}rem`}
        height="100%"
        preserveAspectRatio="none"
        overflow="visible"
        className={clsx([
          styles.stem,
          _stemDirection === "up" ? styles.up : styles.down,
        ])}
      >
        <rect x={0} y={0} width={1} height={1} />
      </svg>
      {/** TODO: Flag, if not part of a beam group */}
      {/** Flag, if less than quarter */}
      {event.dimensions.length < DURATION.QUARTER && (
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
