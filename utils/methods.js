import { durationMap } from "../constants/durations";
import { noteheadMap } from "../constants/noteheads";
import circleOfFifths from "../fixtures/pitch/circleOfFifths";

export function mod(n, m) {
  return ((n % m) + m) % m;  
}

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
  return events.slice(0, index).reduce((acc, e) => {
    switch (e.type) {
      case "tuplet": {
        return acc + (toDuration(e.outer) * e.outer.multiple)
      }
      case "event": {
        return acc + toDuration(e)
      }
    }
  }, 0)
}

export function glyphNameToNotehead(glyphName) {
  return noteheadMap.value[noteheadMap.key.findIndex(k => k === glyphName)];
}

const pitchClasses = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

// TODO: There's a lot of back-and-forth between object and string;
// Refactor so we're just using an object matching the MNX input, with "pitchString" added.
export function getPitchString(note) {
  return `${note.pitch.step.toLowerCase()}${note.pitch.octave}`
}

export function getPitchParts(note) {
  const pitchClass = note.slice(0, 1);
  const octave = parseInt(note.slice(-1));
  return {
      stepIndex: pitchClasses.indexOf(pitchClass),
      get pitchClass() { return pitchClasses[this.stepIndex] },
      octave,
    }
}

export function getHighestPitch(a, b) {
  if (a === b) return 0
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b)
  }
  if (_res.a.octave > _res.b.octave) { return a }
  else if (_res.a.octave < _res.b.octave) { return b }
  else if (_res.a.stepIndex > _res.b.stepIndex) { return a }
  else if (_res.a.stepIndex < _res.b.stepIndex) { return b }
  else return a; // Equal!
}

export function getLowestPitch(a, b) {
  if (a === b) return 0
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b)
  }
  if (_res.a.octave > _res.b.octave) { return b }
  else if (_res.a.octave < _res.b.octave) { return a }
  else if (_res.a.stepIndex > _res.b.stepIndex) { return b }
  else if (_res.a.stepIndex < _res.b.stepIndex) { return a }
  else return a; // Equal!
}

export function getBoundsFromChord(array) {
  if (array.length === 1) {
    const pitchString = getPitchString(array[0]);
    return { upper: pitchString, lower: pitchString }
  };
  return array.reduce((acc, c, ci) => {
    const pitchString = getPitchString(c);
    if (ci === 0) { return { upper: pitchString, lower: pitchString} }
    else return {
      upper: getHighestPitch(pitchString, acc.upper),
      lower: getLowestPitch(pitchString, acc.lower),
    }
  }, { upper: '', lower: ''});
}

export function getDiatonicInterval(a, b) {
  // ex: a4, e5 => 5
  // ex: g3, f5 => 14
  if (a === b) return 0;
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b)
  }
  if (_res.a.octave === _res.b.octave) {
    return _res.a.stepIndex - _res.b.stepIndex
  } else {
    if (_res.a.octave < _res.b.octave) {
      return (6 - _res.a.stepIndex)
        + (8 * (_res.a.octave - _res.b.octave))
        + _res.b.stepIndex 
    } else {
      return (6 - _res.b.stepIndex)
        + (8 * (_res.b.octave - _res.a.octave))
        + _res.a.stepIndex 
    }
  }
}

export function getDiatonicTransposition(pitchName, steps) {
  // ex. c5, -2 => a4
  const direction = Math.sign(steps);
  if (direction === 0) return pitchName;
  const a = getPitchParts(pitchName);
  const index = direction === -1
    ? pitchClasses.findLastIndex((pc) => pc === a.pitchClass)
    : pitchClasses.findIndex((pc) => pc === a.pitchClass);
  const newPitch = pitchClasses[mod(index + steps, pitchClasses.length)];
  // const index = mod(a.stepIndex - steps, pitchClasses.length);
  // const newPitch = direction === -1 ? pitchClassesReversed[index] : pitchClasses[index];
  const numberOfOctaves = Math.floor(steps / pitchClasses.length);
  return `${newPitch}${a.octave + numberOfOctaves}`;
}

export function getStemDirectionForChord(chord, midline) {
  const bounds = getBoundsFromChord(chord);
  if (chord.length === 1) {
    const pitch = getPitchString(chord[0])
    const isMidline = Math.sign(getDiatonicInterval(midline, pitch))
    return {
      bounds,
      direction: isMidline > 0 ? 'up' : 'down'
    };
  } else {
    // interval between midline and upper bound
    const upperInterval = getDiatonicInterval(midline, bounds.upper)
    // interval between midline and lower bound
    const lowerInterval = getDiatonicInterval(midline, bounds.lower)
    // Is midline above? Then stem is 'up'
    return {
      bounds,
      direction: lowerInterval > upperInterval ? 'up' : 'down',
    };
  }
}

export function getStem(chord, midline) {
  const { bounds, direction } = getStemDirectionForChord(chord, midline);
  return {
    direction,
    row: direction === 'up'
    ? `${getDiatonicTransposition(bounds.upper, 7)}/${bounds.lower}`
      : `${bounds.upper}/${getDiatonicTransposition(bounds.lower, -7)}`
  }
}