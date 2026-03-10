import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import { getLegerLines } from "./../../utils/methods.js";
import { DURATION } from "./../../constants/durations.js";

import styles from "./styles.module.css";
import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";
import { cx } from "./../../utils/classNames";

type LegerLinesProps = {
  event: Minim.Event.DecoratedDefaultEvent;
  id: MNX.Defs.ID;
};

export default function LegerLines({ event, id }: LegerLinesProps) {
  const legerLines = useMemo(
    () =>
      getLegerLines({
        clef: event.clef,
        clefs: event.clefs,
        notes: event.notes!,
        pitchPrefix: id,
      }),
    [event.clef, event.clefs, id, event.notes],
  );
  const column = useMemo(
    () => `e${(event.position as Minim.Bounds).start}-not`,
    [event.position],
  );

  return (
    <>
      {legerLines &&
        legerLines.length > 0 &&
        legerLines.map((legerLine, legerLineIndex) => (
          <Item
            data-leger-line
            key={`${id}_leg${legerLineIndex}`}
            className={cx(
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
