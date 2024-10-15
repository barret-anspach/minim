import { useMemo } from "react";
import clsx from "clsx";

import AugmentationDots from "../Chord/AugmentationDots";
import Item from "../Item";

import {
  getNoteGlyph,
  getPitchString,
  isNoteOnLine,
} from "../../utils/methods";

import styles from "./Note.module.css";

export default function Note({
  className,
  column,
  event,
  id,
  note,
  noteIndex,
  staffLinePitch,
  pitchPrefix,
}) {
  const key = useMemo(() => `${id}_not${noteIndex}`, [id, noteIndex]);
  const pitch = useMemo(
    () => `${pitchPrefix}s${note.staff}${getPitchString(note)}`,
    [note, pitchPrefix],
  );
  const noteOnLine = useMemo(
    () => isNoteOnLine(staffLinePitch, note),
    [staffLinePitch, note],
  );
  return (
    <>
      <Item
        className={clsx(styles.notehead, className)}
        key={key}
        column={column}
        pitch={pitch}
      >
        {getNoteGlyph(event.duration.base)}
      </Item>
      <AugmentationDots
        className={clsx(noteOnLine && styles.up)}
        event={event}
        prefix={key}
        pitch={pitch}
      />
    </>
  );
}
