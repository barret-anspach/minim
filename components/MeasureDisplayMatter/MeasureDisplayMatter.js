import Clef from "../Clef";
import Key from "../Key";
import Meter from "../Meter";

export default function MeasureDisplayMatter({
  clef,
  event,
  flowId,
  rangeClef,
  staffIndex,
}) {
  return (
    <>
      {event.clefs && event.clefs[staffIndex].display && (
        <Clef
          id={`${flowId}s${staffIndex + 1}`}
          clef={event.clefs[staffIndex].clef}
          column={event.clefs[staffIndex].column}
        />
      )}
      {event.key && (
        <Key
          id={`${flowId}s${staffIndex + 1}`}
          clefType={rangeClef.type}
          column={event.key.column}
          fifths={event.key.fifths}
          prevFifths={event.key.prevFifths}
        />
      )}
      {event.time && (
        <Meter
          id={`${flowId}s${staffIndex + 1}`}
          clef={clef}
          count={event.time.count}
          unit={event.time.unit}
          start={event.time.column}
        />
      )}
    </>
  );
}
