import { Fragment, useEffect } from "react";
import clsx from "clsx";

import Item from "../Item";
import Note from "../Note";
import Stem from "../Stem";

import { useKey } from "../../hooks/useKey";
import { usePitches } from "../../hooks/usePitches";
import { getAccidentalGlyph } from "../../constants/accidentals";
import {
  getLegerLines,
  getPitchString,
  getRestGlyph,
  isNoteOnLine,
  toDurationFromArray,
} from "../../utils/methods";
import styles from "./Chord.module.css";

// TODO: Should handle
//         - display one or more noteheads
//         - drawing a single stem for multiple note values,
//         - adjusting note positions if adjacent pitches
/**
 * Convenience wrapper of note-related elements that are usually rendered together.
 */
export default function Chord({
  clef,
  event,
  eventIndex,
  events,
  id,
  measureIndex,
  staffIndex,
}) {
  const { staffBounds, rangeClef } = usePitches(clef);
  const { accidentalStep } = useKey({ clefType: rangeClef.type, measureIndex });
  const legerLines = event.notes
    ? getLegerLines(staffBounds, event.notes)
    : null;
  const _duration = toDurationFromArray(eventIndex, events) + 1;

  useEffect(() => {
    // Check if member of a beam
    if (event.beams) {
      const isBeamed = event.beams.map((beam) =>
        beam.events.includes(event.id),
      );
    }
  }, [event.id, event.beams]);

  if (event.notes && !event.notes.some((n) => n.staff === staffIndex + 1))
    return null;

  // TODO: are pitches on a line or space? --> placement of augmentation dots, accidentals, etc.
  return (
    <Fragment key={id}>
      {/** Leger Lines */}
      {legerLines &&
        legerLines.map((legerLine, legerLineIndex) => (
          <Item
            key={`${id}_leg${legerLineIndex}`}
            className={styles.legerLine}
            column={`c-not ${_duration}`}
            pitch={legerLine.pitch}
          />
        ))}
      {event.rest && (
        <Item key={`${id}_res`} column={`c-not ${_duration}`} pitch={"b4"}>
          {getRestGlyph(event.duration)}
        </Item>
      )}
      {event.notes &&
        event.notes.map((note, noteIndex) => (
          <Fragment key={`${id}_not${noteIndex}`}>
            {/** Articulations */}
            {note.pitch.alter && !accidentalStep.includes(note.pitch.step) && (
              <Item
                key={`${id}_not${noteIndex}_acc`}
                className={styles.accidental}
                column={`c-acc ${_duration}`}
                pitch={getPitchString(note)}
              >
                <span className={styles.inner}>
                  {getAccidentalGlyph(note.pitch.alter)}
                </span>
              </Item>
            )}
            <Note
              key={`${id}_not${noteIndex}_notehead`}
              id={`${id}_not${noteIndex}_notehead`}
              column={`c-not ${_duration}`}
              event={event}
              eventIndex={eventIndex}
              events={events}
              note={note}
              noteIndex={noteIndex}
            />
          </Fragment>
        ))}
      {event.notes && (
        <Stem
          clef={clef}
          duration={_duration}
          event={event}
          notes={event.notes}
        />
      )}
      {event.duration.dots &&
        event.duration.dots > 0 &&
        event.notes &&
        event.notes.map((note, noteIndex) =>
          Array.from({ length: event.duration.dots }, (_, i) => i).map(
            (dotIndex) => (
              <Item
                key={`${id}_not${noteIndex}_dot${dotIndex}`}
                className={clsx(
                  styles.dot,
                  isNoteOnLine(rangeClef.staffLinePitches[0].id, note) &&
                    styles.down,
                )}
                column={`c-ste-up ${_duration}`}
                pitch={getPitchString(note)}
              >
                
              </Item>
            ),
          ),
        )}
      {event.rest &&
        event.duration.dots &&
        event.duration.dots > 0 &&
        Array.from({ length: event.duration.dots }, (_, i) => i).map(
          (dotIndex) => (
            <Item
              key={`${id}_res_dot${dotIndex}`}
              className={styles.dot}
              column={`c-ste-up ${_duration}`}
              pitch={"b4"}
            >
              
            </Item>
          ),
        )}
    </Fragment>
  );
}
