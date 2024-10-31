import { useMemo } from "react";
import clsx from "clsx";
import Item from "../item";
import { DURATION } from "../../constants/durations";
import {
  getDiatonicTransposition,
  getStem,
  getSubBeamCountFromBeamEvent,
} from "../../utils/methods";
import styles from "./styles.module.css";
const metadata = require("../../public/fonts/bravura/bravura_metadata.json");

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
  const _beamColumn = `e${event.position.start}-not / e${event.position.start}-ste-up`;
  const style = useMemo(
    () => ({
      "--column": _stemColumn,
      "--pitch": `${stem.row.start}/${stem.row.end}`,
    }),
    [_stemColumn, stem.row.end, stem.row.start],
  );

  return event.dimensions.length < DURATION.WHOLE ? (
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
      {/* TODO: temporary fix; whole beaming situation needs an overhaul. */}
      {beam && event.dimensions.length < DURATION.EIGHTH && (
        <Item
          className={clsx(
            styles.beam,
            _stemDirection === "up" ? styles.above : styles.below,
          )}
          column={_beamColumn}
          pitch={`${pitchPrefix}s${beam.staff}`.concat(
            getDiatonicTransposition(
              beam.pitch,
              getSubBeamCountFromBeamEvent(event) *
                (beam.direction === "up" ? 2 : -2),
            ),
          )}
        />
      )}
    </>
  ) : null;
}
