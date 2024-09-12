import Item from "../Item";

import { noteheadMap } from "../../constants/noteheads";
import { toDurationFromArray } from "../../utils/methods";
import styles from './Note.module.css';

export default function Note({
  column,
  event,
  eventIndex,
  events,
  note,
  noteIndex,
  id,
}) {
  const pitch = `${note.pitch.step.toLowerCase()}${note.pitch.octave}`;
  return (
    <>
      {/** Accidentals */}
      <Item
        className={styles.note}
        key={`${id}_not${noteIndex}`}
        column={column ?? `e ${toDurationFromArray(eventIndex, events) + 1}`}
        pitch={pitch}
      >
        <span className={styles.notehead}>
          {noteheadMap.value[noteheadMap.key.indexOf(event.duration.base)]}
        </span>
      </Item>
    </>
  )
};
