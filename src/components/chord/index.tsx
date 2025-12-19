import { Fragment, useMemo } from "react";

import Accidental from "./../../components/chord/accidental.js";
import LegerLines from "./../../components/chord/legerLines.js";
import Markings from "./../../components/chord/markings.js";
import Note from "./../../components/note/index.js";
import Rest from "./../../components/note/rest.js";
import Stem from "./../../components/stem/index.js";
import Tie from "./../../components/chord/tie.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";
import { getPitches } from "./../../utils/getPitches.js";
import { getStem, getBoundsFromChord } from "./../../utils/methods.js";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";

type ChordProps = {
  clef: Minim.Component.Clef;
  event: Minim.Event.Clip;
  id: MNX.Defs.ID;
  period: Minim.Period.PeriodItem;
};

// TODO: Should handle
//         - display one or more noteheads
//         - drawing a single stem for multiple note values,
//         - adjusting note positions if adjacent pitches
/**
 * Convenience wrapper of note-related elements that are usually rendered together.
 */
export default function Chord({ clef, event, id, period }: ChordProps) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const { rangeClef } = useMemo(() => getPitches(clef), [clef]);
  const beamEvent: Minim.Defs.BeamEvent | undefined = flows[
    event.flowId
  ]?.beamEvents?.find(
    (beamEvent: Minim.Defs.BeamEvent) => beamEvent.renderId === event.renderId,
  );
  const pitchPrefix = useMemo(
    () => `${event.flowId}p${event.partIndex}`,
    [event.flowId, event.partIndex],
  );
  const stem = useMemo(
    () =>
      "notes" in event && event.notes
        ? getStem(
            event.notes,
            rangeClef!.midline,
            beamEvent?.beam.direction ?? null,
            beamEvent?.beam ?? null,
            pitchPrefix,
          )
        : undefined,
    [beamEvent, event, pitchPrefix, rangeClef],
  );
  const chordBounds = useMemo(
    () =>
      "notes" in event && event.notes ? getBoundsFromChord(event.notes) : null,
    [event],
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
              clefType={rangeClef!.type}
              event={event}
              id={id}
              note={note}
              noteIndex={noteIndex}
              period={period}
              pitchPrefix={pitchPrefix}
            />
            <Note
              key={`${id}_not${noteIndex}_notehead`}
              id={`${id}_not${noteIndex}_notehead`}
              column={`e${(event.position as Minim.Bounds).start}-not`}
              event={event}
              note={note}
              noteIndex={noteIndex}
              pitchPrefix={pitchPrefix}
              staffLinePitch={rangeClef!.staffLinePitches[0].id}
            />
            <Tie
              event={event}
              note={note}
              period={period}
              pitchPrefix={pitchPrefix}
              rangeClef={rangeClef!}
              stem={stem!}
            />
          </Fragment>
        ))}
      {event.notes && (
        <Stem
          rangeClef={rangeClef!}
          direction={beamEvent?.beam.direction ?? undefined}
          event={event}
          notes={event.notes}
          pitchPrefix={pitchPrefix}
          beam={beamEvent?.beam ?? null}
        />
      )}
      {/* TODO: See whether Markings actually requires `beam` to be defined; `beam` below was previously set to `beamEvent?.beam ?? null` */}
      {event.markings && beamEvent?.beam && (
        <Markings
          key={`${pitchPrefix}_mar`}
          beam={beamEvent?.beam}
          chordBounds={chordBounds!}
          event={event}
          id={`${pitchPrefix}_mar`}
          period={period}
          pitchPrefix={pitchPrefix}
          rangeClef={rangeClef!}
          stem={stem}
        />
      )}
    </Fragment>
  );
}
