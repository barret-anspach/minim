import { useMemo } from "react";

import Item from "../Item";

import { useKey } from "../../hooks/useKey";
import { getPitchString } from "../../utils/methods";
import { getAccidentalGlyph } from "../../constants/accidentals";

import styles from "./Chord.module.css";

export default function Accidental({ clefType, event, id, note, noteIndex }) {
  const { accidentalStep } = useKey({ clefType, event });
  const key = useMemo(() => `${id}_not${noteIndex}_acc`, [id]);
  const column = useMemo(
    () => `e${event.position.start}-acc`,
    [event.position.start],
  );
  const pitch = useMemo(
    () => `${event.flowId}s${note.staff ?? 1}${getPitchString(note)}`,
    [event.flowId, note],
  );
  const glyph = useMemo(
    () => getAccidentalGlyph(note.pitch.alter),
    [note.pitch.alter],
  );

  return note.pitch.alter && !accidentalStep.includes(note.pitch.step) ? (
    <Item key={key} className={styles.accidental} column={column} pitch={pitch}>
      <span className={styles.inner}>{glyph}</span>
    </Item>
  ) : null;
}
