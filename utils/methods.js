import { durationMap } from "../constants/durations";
import { noteheadMap } from "../constants/noteheads";
import circleOfFifths from "../fixtures/pitch/circleOfFifths";

export function approxEqual(a, b, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}

export function timeSignatureToDuration(count, unit) {
  return count * (durationMap.value[durationMap.key.indexOf('whole')] / unit);
}

export function toDuration(event) {
  return (
        durationMap.value[durationMap.key.indexOf(event.duration.base)] *
          (1 + (1 - Math.pow(2, event.duration.dots ? event.duration.dots * -1 : 0)))
      )
}

export function toDurationFromArray(index, events) {
  return events.slice(0, index).reduce((acc, e) => acc + toDuration(e), 0)
}

export function glyphNameToNotehead(glyphName) {
  return noteheadMap.value[noteheadMap.key.findIndex(k => k === glyphName)];
}

export function fifthsToKey(integer) {
  const fifths = Math.sign(integer) === 0
    ? circleOfFifths.find(cof => cof.id === 0)
    : Math.sign(integer) === 1
      ? circleOfFifths[integer]
      : circleOfFifths.reverse()[integer];
}
