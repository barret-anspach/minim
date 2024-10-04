import { durationMap } from "../constants/durations";
import { noteheadMap } from "../constants/noteheads";
import { restMap } from "../constants/rests";
import { getPitches } from "./getPitches";

/* Constants */
const PITCH_CLASSES = ["c", "d", "e", "f", "g", "a", "b"];

/* Math */
/**
 * @function mod Modulo
 * @description Extends % operator to properly handle signed values.
 * @param {number} n number (dividend)
 * @param {number} m modulo (divisor)
 * @returns {number} modulus, the remainder or signed remainder of a
 * division, after one number is divided by another.
 */
export function mod(n, m) {
  return ((n % m) + m) % m;
}
/**
 * @function approxEqual
 * @description Compares whether or not two (signed or unsigned) numbers
 * are within a given range of one another.
 * @param {number} a number
 * @param {number} b number
 * @param {number} [epsilon=5] number (inclusive) denoting range inside
 * of which the two numbers might be considered equal.
 * @returns {boolean} equality
 */
export function approxEqual(a, b, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}

/* Meter and Duration: Conversion*/
/**
 * @method timeSignatureToDuration
 * @description Provided a time signature, method returns the duration of
 * a measure assigned that time signature.
 * @param {number} count time signature's numerator value
 * @param {number} unit time signature's denominator value
 * @returns {number} numerical duration value, where base whole note = 4096.
 */
export function timeSignatureToDuration(count, unit) {
  return count * (durationMap.value[durationMap.key.indexOf("whole")] / unit);
}
/**
 * @method toNumericalDuration
 * @description Given an MNX duration object, returns a numerical duration value.
 * @param {object} duration an MNX duration object
 * @returns {number} numerical duration value, where base whole note = 4096.
 */
export function toNumericalDuration(duration) {
  return (
    durationMap.value[durationMap.key.indexOf(duration.base)] *
    (1 + (1 - Math.pow(2, duration.dots ? duration.dots * -1 : 0)))
  );
}
/**
 * @method durationBeforeIndex
 * @description Provided the index of an array value, calculates the numerical
 * duration of events preceding the array value.
 * @param {number} index Index of array value
 * @param {*} events Array of MNX event objects
 * @returns {number} numerical duration value, where base whole note = 4096.
 */
export function durationBeforeIndex(index, events) {
  return events.slice(0, index).reduce((acc, e) => {
    switch (e.type) {
      case "tuplet": {
        return acc + toNumericalDuration(e.outer.duration) * e.outer.multiple;
      }
      case "event": {
        return acc + toNumericalDuration(e.duration);
      }
    }
  }, 0);
}
/** Meter and Duration: Comparison */
/**
 * @method areTimeSignaturesEqual
 * @description Returns true if both numerator and denominator of provided
 * time signatures match.
 * @param {object} time1 an MNX time signature object
 * @param {object} time2 an MNX time signature object
 * @returns {boolean} Whether or not the time signatures match.
 */
export function areTimeSignaturesEqual(time1, time2) {
  return time1.count === time2.count && time1.unit === time2.unit;
}

/* Note and pitch: Conversion */
/**
 * @method glyphNameToNotehead
 * @description Converts a base duration into the appropriate glyph for display.
 * @param {string} durationBase MNX duration object's base duration value.
 * @returns {string} SMUFL glyph character for notehead.
 */
export function getNoteGlyph(durationBase) {
  return noteheadMap.value[
    noteheadMap.key.findIndex((k) => k === durationBase)
  ];
}
export function getRestGlyph(durationBase) {
  return restMap.value[restMap.key.findIndex((k) => k === durationBase)];
}
// TODO: There's a lot of back-and-forth between object and string;
// Refactor so we're just using an object matching the MNX note object, with "pitchString" added — as its "id".
/**
 * @method getPitchString
 * @description Converts an MNX note object into a pitch string (shorthand pitch-and-octave
 * string value).
 * @param {object} note MNX note object
 * @returns {string} pitch string (shorthand pitch-and-octave value).
 */
export function getPitchString(note) {
  return `${note.pitch.step.toLowerCase()}${note.pitch.octave}`;
}
/**
 * @method getPitchParts
 * @description Converts a pitch string into attributes useful for calculations.
 * @param {string} pitchString a shorthand pitch-and-octave value.
 * @returns {object} pitch attributes useful for calculations.
 */
export function getPitchParts(pitchString) {
  const pitchClass = pitchString.slice(0, 1);
  const octave = parseInt(pitchString.slice(-1));
  return {
    stepIndex: PITCH_CLASSES.indexOf(pitchClass),
    get pitchClass() {
      return PITCH_CLASSES[this.stepIndex];
    },
    octave,
  };
}

/* Note and Pitch: Comparison */
// TODO:
// - [ ] Merge getHighestPitch() and getLowestPitch() into a single method;
// - [ ] Method should accept MNX note objects, not pitch strings
/**
 * @method getHighestPitch
 * @description Compares two pitch strings and returns the highest one, or
 * param "a" if equal.
 * @param {string} a pitch string
 * @param {string} b pitch string
 * @returns {string} the higher pitch string, or param "a" if equal.
 */
