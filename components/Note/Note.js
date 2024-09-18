import Item from "../Item";

import { noteheadMap } from "../../constants/noteheads";
import { getPitchString, toDurationFromArray } from "../../utils/methods";
import { getAccidentalGlyph } from "../../constants/accidentals";

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
  const pitch = getPitchString(note);
  // if alteration differs from key, or force-show accidentals is set,
  const accidental = note.pitch.alter ? getAccidentalGlyph(note.pitch.alter) : null;
  return (
    <>
      {/** TODO: Accidentals */}
      <Item
        className={styles.note}
        key={`${id}_not${noteIndex}`}
        column={column ?? `e ${toDurationFromArray(eventIndex, events) + 1}`}
        pitch={pitch}
      >
        {accidental && (
          <span className={styles.accidental}>{accidental}</span>
        )}
        <span className={styles.notehead}>
          {noteheadMap.value[noteheadMap.key.indexOf(event.duration.base)]}
        </span>
        {event.duration.dots && event.duration.dots > 0 && new Array(event.duration.dots).fill(null).map((_, dotIndex) => (
          <span key={`${id}_not${noteIndex}_dot${dotIndex}`} className={styles.dot}></span>
        ))}
      </Item>
    </>
  )
};
