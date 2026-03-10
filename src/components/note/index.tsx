import { useMemo } from "react";

import AugmentationDots from "./../../components/chord/augmentationDots.js";
import Item from "./../../components/item/index.js";

import {
  getNoteGlyph,
  getPitchString,
  isNoteOnLine,
} from "./../../utils/methods.js";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";
import { cx } from "./../../utils/classNames";

type NoteProps = {
  column: Minim.Grid.Column;
  event: Minim.Event.DecoratedDefaultEvent;
  id: MNX.Defs.ID;
  note: MNX.Defs.Note;
  noteIndex: Minim.Defs.Index;
  staffLinePitch: Minim.Defs.PitchString;
  pitchPrefix: string;
  className?: string;
};

export default function Note({
  className,
  column,
  event,
  id,
  note,
  noteIndex,
  staffLinePitch,
  pitchPrefix,
}: NoteProps) {
  const key = useMemo(() => `${id}_not${noteIndex}`, [id, noteIndex]);
  const pitch = useMemo(
    () => `${pitchPrefix}s${note.staff ?? 1}${getPitchString(note)}`,
    [note, pitchPrefix],
  );
  const noteOnLine = useMemo(
    () => isNoteOnLine(staffLinePitch, note),
    [staffLinePitch, note],
  );
  return (
    <>
      {/* <Duration
        data-note-duration
        column={column}
        event={event}
        id={`${id}_dur${noteIndex}`}
        note={note}
        noteIndex={noteIndex}
        pitchPrefix={pitchPrefix}
      /> */}
      <Item
        data-note
        className={cx(styles.notehead, className)}
        key={key}
        column={column}
        pitch={pitch}
      >
        {getNoteGlyph(event.duration!.base)}
      </Item>
      <AugmentationDots
        className={cx(noteOnLine && styles.up)}
        event={event}
        prefix={key}
        pitch={pitch}
      />
    </>
  );
}
