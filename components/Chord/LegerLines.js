import { useMemo } from "react";

import Item from "../Item";

import { getLegerLines } from "../../utils/methods";
import styles from "./Chord.module.css";

export default function LegerLines({ event, id }) {
  const legerLines = useMemo(
    () =>
      getLegerLines({
        clef: event.clef,
        clefs: event.clefs,
        notes: event.notes,
        pitchPrefix: event.flowId,
      }),
    [event.clef, event.clefs, event.flowId, event.notes],
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
            className={styles.legerLine}
            column={column}
            pitch={legerLine.pitch}
          />
        ))}
    </>
  );
}