export function getHighestPitch(a, b) {
  if (a === b) return a;
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
export function isNoteOnLine(staffLinePitch, note) {
  return (
    mod(getDiatonicInterval(staffLinePitch, getPitchString(note)), 2) === 0
  );
}

/* Notes and pitch: Calculation and Transformation */
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
export function getDiatonicTransposition(pitchString, steps) {
  // ex. c5, -2 => a4
  // ex. c5, 7 => c6
  // ex. c4, -3 => g3
  const direction = Math.sign(steps);
  if (direction === 0) return pitchString;
  const a = getPitchParts(pitchString);
  const index =
    direction === -1
      ? PITCH_CLASSES.findLastIndex((pc) => pc === a.pitchClass)
      : PITCH_CLASSES.findIndex((pc) => pc === a.pitchClass);
  const newPitch = PITCH_CLASSES[mod(index + steps, PITCH_CLASSES.length)];
  const newOctave =
    direction *
    Math.floor(
      (direction === 1
        ? index + Math.abs(steps)
        : PITCH_CLASSES.length - index - 1 - steps) / PITCH_CLASSES.length,
    );
  return `${newPitch}${a.octave + newOctave}`;
}

/* Stem: Helper methods */
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
export function getStem(chord, midline, direction = null) {
  const { bounds, direction: chordDirection } = getStemDirectionForChord(
    chord,
    midline,
  );
  const stemDirection = direction ?? chordDirection;
  const noteStaff =
    stemDirection === "up" ? chord[0].staff : chord[chord.length - 1].staff;

  return {
    direction: stemDirection,
    row:
      stemDirection === "up"
        ? {
            start: getDiatonicTransposition(bounds.upper, 7),
            end: bounds.lower,
          }
        : {
            start: bounds.upper,
            end: getDiatonicTransposition(bounds.lower, -7),
          },
    noteStaff,
  };
}

/* Leger lines: Helper methods */
export function getLegerLines({ clef, clefs, notes, pitchPrefix = null }) {
  if (!notes) return null;

  const legerLines = notes.reduce((acc, note) => {
    const { staffBounds } = getPitches(clefs[note.staff - 1].clef ?? clef.clef);
    const pitchString = getPitchString(note);
    const lowerThanTop = getLowestPitch(pitchString, staffBounds.upper.id);
    const higherThanBottom = getHighestPitch(pitchString, staffBounds.lower.id);
    // First, is note outside staff?
    if (pitchString === lowerThanTop && pitchString === higherThanBottom) {
      // Nope, no leger lines needed for this note.
      return acc;
    }
    // Second, if outside, is it below or above?
    else {
      const position =
        staffBounds.upper.id === lowerThanTop ? "upper" : "lower";
      // Third, calculate leger line count and position.
      const interval = getDiatonicInterval(
        pitchString,
        staffBounds[position].id,
      );
      const count = Math.sign(interval) * Math.floor(Math.abs(interval) / 2);
      const condition =
        position === "upper"
          ? interval > 0 && count > 0
          : interval < 0 && count < 0;
      const prefix = pitchPrefix ? `${pitchPrefix}s${note.staff}` : null;
      const lines = condition
        ? Array.from({ length: Math.abs(count) }, (_, i) => i).map((index) => ({
            index,
            pitch: `${prefix ?? ""}${getDiatonicTransposition(
              staffBounds[position].id,
              (position === "lower" ? -2 : 2) * (index + 1),
            )}`,
          }))
        : [];
      return [...acc, lines.flat()];
    }
  }, []);
  // Need to de-duplicate leger lines (i.e. if two notes in chord are below staff);
  return legerLines.length === 0 ? null : [...new Set(legerLines.flat())];

  // TODO: If any of a chord's pitches crosses a staff, don't calculate leger lines for that direction.
  // Requires knowing sequence.staff or voice.staff (as opposed to note.staff)
  const chordBounds = getBoundsFromChord(event.notes);

  const legerUpperInterval = getDiatonicInterval(
    chordBounds.upper,
    staffBounds.upper.id,
  );
  const legerUpperCount =
    Math.sign(legerUpperInterval) *
    Math.floor(Math.abs(legerUpperInterval) / 2);
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

  const legerLowerInterval = getDiatonicInterval(
    chordBounds.lower,
    staffBounds.lower.id,
  );
  const legerLowerCount =
    Math.sign(legerLowerInterval) *
    Math.floor(Math.abs(legerLowerInterval) / 2);
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

export function decorateEvent({
  event,
  i,
  acc,
  flowId,
  voice,
  part,
  partIndex,
}) {
  const _duration = toNumericalDuration(event.duration);
  acc.push({
    ...event,
    id: `${event.id}_rep${i}`,
    flowId,
    partId: part.id,
    partIndex,
    partVoices: part.sequences.length,
    voice: voice.voice,
    clef: part.global.clefs[voice.staff - 1],
    clefs: part.global.clefs,
    staff: voice.staff,
    staves: Array.from({ length: part.global.staves }, (_, i) => i + 1),
    index: acc[acc.length - 1] ? acc[acc.length - 1]?.index + i + 1 : i,
    position: {
      start:
        acc.length === 0 || acc[acc.length - 1].voice !== voice.voice
          ? 0
          : acc[acc.length - 1].position.end,
      end:
        acc.length === 0 || acc[acc.length - 1].voice !== voice.voice
          ? _duration
          : acc[acc.length - 1].position.end + _duration,
    },
    dimensions: {
      length: _duration,
    },
    positionInSystem: {
      first: false,
      last: false,
    },
  });
}

export function getStavesForFlow(flows, id) {
  return flows[id].parts.map((part) => ({
    part,
    staves: Array.from({ length: part.global.staves }, (_, i) => {
      const clef = part.global.clefs.find((c) => c.staff === i + 1);
      const { staffBounds } = getPitches(clef.clef, `${id}s${i + 1}`);
      return {
        clef,
        staffBounds,
        staffIndex: i,
      };
    }),
  }));
}
