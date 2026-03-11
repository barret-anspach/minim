import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import {
  getDurationFromNoteValueQuantity,
  getPitchString,
} from "./../../utils/methods.js";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";
import { cx } from "./../../utils/classNames.js";

type NoteProps = {
  column: Minim.Grid.Column;
  event: Minim.Event.DecoratedDefaultEvent;
  id: MNX.Defs.ID;
  noteIndex: Minim.Defs.Index;
  pitchPrefix: string;
  className?: string;
  note?: MNX.Defs.Note;
};

// TODO: Duration will have to "wrap" between periods if it's longer than the Period. See beams and how they're handled.

export default function Duration({
  className,
  column,
  event,
  id,
  note,
  noteIndex,
  pitchPrefix,
  ...rest
}: NoteProps) {
  const key = useMemo(() => `${id}_not${noteIndex}`, [id, noteIndex]);
  const pitch = useMemo(
    () =>
      note
        ? `${pitchPrefix}s${note.staff ?? 1}${getPitchString(note)}`
        : pitchPrefix,
    [note, pitchPrefix],
  );
  const col = useMemo(() => {
    return `${column} / e${noteIndex + getDurationFromNoteValueQuantity({ duration: event.duration, multiple: 1 })}`;
  }, [column, event.duration]);

  return (
    <Item
      data-duration
      className={cx(styles.duration, className)}
      key={key}
      column={col}
      pitch={pitch}
      {...rest}
    />
  );
}
