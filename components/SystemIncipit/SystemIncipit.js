import Clef from "./../Clef"
import Key from "./../Key"
import Meter from './../Meter';

const range = require('./../../fixtures/pitch/range.json');

export default function SystemIncipit({
  globalMeasure,
  nextGlobalMeasure = undefined,
  globalMeasures,
  first = false,
  last = false,
  part,
  index,
  staffIndex
}) {
  const currentClef = Object.values(range.clefs).find((v) => part.measures[index].clefs[staffIndex].clef.sign === v.sign);
  const nextClef = part.measures[index + 1] && Object.values(range.clefs).find((v) => part.measures[index + 1].clefs[staffIndex].clef.sign === v.sign);
  
  const clef = last && part.measures[index + 1] && part.measures[index + 1].clefs && nextClef.type !== currentClef.type
    ? { clef: nextClef, column: 'me-cle' }
    : first
      ? { clef: currentClef, column: 'm-cle' }
      : undefined;
  const meter = last && nextGlobalMeasure && nextGlobalMeasure.time
    ? { count: nextGlobalMeasure.time.count, unit: nextGlobalMeasure.time.unit, start: 'me-tim' }
    : globalMeasure.time
      ? { count: globalMeasure.time.count, unit: globalMeasure.time.unit, start: 'm-tim' }
      : undefined; 
  // If it's the last measure in a system and there's a key change in the next measure,
  // or a current key change,
  // or the first measure in a system,
  const prevKey = index > 0
    ? globalMeasures.slice(0, index).findLast(m => m.key !== undefined).key
    : undefined;
  const currentKey = globalMeasures.slice(0, index + 1).findLast(m => m.key !== undefined).key;
  const key = last && nextGlobalMeasure && nextGlobalMeasure.key
    ? { fifths: nextGlobalMeasure.key.fifths, column: 'me-key', prevFifths: prevKey?.fifths || undefined }
    : globalMeasure.key
      ? { fifths: globalMeasure.key.fifths, column: 'm-key', prevFifths: prevKey?.fifths || undefined }
      : first && currentKey
        ? { fifths: currentKey.fifths, column: 'm-key', prevFifths: prevKey?.fifths || undefined }
        : undefined;
  return (
    <>
      {clef && (
        <Clef clef={clef.clef} column={clef.column} />
      )}
      {key && (
        <Key
          clefType={currentClef.type}
          column={key.column}
          fifths={key.fifths}
          prevFifths={key.prevFifths}
        />
      )}
      {meter && (
        <Meter
          count={meter.count}
          unit={meter.unit}
          start={meter.start}
        />
      )}
    </>
  )
}