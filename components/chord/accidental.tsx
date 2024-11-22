import { useMemo } from "react";

import Item from "../item";

import { useKey } from "../../hooks/useKey";
import { getPitchString } from "../../utils/methods";
import { getAccidentalGlyph } from "../../constants/accidentals";

import styles from "./styles.module.css";
import { Minim } from "../../types/minim";
import { MNX } from "../../types/mnx";

type AccidentalProps = {
  clefType: Minim.Range.ClefType;
  event: Minim.Event.EventItem;
  id: MNX.Defs.ID;
  note: MNX.Defs.Note;
  noteIndex: Minim.Defs.Index;
  period: Minim.Period.PeriodItem;
  pitchPrefix: string;
};

export default function Accidental({
  clefType,
  event,
  id,
  note,
  noteIndex,
  period,
  pitchPrefix,
}: AccidentalProps) {
  const { accidentalStep } = useKey({ clefType, event, period });
  const key = useMemo(() => `${id}_not${noteIndex}_acc`, [id, noteIndex]);
  const column = useMemo(
    () => `e${(event.position as Minim.Bounds).start}-acc`,
    [event.position],
  );
  const pitch = useMemo(
    () => `${pitchPrefix}s${note.staff ?? 1}${getPitchString(note)}`,
    [pitchPrefix, note],
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
