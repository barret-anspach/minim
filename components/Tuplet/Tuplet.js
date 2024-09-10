import Item from "../Item";

import { toDuration, toDurationFromArray } from "../../utils/methods";
import { noteheadMap } from "../../constants/noteheads";

export default function Tuplet({ event, id }) {
  if (event.type !== 'tuplet') return;

  const scalar = 
    (toDuration(event.outer) * event.outer.multiple)
    / (toDuration(event.inner) * event.inner.multiple);
  
  return (
    <>
      {event.content.map((tupletEvent, tupletEventIndex, tupletEvents) => tupletEvent.notes.map((note, noteIndex) => (
        <Item
          key={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
          column={`e ${Math.floor(toDurationFromArray(tupletEventIndex, tupletEvents) * scalar) + 1}`}
          pitch={`${note.pitch.step.toLowerCase()}${note.pitch.octave}`}
          >
            {noteheadMap.value[noteheadMap.key.indexOf(tupletEvent.duration.base)] }
        </Item>
      )))}
    </>
  )
}