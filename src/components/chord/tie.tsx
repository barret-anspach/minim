import Item from "./../../components/item/index.js";

import {
  isNoteOnLine,
  getDiatonicTransposition,
  getPitchString,
} from "./../../utils/methods.js";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";
import { cx } from "./../../utils/classNames";

type TieProps = {
  event: Minim.Event.Clip;
  note: MNX.Defs.Note;
  period: Minim.Period.PeriodItem;
  pitchPrefix: string;
  rangeClef: Minim.Range.Clef;
  stem: Minim.Defs.Stem;
};

export default function Tie({
  event,
  note,
  period,
  pitchPrefix,
  rangeClef,
  stem,
}: TieProps) {
  const column =
    event.clipPosition === "end"
      ? `e${(event.position as Minim.Bounds).start}-ste-up / e${period.position.end}-flow-end`
      : `e${(event.position as Minim.Bounds).start}-flow-start / e${period.position.start}-not`;
  const notePitchString = getPitchString(note);
  const noteOnLine = isNoteOnLine(rangeClef.staffLinePitches[0].id, note);
  const pitch = noteOnLine
    ? getDiatonicTransposition(
        notePitchString,
        stem.direction === "up" ? -1 : 1,
      )
    : notePitchString;
  const row = `${pitchPrefix}s${note.staff ?? 1}${pitch}`;
  return note.tie ? (
    <Item
      className={cx(
        styles.tie,
        styles[stem.direction === "up" ? "below" : "above"],
        styles[event.clipPosition],
      )}
      column={column}
      pitch={row}
    >
      <svg
        className={cx(
          styles.tieCurve,
          styles[stem.direction === "up" ? "below" : "above"],
          styles[event.clipPosition],
        )}
        overflow="visible"
        preserveAspectRatio="none"
        width="0.375rem"
        height="0.25rem"
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 12.5V11.5V10.5C6.60688 10.5 1.5 5.75893 1.5 0H0.5C0.5 6.90356 6.09644 12.5 13 12.5Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className={cx(
          styles.tieExtensionLine,
          styles[stem.direction === "up" ? "below" : "above"],
          styles[event.clipPosition],
        )}
        overflow="visible"
        preserveAspectRatio="none"
        width="100%"
        height="0.25rem"
        viewBox="0 0 1 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="10.5" width="1" height="2" fill="currentColor" />
      </svg>
    </Item>
  ) : null;
}
