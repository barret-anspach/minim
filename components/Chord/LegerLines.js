import { useMemo } from "react";
import clsx from "clsx";

import Item from "../Item";

import { getLegerLines } from "../../utils/methods";
import { DURATION } from "../../constants/durations";

import styles from "./Chord.module.css";

export default function LegerLines({ event, id }) {
  const legerLines = useMemo(
    () =>
      getLegerLines({
        clef: event.clef,
        clefs: event.clefs,
        notes: event.notes,
        pitchPrefix: id,
      }),
    [event.clef, event.clefs, id, event.notes],
  );
  const column = useMemo(
    () => `e${event.position.start}-not`,
    [event.position.start],
  );

  return (
    <>
      {legerLines &&
        legerLines.length > 0 &&
        legerLines.map((legerLine, legerLineIndex) => (
          <Item
            key={`${id}_leg${legerLineIndex}`}
            className={clsx(
              styles.legerLine,
              event.dimensions.length >= DURATION.WHOLE && styles.wide,
            )}
            column={column}
            pitch={legerLine.pitch}
          />
        ))}
    </>
  );
}
