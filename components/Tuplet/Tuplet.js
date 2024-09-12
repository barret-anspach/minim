import Chord from "../Chord";

import { toDuration, toDurationFromArray } from "../../utils/methods";

export default function Tuplet({ clef, event, id }) {
  if (event.type !== 'tuplet') return;

  const scalar = 
    (toDuration(event.outer) * event.outer.multiple)
    / (toDuration(event.inner) * event.inner.multiple);
  return (
    <>
      {event.content.map((tupletEvent, tupletEventIndex, tupletEvents) => tupletEvent.notes.map((note, noteIndex) => (
        <Chord
          key={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
          id={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
          clef={clef}
          column={`e ${Math.floor(toDurationFromArray(tupletEventIndex, tupletEvents) * scalar) + 1}`}
          event={tupletEvent}
          eventIndex={tupletEventIndex}
          events={tupletEvents}
          note={note}
          noteIndex={noteIndex}
        />
      )))}
      {/** Bracket, ratio, etc */}
    </>
  )
}