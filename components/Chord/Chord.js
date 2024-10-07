import { Fragment } from "react";
import clsx from "clsx";

import Item from "../Item";
import Note from "../Note";
import Stem from "../Stem";

import { useKey } from "../../hooks/useKey";
import { useMeasuresContext } from "../../contexts/MeasuresContext";
import { getPitches } from "../../utils/getPitches";
import { getAccidentalGlyph } from "../../constants/accidentals";
import {
  getLegerLines,
  getPitchString,
  getRestGlyph,
  isNoteOnLine,
} from "../../utils/methods";

import styles from "./Chord.module.css";

// TODO: Should handle
//         - display one or more noteheads
//         - drawing a single stem for multiple note values,
//         - adjusting note positions if adjacent pitches
/**
 * Convenience wrapper of note-related elements that are usually rendered together.
 */
export default function Chord({ clef, event, eventIndex, events, id }) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const { rangeClef } = getPitches(clef);
  const { accidentalStep } = useKey({ clefType: rangeClef.type, event });
  const legerLines = getLegerLines({
    clef: event.clef,
    clefs: event.clefs,
    notes: event.notes,
    pitchPrefix: event.flowId,
  });
  const beamEvent = flows[event.flowId].beamEvents.find(
    (beamEvent) => beamEvent.renderId === event.renderId,
  );

  // TODO: are pitches on a line or space? --> placement of augmentation dots, accidentals, etc.
  return (
    <Fragment key={id}>
      {/* Leger Lines */}
      {legerLines &&
        legerLines.length > 0 &&
        legerLines.map((legerLine, legerLineIndex) => (
          <Item
            key={`${id}_leg${legerLineIndex}`}
            className={styles.legerLine}
            column={`e${event.position.start}-not`}
            pitch={legerLine.pitch}
          />
        ))}
      {event.rest && (
        <Item
          key={`${id}_res`}
          column={`e${event.position.start}-not`}
          pitch={`${event.flowId}s${event.staff}b4`}
        >
          {getRestGlyph(event.duration.base)}
        </Item>
      )}
      {event.notes &&
        event.notes.map((note, noteIndex) => (
          <Fragment key={`${id}_not${noteIndex}`}>
            {/** Accidentals */}
            {note.pitch.alter && !accidentalStep.includes(note.pitch.step) && (
              <Item
                key={`${id}_not${noteIndex}_acc`}
                className={styles.accidental}
                column={`e${event.position.start}-acc`}
                pitch={`${event.flowId}s${note.staff}${getPitchString(note)}`}
              >
                <span className={styles.inner}>
                  {getAccidentalGlyph(note.pitch.alter)}
                </span>
              </Item>
            )}
            <Note
              key={`${id}_not${noteIndex}_notehead`}
              id={`${id}_not${noteIndex}_notehead`}
              column={`e${event.position.start}-not`}
              event={event}
              eventIndex={eventIndex}
              events={events}
              note={note}
              noteIndex={noteIndex}
              pitchPrefix={`${event.flowId}`}
            />
            {/** Articulations */}
          </Fragment>
        ))}
      {event.notes && (
        <Stem
          clef={clef}
          direction={beamEvent?.beam.direction ?? null}
          event={event}
          notes={event.notes}
          pitchPrefix={event.flowId}
          beam={beamEvent?.beam ?? null}
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
                column={`e${event.position.start}-ste-up `}
                pitch={`${event.flowId}s${note.staff}${getPitchString(note)}`}
              >
                
              </Item>
            ),
          ),
        )}
      {event.duration.dots &&
        event.duration.dots > 0 &&
        event.rest &&
        Array.from({ length: event.duration.dots }, (_, i) => i).map(
          (dotIndex) => (
            <Item
              key={`${id}_res_dot${dotIndex}`}
              className={styles.dot}
              column={`e${event.position.start}-ste-up`}
              pitch={`${event.flowId}s${event.staff}b4`}
            >
              
            </Item>
          ),
        )}
    </Fragment>
  );
}
