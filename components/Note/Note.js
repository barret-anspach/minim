import clsx from 'clsx';

import Item from "../Item";

import { noteheadMap } from "../../constants/noteheads";
import { getPitchString } from "../../utils/methods";

import styles from './Note.module.css';

export default function Note({
  className,
  column,
  event,
  note,
  noteIndex,
  id,
}) {
  const pitch = getPitchString(note);
  return (
    <Item
      className={clsx(styles.notehead, className)}
      key={`${id}_not${noteIndex}`}
      column={column}
      pitch={pitch}
    >
      {noteheadMap.value[noteheadMap.key.indexOf(event.duration.base)]}
    </Item>
  )
};
