import { Fragment, useMemo } from "react";
import clsx from "clsx";

import LegerLines from "./LegerLines";
import Note from "../Note";
import Stem from "../Stem";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import { getPitches } from "../../utils/getPitches";
import {
  getPitchString,
  getStem,
  getBoundsFromChord,
  isNoteOnLine,
  getDiatonicTransposition,
} from "../../utils/methods";

import Rest from "../Note/Rest";
import Accidental from "./Accidental";
import Markings from "./Markings";
import Item from "../Item";

import styles from "./Chord.module.css";
import Tie from "./Tie";

// TODO: Should handle
//         - display one or more noteheads
//         - drawing a single stem for multiple note values,
//         - adjusting note positions if adjacent pitches
/**
 * Convenience wrapper of note-related elements that are usually rendered together.
 */
export default function Chord({ clef, event, eventIndex, events, id, period }) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const { rangeClef } = useMemo(() => getPitches(clef), [clef]);
  const beamEvent = flows[event.flowId].beamEvents.find(
    (beamEvent) => beamEvent.renderId === event.renderId,
  );
  const pitchPrefix = useMemo(
    () => `${event.flowId}p${event.partIndex}`,
    [event.flowId, event.partIndex],
  );
  const stem = useMemo(
    () =>
      event.notes
        ? getStem(
            event.notes,
            rangeClef.staffLinePitches[2].id,
            beamEvent?.beam.direction ?? null,
            beamEvent?.beam ?? null,
            pitchPrefix,
          )
        : null,
    [beamEvent?.beam, event.notes, pitchPrefix, rangeClef.staffLinePitches],
  );
  const chordBounds = useMemo(
    () => (event.notes ? getBoundsFromChord(event.notes) : null),
    [event.notes],
  );
  // TODO: If any seconds exist in a chord, we'll need to know the stem direction *here*
  // so we're placing noteheads correctly in relation to other notes at the timestamp:
  // stem always goes through the second, higher note to right of stem.

  return (
    <Fragment key={id}>
      <LegerLines event={event} id={pitchPrefix} />
      <Rest event={event} id={pitchPrefix} />

      {event.notes &&
        event.notes.map((note, noteIndex) => (
          <Fragment key={`${id}_not${noteIndex}`}>
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
              pitchPrefix={pitchPrefix}
              staffLinePitch={rangeClef.staffLinePitches[0].id}
            />
            <Tie
              event={event}
              note={note}
              period={period}
              pitchPrefix={pitchPrefix}
              rangeClef={rangeClef}
              stem={stem}
            />
          </Fragment>
        ))}
      {event.notes && (
        <Stem
          rangeClef={rangeClef}
          direction={beamEvent?.beam.direction ?? null}
          event={event}
          notes={event.notes}
          pitchPrefix={pitchPrefix}
          beam={beamEvent?.beam ?? null}
        />
      )}
      {event.markings && (
        <Markings
          key={`${pitchPrefix}_mar`}
          beam={beamEvent?.beam ?? null}
          chordBounds={chordBounds}
          event={event}
          id={`${pitchPrefix}_mar`}
          period={period}
          pitchPrefix={pitchPrefix}
          rangeClef={rangeClef}
          stem={stem}
        />
      )}
    </Fragment>
  );
}
