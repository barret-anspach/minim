import { durationMap } from "../constants/durations";
import { noteheadMap } from "../constants/noteheads";
import { restMap } from "../constants/rests";

export function mod(n, m) {
  return ((n % m) + m) % m;
}

export function approxEqual(a, b, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}

export function timeSignatureToDuration(count, unit) {
  return count * (durationMap.value[durationMap.key.indexOf("whole")] / unit);
}

export function areTimeSignaturesEqual(time1, time2) {
  return time1.count === time2.count && time1.unit === time2.unit;
}

export function toDuration(event) {
  return (
    durationMap.value[durationMap.key.indexOf(event.duration.base)] *
    (1 + (1 - Math.pow(2, event.duration.dots ? event.duration.dots * -1 : 0)))
  );
}

export function toDurationFromArray(index, events) {
  return events.slice(0, index).reduce((acc, e) => {
    switch (e.type) {
      case "tuplet": {
        return acc + toDuration(e.outer) * e.outer.multiple;
      }
      case "event": {
        return acc + toDuration(e);
      }
    }
  }, 0);
}

export function glyphNameToNotehead(glyphName) {
  return noteheadMap.value[noteheadMap.key.findIndex((k) => k === glyphName)];
}

const pitchClasses = ["c", "d", "e", "f", "g", "a", "b"];

// TODO: There's a lot of back-and-forth between object and string;
// Refactor so we're just using an object matching the MNX input, with "pitchString" added.
export function getPitchString(note) {
  return `${note.pitch.step.toLowerCase()}${note.pitch.octave}`;
}

export function getPitchParts(note) {
  const pitchClass = note.slice(0, 1);
  const octave = parseInt(note.slice(-1));
  return {
    stepIndex: pitchClasses.indexOf(pitchClass),
    get pitchClass() {
      return pitchClasses[this.stepIndex];
    },
    octave,
  };
}

export function getHighestPitch(a, b) {
  if (a === b) return 0;
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b),
  };
  if (_res.a.octave > _res.b.octave) {
    return a;
  } else if (_res.a.octave < _res.b.octave) {
    return b;
  } else if (_res.a.stepIndex > _res.b.stepIndex) {
    return a;
  } else if (_res.a.stepIndex < _res.b.stepIndex) {
    return b;
  } else return a; // Equal!
}

export function getLowestPitch(a, b) {
  if (a === b) return 0;
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b),
  };
  if (_res.a.octave > _res.b.octave) {
    return b;
  } else if (_res.a.octave < _res.b.octave) {
    return a;
  } else if (_res.a.stepIndex > _res.b.stepIndex) {
    return b;
  } else if (_res.a.stepIndex < _res.b.stepIndex) {
    return a;
  } else return a; // Equal!
}

export function getBoundsFromChord(array) {
  if (array.length === 1) {
    const pitchString = getPitchString(array[0]);
    return { upper: pitchString, lower: pitchString };
  }
  return array.reduce(
    (acc, c, ci) => {
      const pitchString = getPitchString(c);
      if (ci === 0) {
        return { upper: pitchString, lower: pitchString };
      } else
        return {
          upper: getHighestPitch(pitchString, acc.upper),
          lower: getLowestPitch(pitchString, acc.lower),
        };
    },
    { upper: "", lower: "" },
  );
}

export function getDiatonicInterval(a, b) {
  // ex: a4, a4 => 0 (unison)
  // ex: a4, e5 => 4 (fifth up)
  // ex: a4, a5 => 7 (octave up)
  // ex: g3, f5 => 13 (fourteenth up)
  // ex: a4, g4 => -1 (second down)
  // ex: a4, d4 => -4 (fifth down)
  if (a === b) return 0;
  const _res = {
    a: getPitchParts(a),
    b: getPitchParts(b),
  };
  if (_res.a.octave === _res.b.octave) {
    return _res.a.stepIndex - _res.b.stepIndex;
  } else {
    return (
      _res.a.octave * 7 +
      _res.a.stepIndex -
      (_res.b.octave * 7 + _res.b.stepIndex)
    );
  }
}

