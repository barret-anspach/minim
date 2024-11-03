import { useMemo } from "react";
import clsx from "clsx";
import Chord from "../chord";
import { toNumericalDuration, durationBeforeIndex } from "../../utils/methods";
import styles from "./styles.module.css";

const metadata = require("../../public/fonts/bravura/bravura_metadata.json");

const tupletMap = {
  key: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  value: ["", "", "", "", "", "", "", "", "", ""],
};

export default function Tuplet({
  clef,
  event,
  events,
  eventIndex,
  id,
  measureIndex,
}) {
  const tuplet = {
    start: durationBeforeIndex(eventIndex, events),
    outer: toNumericalDuration(event.oute.duration) * event.outer.multiple,
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

  if (event.type !== "tuplet") return;
  return (
    <>
      {event.content.map((tupletEvent, tupletEventIndex, tupletEvents) =>
        tupletEvent.notes.map((note, noteIndex) => (
          <Chord
            key={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
            id={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
            clef={clef}
            event={tupletEvent}
            eventIndex={tupletEventIndex}
            events={tupletEvents}
            measureIndex={measureIndex}
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
            strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}rem`}
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
            strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}rem`}
            vectorEffect={"non-scaling-stroke"}
          />
        </svg>
      </div>
    </>
  );
}
