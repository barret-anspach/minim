import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import { useKey } from "../../hooks/useKey.js";
import { getPitchString } from "./../../utils/methods.js";
import {
  AlterationValue,
  getAccidentalGlyph,
} from "./../../constants/accidentals.js";

import styles from "./styles.module.css";
import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";

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
  const key = useKey({ clefType, event, period });
  const accidentalKey = useMemo(
    () => `${id}_not${noteIndex}_acc`,
    [id, noteIndex],
  );
  const column = useMemo(
    () => `e${(event.position as Minim.Bounds).start}-acc`,
    [event.position],
  );
  const pitch = useMemo(
    () => `${pitchPrefix}s${note.staff ?? 1}${getPitchString(note)}`,
    [pitchPrefix, note],
  );
  const glyph = useMemo(
    () => getAccidentalGlyph(note.pitch.alter as AlterationValue),
    [note.pitch.alter],
  );

  return note.pitch.alter && !key?.accidentalStep.includes(note.pitch.step) ? (
    <Item
      data-accidental
      key={accidentalKey}
      className={styles.accidental}
      column={column}
      pitch={pitch}
    >
      <span className={styles.inner}>{glyph}</span>
    </Item>
  ) : null;
}