export function getDiatonicTransposition(pitchName, steps) {
  // ex. c5, -2 => a4
  // ex. c5, 7 => c6
  // ex. c4, -3 => g3
  const direction = Math.sign(steps);
  if (direction === 0) return pitchName;
  const a = getPitchParts(pitchName);
  const index =
    direction === -1
      ? pitchClasses.findLastIndex((pc) => pc === a.pitchClass)
      : pitchClasses.findIndex((pc) => pc === a.pitchClass);
  const newPitch = pitchClasses[mod(index + steps, pitchClasses.length)];
  const newOctave =
    direction *
    Math.floor(
      (direction === 1
        ? index + Math.abs(steps)
        : pitchClasses.length - index - 1 - steps) / pitchClasses.length,
    );
  return `${newPitch}${a.octave + newOctave}`;
}

export function getStemDirectionForChord(chord, midline) {
  const bounds = getBoundsFromChord(chord);
  if (chord.length === 1) {
    const pitch = getPitchString(chord[0]);
    const isMidline = Math.sign(getDiatonicInterval(midline, pitch));
    return {
      bounds,
      direction: isMidline > 0 ? "up" : "down",
    };
  } else {
    // interval between midline and upper bound
    const upperInterval = getDiatonicInterval(midline, bounds.upper);
    // interval between midline and lower bound
    const lowerInterval = getDiatonicInterval(midline, bounds.lower);
    // Is midline above? Then stem is 'up'
    return {
      bounds,
      direction: lowerInterval > upperInterval ? "up" : "down",
    };
  }
}

export function getStem(chord, midline) {
  const { bounds, direction } = getStemDirectionForChord(chord, midline);
  return {
    direction,
    row:
      direction === "up"
        ? `${getDiatonicTransposition(bounds.upper, 7)}/${bounds.lower}`
        : `${bounds.upper}/${getDiatonicTransposition(bounds.lower, -7)}`,
  };
}

export function getLegerLines(staffBounds, chord) {
  const chordBounds = getBoundsFromChord(chord);
  const legerUpperInterval = getDiatonicInterval(
    chordBounds.upper,
    staffBounds.upper.id,
  );
  const legerLowerInterval = getDiatonicInterval(
    chordBounds.lower,
    staffBounds.lower.id,
  );
  // leger count:   diatonic interval past outer boundary % 2,
  const legerUpperCount =
    Math.sign(legerUpperInterval) *
    Math.floor(Math.abs(legerUpperInterval) / 2);
  const legerLowerCount =
    Math.sign(legerLowerInterval) *
    Math.floor(Math.abs(legerLowerInterval) / 2);
  // leger pitch:   get pitch at (diatonic interval of [ staffLinePitches[below ? staffLinePitches.length - 1 : 0].id and lowest/highest chord note] % 2 )
  const legerUpperLines =
    legerUpperInterval > 0 && legerUpperCount > 0
      ? Array.from({ length: legerUpperCount }, (_, i) => i).map((index) => ({
          index,
          pitch: getDiatonicTransposition(
            staffBounds.upper.id,
            2 * (index + 1),
          ),
        }))
      : [];
  const legerLowerLines =
    legerLowerInterval < 0 && legerLowerCount < 0
      ? Array.from({ length: Math.abs(legerLowerCount) }, (_, i) => i).map(
          (index) => ({
            index,
            pitch: getDiatonicTransposition(
              staffBounds.lower.id,
              -2 * (index + 1),
            ),
          }),
        )
      : [];
  return [...legerUpperLines, ...legerLowerLines];
}

export function isNoteOnLine(staffLinePitch, note) {
  return (
    mod(getDiatonicInterval(staffLinePitch, getPitchString(note)), 2) === 0
  );
}

export function getRestGlyph(duration) {
  return restMap.value[restMap.key.findIndex((k) => k === duration.base)];
}
