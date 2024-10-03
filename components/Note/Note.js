import clsx from "clsx";

import Item from "../Item";

import { getNoteGlyph, getPitchString } from "../../utils/methods";

import styles from "./Note.module.css";

export default function Note({
  className,
  column,
  event,
  id,
  note,
  noteIndex,
  pitchPrefix,
}) {
  const pitch = getPitchString(note);
  return (
    <Item
      className={clsx(styles.notehead, className)}
      key={`${id}_not${noteIndex}`}
      column={column}
      pitch={`${pitchPrefix}s${note.staff}${pitch}`}
    >
      {getNoteGlyph(event.duration.base)}
    </Item>
  );
}
