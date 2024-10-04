import Clef from "../Clef";
import Key from "../Key";
import Meter from "../Meter";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import { areTimeSignaturesEqual } from "../../utils/methods";
const range = require("../../fixtures/pitch/range.json");

export default function MeasureDisplayMatter({
  flowId,
  part,
  index,
  measure,
  staffIndex,
}) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const { measures } = flows[flowId];
  const measureClef = Object.values(range.clefs).find(
    (v) =>
      measure.clefs[staffIndex].clef.sign === v.sign &&
      measure.clefs[staffIndex].staff === staffIndex + 1,
  );
  // Local clef context: Does part have a global clef defined?
  const defaultClef = Object.values(range.clefs).find(
    (v) =>
      part.global.clefs[staffIndex].clef.sign === v.sign &&
      part.global.clefs[staffIndex].staff === staffIndex + 1,
  );
  // Possibly part.sequences isn't flat enough; should be able to immediately access events from a sequence
  // Find the closest next clef definition (which will be in either part.sequences[].content[type="measure"].sequence[] if "mid-measure"
  // or )
  const nextClef =
    measures[index + 1] &&
    Object.values(range.clefs).find(
      (v) =>
        measures[index + 1].clefs[staffIndex].clef.sign === v.sign &&
        measures[index + 1].clefs[staffIndex].staff === staffIndex + 1,
    );

  const clef =
    measure.positionInSystem.last &&
    measures[index + 1] &&
    measures[index + 1].clefs &&
    nextClef.type !== defaultClef.type
      ? { clef: nextClef, column: `e${measure.position.end}-me-cle` }
      : index === 0 ||
          measure.positionInSystem.first ||
          measures[index - 1].clefs[staffIndex].clef.sign !== measureClef.sign
        ? { clef: defaultClef, column: `e${measure.position.start}-cle` }
        : undefined;

  // TODO: should compare meter objects for equality, not computed durations, to tell whether there's a time signature change
  // Show meter when next measure has a time signature change, or if current measure's time signature is different from the previous measure's
  const meter =
    measure.positionInSystem.last &&
    measures[index + 1] &&
    measures[index + 1].time &&
    !areTimeSignaturesEqual(measures[index + 1].time, measure.time)
      ? {
          count: measures[index + 1].time.count,
          unit: measures[index + 1].time.unit,
          start: `e${measure.position.end}-me-tim`,
        }
      : index === 0 ||
          (measures[index - 1] &&
            measures[index - 1].time &&
            !areTimeSignaturesEqual(measures[index - 1].time, measure.time))
        ? {
            count: measure.time.count,
            unit: measure.time.unit,
            start: `e${measure.position.start}-tim`,
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
    measure.positionInSystem.last &&
    measures[index + 1] &&
    measures[index + 1].key &&
    measures[index + 1].key.fifths !== measure.key.fifths
      ? {
          fifths: measures[index + 1].key.fifths,
          column: `e${measure.position.end}-me-key`,
          prevFifths: prevKey?.fifths || undefined,
        }
      : (measure.positionInSystem.first || index === 0) && currentKey
        ? {
            fifths: currentKey.fifths,
            column: `e${measure.position.start}-key`,
            prevFifths: prevKey?.fifths || undefined,
          }
        : undefined;
  return (
    <>
      {clef && (
        <Clef
          id={`${flowId}s${staffIndex + 1}`}
          clef={clef.clef}
          column={clef.column}
        />
      )}
      {key && (
        <Key
          id={`${flowId}s${staffIndex + 1}`}
          clefType={defaultClef.type}
          column={key.column}
          fifths={key.fifths}
          prevFifths={key.prevFifths}
        />
      )}
      {meter && (
        <Meter
          id={`${flowId}s${staffIndex + 1}`}
          clef={measureClef}
          count={meter.count}
          unit={meter.unit}
          start={meter.start}
        />
      )}
    </>
  );
}
