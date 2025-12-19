import { useMemo } from "react";
import clsx from "clsx";

import Chord from "./../../components/chord/index.js";

import {
  toNumericalDuration,
  durationBeforeIndex,
} from "./../../utils/methods.js";

import styles from "./styles.module.css";

import { MNX } from "./../../types/mnx/index.js";
import { Minim } from "./../../types/minim/index.js";

import metadata from "./../../../public/fonts/bravura/bravura_metadata.json";

const tupletMap = {
  key: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  value: ["", "", "", "", "", "", "", "", "", ""],
};

type TupletProps = {
  clef: MNX.Defs.Clef;
  event: Minim.Event.DecoratedTupletEvent;
  events: Minim.Event.EventItem[];
  eventIndex: Minim.Defs.Index;
  id: MNX.Defs.ID;
  period: Minim.Period.PeriodItem;
};

export default function Tuplet({
  clef,
  event,
  events,
  eventIndex,
  id,
  period,
}: TupletProps) {
  const tuplet = {
    start: durationBeforeIndex(eventIndex, events),
    outer: toNumericalDuration(event.outer.duration) * event.outer.multiple,
    inner: toNumericalDuration(event.inner.duration) * event.inner.multiple,
  };
  // TODO: Bracket row should be set to either top of Staff or uppermost bounds of TupletEvents (whichever higher), plus default padding
  const bracketPosition = useMemo(() => {
    const scalar = tuplet.outer / tuplet.inner;
    return {
      start: {
        column: `e ${tuplet.start + 1}`,
        row: "c6",
      },
      end: {
        column: `e ${tuplet.start + Math.ceil(tuplet.outer * scalar) + 1}`,
        row: "c6",
      },
    };
  }, [tuplet.inner, tuplet.outer, tuplet.start]);

  const style = useMemo(
    () => ({
      "--column": `${bracketPosition.start.column}/${bracketPosition.end.column}`,
      "--row": `${bracketPosition.start.row}/${bracketPosition.end.row}`,
    }),
    [
      bracketPosition.end.column,
      bracketPosition.end.row,
      bracketPosition.start.column,
      bracketPosition.start.row,
    ],
  );

  if (event.type !== "tuplet") return <></>;
  return (
    <>
      {event.content.map((tupletEvent, tupletEventIndex) =>
        tupletEvent.notes?.map((_, noteIndex) => (
          <Chord
            key={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
            id={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
            clef={clef}
            event={tupletEvent}
            period={period}
          />
        )),
      )}
      {/** WIP: Bracket, ratio, etc */}
      {/** TODO: Bracket should be able to skew … somehow */}
      {/** TODO: Ratio display will break when multiple exceeds 9 (e.g. "12:8") */}
      <div className={styles.tuplet} style={style}>
        <svg
          className={clsx(styles.bracket, styles.bracketLeft)}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,1 0,0 1,0"
            fill="none"
            stroke="black"
            strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}em`}
            vectorEffect={"non-scaling-stroke"}
          />
        </svg>
        <span className={styles.ratio}>
          {tupletMap.value[event.inner.multiple]}
          {tupletMap.value[event.outer.multiple]}
        </span>
        <svg
          className={clsx(styles.bracket, styles.bracketRight)}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,0 1,0 1,1"
            fill="none"
            stroke="black"
            strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}em`}
            vectorEffect={"non-scaling-stroke"}
          />
        </svg>
      </div>
    </>
  );
}
