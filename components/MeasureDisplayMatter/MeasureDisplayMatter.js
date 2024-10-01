import Clef from "../Clef";
import Key from "../Key";
import Meter from "../Meter";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import {
  areTimeSignaturesEqual,
  timeSignatureToDuration,
} from "../../utils/methods";
const range = require("../../fixtures/pitch/range.json");

export default function MeasureDisplayMatter({
  globalMeasure,
  nextGlobalMeasure = undefined,
  first = false,
  last = false,
  part,
  partIndex,
  index,
  staffIndex,
}) {
  const {
    context: { measures },
  } = useMeasuresContext();
  const measureClef = Object.values(range.clefs).find(
    (v) => measures[index].clefs[partIndex][staffIndex].clef.sign === v.sign,
  );
  // Local clef context: Does part have a global clef defined?
  const currentClef = Object.values(range.clefs).find(
    (v) => part.global.clefs[staffIndex].clef.sign === v.sign,
  );
  // Possibly part.sequences isn't flat enough; should be able to immediately access events from a sequence
  // Find the closest next clef definition (which will be in either part.sequences[].content[type="measure"].sequence[] if "mid-measure"
  // or )
  const nextClef =
    measures[index + 1] &&
    Object.values(range.clefs).find(
      (v) =>
        measures[index + 1].clefs[partIndex][staffIndex].clef.sign === v.sign,
    );

  const clef =
    last &&
    measures[index + 1] &&
    measures[index + 1].clefs &&
    nextClef.type !== currentClef.type
      ? { clef: nextClef, column: "me-cle" }
      : first
        ? { clef: currentClef, column: "m-cle" }
        : undefined;

  // TODO: should compare meter objects for equality, not computed durations, to tell whether there's a time signature change
  // Show meter when next measure has a time signature change, or if current measure's time signature is different from the previous measure's
  const meter =
    last &&
    nextGlobalMeasure &&
    nextGlobalMeasure.time &&
    !areTimeSignaturesEqual(nextGlobalMeasure.time, globalMeasure.time)
      ? {
          count: nextGlobalMeasure.time.count,
          unit: nextGlobalMeasure.time.unit,
          start: "me-tim",
        }
      : index === 0 ||
          (measures[index - 1] &&
            measures[index - 1].time &&
            !areTimeSignaturesEqual(
              measures[index - 1].time,
              globalMeasure.time,
            ))
        ? {
            count: globalMeasure.time.count,
            unit: globalMeasure.time.unit,
            start: "m-tim",
          }
        : undefined;
  // If it's the last measure in a system and there's a key change in the next measure,
  // or a current key change,
  // or the first measure in a system,
  const prevKey =
    index > 0
      ? measures.slice(0, index).findLast((m) => m.key !== undefined).key
      : undefined;
  const currentKey = measures
    .slice(0, index + 1)
    .findLast((m) => m.key !== undefined).key;
  const key =
    last &&
    nextGlobalMeasure &&
    nextGlobalMeasure.key &&
    nextGlobalMeasure.key.fifths !== globalMeasure.key.fifths
      ? {
          fifths: nextGlobalMeasure.key.fifths,
          column: "me-key",
          prevFifths: prevKey?.fifths || undefined,
        }
      : first && currentKey
        ? {
            fifths: currentKey.fifths,
            column: "m-key",
            prevFifths: prevKey?.fifths || undefined,
          }
        : undefined;
  return (
    <>
      {clef && <Clef clef={clef.clef} column={clef.column} />}
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
          clef={measureClef}
          count={meter.count}
          unit={meter.unit}
          start={meter.start}
        />
      )}
    </>
  );
}
