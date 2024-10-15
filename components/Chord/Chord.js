import { Fragment, useMemo } from "react";
import clsx from "clsx";

import Item from "../Item";
import LegerLines from "./LegerLines";
import Note from "../Note";
import Stem from "../Stem";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import { getPitches } from "../../utils/getPitches";
import { getPitchString, isNoteOnLine } from "../../utils/methods";

import styles from "./Chord.module.css";
import Rest from "../Note/Rest";
import Accidental from "./Accidental";

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
  const { rangeClef } = useMemo(() => getPitches(clef), [clef]);
  const beamEvent = useMemo(
    () =>
      flows[event.flowId].beamEvents.find(
        (beamEvent) => beamEvent.renderId === event.renderId,
      ),
    [event.flowId, event.renderId, flows],
  );

  return (
    <Fragment key={id}>
      <LegerLines event={event} id={id} />
      <Rest event={event} id={id} />

      {event.notes &&
        event.notes.map((note, noteIndex) => (
          <Fragment key={`${id}_not${noteIndex}`}>
            {/** Accidentals */}
            <Accidental
              event={event}
              note={note}
              noteIndex={noteIndex}
              id={id}
              clefType={rangeClef.type}
            />
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
              staffLinePitch={rangeClef.staffLinePitches[0].id}
            />
            {/** TODO: Articulations */}
          </Fragment>
        ))}
      {event.notes && (
        <Stem
          rangeClef={rangeClef}
          direction={beamEvent?.beam.direction ?? null}
          event={event}
          notes={event.notes}
          pitchPrefix={event.flowId}
          beam={beamEvent?.beam ?? null}
        />
      )}
    </Fragment>
  );
}
