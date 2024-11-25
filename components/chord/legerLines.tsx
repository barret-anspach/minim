import { useMemo } from "react";
import clsx from "clsx";

import Item from "../item";

import { getLegerLines } from "../../utils/methods";
import { DURATION } from "../../constants/durations";

import styles from "./styles.module.css";
import { Minim } from "../../types/minim";
import { MNX } from "../../types/mnx";

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
