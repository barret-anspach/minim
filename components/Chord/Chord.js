import Note from '../Note';
import Stem from '../Stem';

import { toDurationFromArray } from '../../utils/methods';

// TODO: Should handle
//         - display one or more noteheads
//         - drawing a single stem for multiple note values,
//         - adjusting note positions if adjacent pitches
/**
 * Convenience wrapper of note-related elements that are usually rendered together.
 */
export default function Chord({ clef, column, event, eventIndex, events, id }) {
  const _column = column ?? `e ${toDurationFromArray(eventIndex, events) + 1}`;
  // TODO: are pitches on a line or space? --> placement of augmentation dots, accidentals, etc.
  return (
    <>
      {/** Leger Lines */}
      {/** Articulations */}
      {event.notes.map((note, noteIndex) => (
        <Note
          key={`${id}_not${noteIndex}`}
          id={`${id}_not${noteIndex}`}
          column={_column}
          event={event}
          eventIndex={eventIndex}
          events={events}
          note={note}
          noteIndex={noteIndex}
        />
      ))}
      <Stem
        clef={clef}
        column={_column}
        event={event}
        notes={event.notes}
      />
    </>
  )
};