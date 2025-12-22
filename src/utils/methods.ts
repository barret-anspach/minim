import { DURATION, durationMap } from "./../constants/durations.js";
import { noteheadMap } from "./../constants/noteheads.js";
import { restMap } from "./../constants/rests.js";
import { getPitches } from "./../utils/getPitches.js";

import { Minim } from "./../types/minim/index.js";
import { MNX } from "./../types/mnx/index.js";

/* Constants */
const PITCH_CLASSES: Minim.Defs.PitchClass[] = [
  "c",
  "d",
  "e",
  "f",
  "g",
  "a",
  "b",
];

/* Math */
/**
 * @function mod Modulo
 * @description Extends % operator to properly handle signed values.
 * @param {number} n number (dividend)
 * @param {number} m modulo (divisor)
 * @returns {number} modulus, the remainder or signed remainder of a
 * division, after one number is divided by another.
 */
export function mod(n: number, m: number): number {
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
export function approxEqual(
  a: number,
  b: number,
  epsilon: number = 5,
): boolean {
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
export function timeSignatureToDuration(count: number, unit: number): number {
  return count * (durationMap.value[durationMap.key.indexOf("whole")] / unit);
}
/**
 * @method toNumericalDuration
 * @description Given an MNX duration object, returns a numerical duration value.
 * @param {MNX.Defs.NoteValue} duration an MNX duration object
 * @returns {Minim.DisplayUnit.Duration} numerical duration value, where base whole note = 4096.
 */
export function toNumericalDuration(
  duration: MNX.Defs.NoteValue,
): Minim.DisplayUnit.Duration {
  return (
    durationMap.value[durationMap.key.indexOf(duration.base)] *
    (1 + (1 - Math.pow(2, duration.dots ? duration.dots * -1 : 0)))
  );
}
/**
 * @method lengthToDurationObj
 * @description Given a numerical duration value, returns an MNX duration object.
 * @param {number} length a numerical duration value, where base whole note = 4096.
 * @returns {MNX.Defs.NoteValue} an MNX duration object
 */
export function lengthToDurationObj(
  length: Minim.DisplayUnit.Duration,
): MNX.Defs.NoteValue {
  const baseIndex = durationMap.value.findIndex((d) => d <= length);
  const baseValue = durationMap.value[baseIndex];
  return {
    base: durationMap.key[baseIndex],
    dots: Math.floor(1 / (1 + (1 - length / baseValue)) / 2),
  } as MNX.Defs.NoteValue;
}
/**
 * @method getDurationFromNoteValueQuantity
 * @description given a NoteValueQuantity, return a numerical duration.
 * @param noteValueQuantity an MNX duration quantity object
 * @returns {Minim.DisplayUnit.Duration} numerical duration value, where base whole note = 4096.
 */
export function getDurationFromNoteValueQuantity(
  noteValueQuantity: MNX.Defs.NoteValueQuantity,
): Minim.DisplayUnit.Duration {
  return (
    toNumericalDuration(noteValueQuantity.duration) * noteValueQuantity.multiple
  );
}
/**
 * @method durationBeforeIndex
 * @description Provided the index of an array value, calculates the numerical
 * duration of events preceding the array value.
 * @param {number} index Index of array value
 * @param {*} events Array of MNX event objects
 * @returns {Minim.DisplayUnit.Duration} numerical duration value, where base whole note = 4096.
 */
export function durationBeforeIndex(
  index: number,
  events: Minim.Part.SequenceItemOrGroup[],
): Minim.DisplayUnit.Duration {
  return events.slice(0, index).reduce((acc, e) => {
    switch (e.type) {
      case "dynamic":
      case "grace":
      case "group":
      case "ottava": {
        // these events don't have a duration
        return acc;
      }
      case "tuplet": {
        return acc + toNumericalDuration(e.outer.duration) * e.outer.multiple;
      }
      case "space": {
        return (
          acc + toNumericalDuration(e.duration.duration) * e.duration.multiple
        );
      }
      case "event": {
        return e.duration ? acc + toNumericalDuration(e.duration) : acc;
      }
    }
  }, 0);
}
/** Meter and Duration: Comparison */
/**
 * @method areTimeSignaturesEqual
 * @description Returns true if both numerator and denominator of provided
 * time signatures match.
 * @param {MNX.Defs.Time} time1 an MNX time signature object
 * @param {MNX.Defs.Time} time2 an MNX time signature object
 * @returns {boolean} Whether or not the time signatures match.
 */
export function areTimeSignaturesEqual(
  time1: MNX.Defs.Time,
  time2: MNX.Defs.Time,
): boolean {
  return time1.count === time2.count && time1.unit === time2.unit;
}

/* Note and pitch: Conversion */
/**
 * @method getNoteGlyph
 * @description Converts a base duration into the appropriate glyph for display.
 * @param {MNX.Defs.NoteValue["base"]} durationBase MNX duration object's base duration value.
 * @returns {MNX.Defs.SmuflGlyph} SMUFL glyph character for notehead.
 */
export function getNoteGlyph(
  durationBase: MNX.Defs.NoteValue["base"],
): MNX.Defs.SmuflGlyph {
  return noteheadMap.value[
    noteheadMap.key.findIndex((k) => k === durationBase)
  ];
}
/**
 * @method getRestGlyph
 * @description Converts a base duration into the appropriate glyph for display.
 * @param {MNX.Defs.NoteValue["base"]} durationBase MNX duration object's base duration value.
 * @returns {MNX.Defs.SmuflGlyph} SMUFL glyph character for rest.
 */
export function getRestGlyph(
  durationBase: MNX.Defs.NoteValue["base"],
): MNX.Defs.SmuflGlyph {
  return restMap.value[restMap.key.findIndex((k) => k === durationBase)];
}
// TODO: There's a lot of back-and-forth between object and string;
// Refactor so we're just using an object matching the MNX note object, with "pitchString" added — as its "id".
/**
 * @method getPitchString
 * @description Converts an MNX note object into a pitch string (shorthand pitch-and-octave
 * string value).
 * @param {MNX.Defs.Note} note MNX note object
 * @returns {Minim.Defs.PitchString} pitch string (shorthand pitch-and-octave value).
 */
export function getPitchString(note: MNX.Defs.Note): Minim.Defs.PitchString {
  return `${note.pitch.step.toLowerCase()}${note.pitch.octave}`;
}
/**
 * @method getPitchParts
 * @description Converts a pitch string into attributes useful for calculations.
 * @param {Minim.Defs.PitchString} pitchString a shorthand pitch-and-octave value.
 * @returns {Minim.Defs.PitchParts} pitch attributes useful for calculations.
 */
export function getPitchParts(
  pitchString: Minim.Defs.PitchString,
): Minim.Defs.PitchParts {
  const pitchClass = pitchString.slice(
    0,
    1,
  ) as Minim.Defs.PitchParts["pitchClass"];
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
export function getHighestPitch(
  a: Minim.Defs.PitchString,
  b: Minim.Defs.PitchString,
): Minim.Defs.PitchString {
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
export function getLowestPitch(
  a: Minim.Defs.PitchString,
  b: Minim.Defs.PitchString,
): Minim.Defs.PitchString {
  if (a === b) return a;
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
export function isNoteOnLine(
  staffLinePitch: Minim.Defs.PitchString,
  note: Minim.Defs.PitchString | MNX.Defs.Note,
) {
  return (
    mod(
      getDiatonicInterval(
        staffLinePitch,
        typeof note === "string" ? note : getPitchString(note),
      ),
      2,
    ) === 0
  );
}

/* Notes and pitch: Calculation and Transformation */
export function getBoundsFromChord(
  array: MNX.Defs.Note[],
): Minim.Defs.ChordBounds {
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
export function getDiatonicInterval(
  a: Minim.Defs.PitchString,
  b: Minim.Defs.PitchString,
): Minim.Defs.DiatonicInterval {
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
export function getDiatonicTransposition(
  pitchString: Minim.Defs.PitchString,
  steps: Minim.Defs.DiatonicInterval,
): Minim.Defs.PitchString {
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
export function getStemDirectionForChord(
  chord: MNX.Defs.Note[] | undefined,
  midline: Minim.Defs.PitchString,
): { bounds: Minim.Defs.ChordBounds | undefined; direction: "up" | "down" } {
  if (!chord)
    return {
      bounds: undefined,
      direction: "up",
    };
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

export function getStem(
  chord: MNX.Defs.Note[],
  midline: Minim.Defs.PitchString,
  direction: MNX.Defs.StemDirection | null = null,
  beam: Minim.Defs.BeamEvent["beam"] | null = null,
  pitchPrefix: string | undefined = undefined,
): Minim.Defs.Stem {
  const { bounds, direction: chordDirection } = getStemDirectionForChord(
    chord,
    midline,
  );
  const stemDirection = direction ?? chordDirection;
  // *** presumes pitches in chord pitches are ordered from top to bottom
  const noteStaff =
    stemDirection === "up"
      ? (chord[0].staff ?? 1)
      : (chord[chord.length - 1].staff ?? 1);
  // TODO: notes past first leger line must reach midline
  const terminus = beam
    ? beam.pitch
    : stemDirection === "up"
      ? getDiatonicTransposition(bounds!.upper, 7)
      : getDiatonicTransposition(bounds!.lower, -7);
  return {
    direction: stemDirection,
    pitch:
      stemDirection === "up"
        ? {
            start: terminus,
            end: bounds!.lower,
          }
        : {
            start: bounds!.upper,
            end: terminus,
          },
    row:
      stemDirection === "up"
        ? {
            start: `${pitchPrefix ? `${pitchPrefix}s${beam ? beam.staff : noteStaff}` : null}${terminus}`,
            end: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${bounds!.lower}`,
          }
        : {
            start: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${bounds!.upper}`,
            end: `${pitchPrefix ? `${pitchPrefix}s${beam ? beam.staff : noteStaff}` : null}${terminus}`,
          },
    noteStaff,
  };
}
/* For each staff of the current part, are there multiple voices?
/  ex. const voiceNumbersByPartStaff = getPeriodVoiceNumbersByPartStaff(flow, event.partIndex);
/  ====> voiceNumbersByPartStaff[event.staff].length === 1 ? <single voice> : <multiple voices>
*/
export type PeriodVoiceNumbersByPartStaff = {
  [k: MNX.Defs.StaffNumber]: number[];
};
export function getPeriodVoiceNumbersByPartStaff(
  flow: Minim.Event.EventItem[],
  eventPartIndex: Minim.Defs.Index,
): PeriodVoiceNumbersByPartStaff {
  return Object.values(flow).reduce(
    (acc: PeriodVoiceNumbersByPartStaff, e) =>
      !["displayEvent"].includes(e.type) && eventPartIndex === e.partIndex
        ? {
            ...acc,
            [e.staff]: [...new Set([...(acc[e.staff] ?? []), e.voice])],
          }
        : acc,
    {},
  );
}
export function getBeamGroupStem(
  beamGroup: Minim.Event.EventItem[],
  pitchPrefix: string | null = null,
) {
  // Get bounds for all pitches under beam
  const beamGroupNotes = beamGroup
    // filter for events with notes
    // .filter((e) => e.type === "event" ? "notes" in e : e.type === "tuplet" ? e.content.filter(t => "notes" in t) : [])
    // return just the notes array for all events
    .flatMap((e) =>
      e.type === "event" && "notes" in e && e.notes !== undefined
        ? e.notes
        : e.type === "tuplet"
          ? e.content.flatMap((t) =>
              "notes" in t && t.notes !== undefined ? t.notes : [],
            )
          : [],
    );
  const beamGroupStaves = beamGroupNotes.reduce(
    (acc, note) => acc.add(note?.staff ?? 1),
    new Set(),
  );
  const { rangeClef } = getPitches(beamGroup[0].clef.clef);
  // compare acc's bounds against chord's bounds, and push lower down and upper up
  const { bounds, direction } = getStemDirectionForChord(
    beamGroupNotes,
    rangeClef!.midline,
  );
  const stemDirection =
    beamGroupStaves.size > 1
      ? beamGroup[0].staff % beamGroupStaves.size === 0
        ? "down"
        : "up"
      : beamGroup[0].partVoices === 1
        ? direction
        : beamGroup[0].voice % beamGroup[0].partVoices === 1
          ? "up"
          : "down";
  const noteStaff =
    stemDirection === "up"
      ? beamGroup[0].staff
      : beamGroup[beamGroup.length - 1].staff;
  // TODO: sub-beam count should shift terminus up/down by count * 2
  const maxSubBeamCountInGroup = beamGroup.reduce(
    (acc, event) =>
      Math.max(
        acc,
        getSubBeamCountFromBeamEvent(event as Minim.Event.BeamedEventItem) || 0,
      ),
    0,
  );
  // TODO: notes past first leger line must reach midline
  // TODO: any system incipit matter (clef, key signature) should be "cleared"
  // by beam if entering at start of system.
  const terminus =
    stemDirection === "up"
      ? getDiatonicTransposition(bounds!.upper, 7 + 2 * maxSubBeamCountInGroup)
      : getDiatonicTransposition(
          bounds!.lower,
          -7 - 2 * maxSubBeamCountInGroup,
        );
  return {
    direction: stemDirection,
    pitch: terminus,
    row: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${terminus}`,
    noteStaff,
  };
}

/* Leger lines: Helper methods */
export function getLegerLines({
  clef,
  clefs,
  notes,
  pitchPrefix = null,
}: {
  clef: MNX.Part.Clef;
  clefs: MNX.Part.Clef[];
  notes: MNX.Defs.Note[];
  pitchPrefix?: string | null;
}) {
  if (!notes) return null;

  const legerLines = notes.reduce(
    (
      acc: Minim.Component.LegerLine[],
      note: MNX.Defs.Note,
    ): Minim.Component.LegerLine[] => {
      const { staffBounds } = getPitches(
        clefs[(note?.staff ?? 1) - 1].clef ?? clef.clef,
      );
      const pitchString = getPitchString(note);
      const lowerThanTop = getLowestPitch(pitchString, staffBounds!.upper.id);
      const higherThanBottom = getHighestPitch(
        pitchString,
        staffBounds!.lower.id,
      );
      // First, is note outside staff?
      if (pitchString === lowerThanTop && pitchString === higherThanBottom) {
        // Nope, no leger lines needed for this note.
        return acc;
      }
      // Second, if outside, is it below or above?
      else {
        const position =
          staffBounds!.upper.id === lowerThanTop ? "upper" : "lower";
        // Third, calculate leger line count and position.
        const interval = getDiatonicInterval(
          pitchString,
          staffBounds![position].id,
        );
        const count = Math.sign(interval) * Math.floor(Math.abs(interval) / 2);
        const condition =
          position === "upper"
            ? interval > 0 && count > 0
            : interval < 0 && count < 0;
        const prefix = pitchPrefix ? `${pitchPrefix}s${note.staff ?? 1}` : null;
        const lines: Minim.Component.LegerLine[] = condition
          ? Array.from({ length: Math.abs(count) }, (_, i) => i)
              .map((index) => ({
                index,
                pitch: `${prefix ?? ""}${getDiatonicTransposition(
                  staffBounds![position].id,
                  (position === "lower" ? -2 : 2) * (index + 1),
                )}`,
              }))
              .flat()
          : [];
        return [...acc, ...(lines ? lines : [])];
      }
    },
    [],
  );
  // De-duplicate leger lines (i.e. if two notes in chord
  // are below staff, only draw one set of leger lines).
  return legerLines.length === 0 ? null : [...new Set(legerLines.flat())];
}

export function decorateEvent({
  event,
  i,
  acc,
  flowId,
  voice,
  voiceItem = null,
  part,
  partIndex,
}: {
  event: Minim.Part.SequenceItem;
  i: Minim.Defs.Index;
  acc: Minim.Event.EventItem[];
  flowId: MNX.Defs.ID;
  voice: Minim.Part.Sequence;
  voiceItem?: Minim.Event.EventGroup | null;
  part: Minim.Part.PartItem;
  partIndex: Minim.Defs.Index;
}) {
  const _duration =
    event.type === "tuplet"
      ? event.outer.duration !== undefined
        ? toNumericalDuration(event.outer.duration) * event.outer.multiple
        : 0
      : "duration" in event && event.duration !== undefined
        ? toNumericalDuration(
            event.type === "space" ? event.duration.duration : event.duration,
          )
        : 0;
  const voiceNumber = voice?.voice ?? 1;
  const staffNumber = voice?.staff ?? 1;
  const positionRestartConditions =
    acc.length === 0 ||
    acc[acc.length - 1].partIndex !== partIndex ||
    acc[acc.length - 1].voice !== voiceNumber ||
    acc[acc.length - 1].staff !== staffNumber;
  const prevEventPosition =
    acc.length > 0
      ? !["event", "tuplet"].includes(acc[acc.length - 1].type)
        ? (acc[acc.length - 1].position as Minim.At).at
        : (acc[acc.length - 1].position as Minim.Bounds).end
      : 0;
  const positionStart = positionRestartConditions ? 0 : prevEventPosition;
  const position =
    _duration !== 0
      ? ({
          start: positionStart,
          end: positionRestartConditions
            ? _duration
            : prevEventPosition + _duration,
        } as Minim.Bounds)
      : ({
          at: positionStart,
        } as Minim.At);
  acc.push({
    ...event,
    renderId: `${event.id}_rep${i}`,
    flowId,
    partId: part.id,
    partIndex,
    partVoices: part.sequences.length,
    // TODO: rename to 'voiceNumber'
    voice: voiceNumber,
    eventGroup: voiceItem,
    clef: part.global.clefs[staffNumber - 1],
    clefs: part.global.clefs,
    // TODO: rename to 'staffNumber'
    staff: staffNumber,
    staves: Array.from({ length: part.global.staves || 1 }, (_, i) => i + 1),
    index: acc[acc.length - 1] ? acc[acc.length - 1]?.index + i + 1 : i,
    position,
    dimensions: {
      length: _duration,
    },
  });
}

export function getStavesForFlow(flow: Minim.Document.FlowItem) {
  return (flow.parts as Minim.Part.PartItem[]).map((part, partIndex) => ({
    part: {
      ...part,
      partIndex,
    },
    staves: Array.from({ length: part.global.staves || 1 }, (_, i) => {
      const clef = {
        ...part.global.clefs.find((c) => c.staff === i + 1),
        partIndex,
      };
      const { pitches, pitchesArray, prefix, rangeClef, staffBounds } =
        getPitches(clef?.clef, `${flow.id}p${partIndex}s${i + 1}`);
      return {
        clef,
        flowId: flow.id,
        partIndex,
        pitches,
        pitchesArray,
        prefix,
        rangeClef,
        staffBounds,
        staffIndex: i,
      } as Minim.Layout.Staff;
    }),
    // TODO: overlap staves[i].pitches to approximate desired staff spacing,
    // expressed as `partPitches`
  }));
}

export function getColumnsForPeriod({
  flows,
  end,
  final = false,
}: {
  flows: Minim.Period.PeriodItem["flows"];
  end: Minim.DisplayUnit.Position;
  final: boolean;
}) {
  const uniqueStarts = Object.groupBy(
    Object.values(flows).flat() as (
      | Minim.Event.EventItem
      | Minim.Event.DisplayItem
    )[],
    (e) =>
      ["event", "tuplet"].includes(e.type)
        ? ((e as Minim.Event.EventItem).position as Minim.Bounds).start
        : (e as typeof e & Minim.At).at,
  );

  // TODO: reduce should return an object with named grid lines and track widths,
  // that we can THEN use to insert last columns and properly format
  const columns = Object.entries(uniqueStarts)
    .reduce((acc, [start], index, starts) => {
      const nextEntryFirstStart =
        index < starts.length - 1 ? starts[index + 1][1]![0] : null;
      const nextEntryFirstStartPosition = !nextEntryFirstStart
        ? null
        : (
              nextEntryFirstStart as
                | Minim.Event.EventItem
                | Minim.Event.DisplayItem
            ).type === "displayEvent"
          ? (nextEntryFirstStart as Minim.Event.DisplayItem).at
          : (
              (nextEntryFirstStart as Minim.Event.EventItem)
                .position as Minim.Bounds
            ).start;
      const columnWidth =
        index < starts.length - 1
          ? nextEntryFirstStartPosition - parseInt(start) + "fr"
          : end - parseInt(start) + "fr" || "auto";
      if (index === starts.length - 1) {
        // Add start- and end-positions for the last event of a period's flows
        return `${acc}${makeColumn({ start, columnWidth })}${makeColumn({ start: end, columnWidth: "auto", final })}`;
      } else {
        return `${acc}${makeColumn({ start, columnWidth })}`;
      }
    }, "[")
    .concat("]");
  return columns;
}
type ColumnGeneratorProps = {
  start: Minim.DisplayUnit.Position | string;
  columnWidth: string;
  final?: boolean;
};
export function makeColumn({
  start,
  columnWidth,
  final = false,
}: ColumnGeneratorProps) {
  const columnArray = getColumnArray({ start, columnWidth, final });
  return columnArray.reduce(
    (str, column, index) =>
      `${str}${index > 0 ? "[" : ""}${column.lines.join(" ")}${index !== columnArray.length - 1 ? `] ${column.value} ` : " "}`,
    "",
  );
}
// Every possible event placement type is given its own named column line (per *event*)
// TODO: Final measure of all flows should end at 'bar'
export function getColumnArray({
  start,
  columnWidth,
  final = false,
}: ColumnGeneratorProps) {
  const columns = [
    {
      lines: ["start", "text"],
      value: "auto",
    },
    {
      lines: ["bracket"],
      value: "auto",
    },
    {
      lines: ["bar-start"],
      value: "auto",
    },
    {
      final: true,
      lines: final ? ["bar-end"] : ["bar-end", "cle"],
      value: "auto",
    },
    {
      lines: ["key"],
      value: "auto",
    },
    {
      lines: ["tim"],
      value: "auto",
    },
    {
      lines: ["flow-start"],
      value: "auto",
    },
    {
      lines: ["acc"],
      value: "auto",
    },
    {
      lines: ["art"],
      value: "auto",
    },
    {
      lines: ["not"],
      value: "0.25em",
    },
    {
      lines: ["ste-up"],
      value: "auto",
    },
    {
      lines: ["trailing-space"],
      value: `minmax(0.1em, ${columnWidth})`,
    },
    {
      lines: ["flow-end", "me-cle"],
      value: "auto",
    },
    {
      lines: ["me-bar"],
      value: "auto",
    },
    {
      lines: ["me-key"],
      value: "auto",
    },
    {
      lines: ["me-tim"],
      value: "auto",
    },
    {
      lines: ["end"],
      value: false,
    },
  ];
  const result = [];
  for (const column of columns) {
    result.push({
      value: column.value,
      lines: column.lines.map((line) => `e${start}-${line}`),
    });
    if (final && column.final) break;
  }
  return result;
}

export function areClefsEqual(
  clefsA: MNX.Part.Clef[],
  clefsB: MNX.Part.Clef[],
) {
  return clefsA.every(
    (clef, clefIndex) =>
      clef.clef.sign === clefsB[clefIndex].clef.sign &&
      clef.clef.staffPosition === clefsB[clefIndex].clef.staffPosition,
  );
}

//
export function getRowString(
  layoutMember: MNX.Layout.SystemLayoutContentSource,
  layoutMemberIndex: Minim.Defs.Index,
  layoutMembers: MNX.Layout.SystemLayoutContentSource[],
  clefs: Minim.Event.MeasureClef[],
  flowId: MNX.Defs.ID,
  partIds: MNX.Defs.ID[],
) {
  const staffNumber = layoutMember?.staff ?? 1;
  const partIndex = partIds.indexOf(layoutMember.part);
  const clef = clefs.find(
    (c) =>
      c.partIndex === partIndex &&
      (c.staff !== undefined ? c.staff === staffNumber : true),
  );
  const { staffBounds } = getPitches(clef!.clef);
  const rowString =
    layoutMembers.length === 1
      ? [
          `${flowId}p${partIndex}s${staffNumber}${staffBounds!.upper.id}`,
          `${flowId}p${partIndex}s${staffNumber}${staffBounds!.lower.id}`,
        ]
      : `${flowId}p${partIndex}s${staffNumber}${staffBounds![layoutMemberIndex === 0 ? "upper" : "lower"].id}`;
  return rowString;
}

export function getFlowLayoutAtPoint({
  at,
  flow,
  clefs,
  point,
  layoutId,
}: {
  at: Minim.Defs.StartOrEnd;
  flow: Minim.Component.Flow | Minim.Document.FlowItem;
  clefs: Minim.Event.MeasureClef[];
  point: Minim.DisplayUnit.Position;
  layoutId?: MNX.Defs.ID;
}) {
  function group(
    content: MNX.Layout.SystemLayoutContentItem[],
  ): Minim.Layout.SystemLayoutContentItem[] {
    return content.flatMap(
      (item) =>
        item.type === "group"
          ? {
              ...item,
              type: item.type,
              flowId: flow.id,
              content: group(item.content),
              symbol: item.symbol,
            }
          : item, // item.type === "staff"
    );
  }

  const layout = flow.layouts.find(
    (layout) =>
      layout.id ===
      (layoutId ??
        (
          (flow.type === "componentFlow"
            ? flow.measures
            : flow.global.measures) as Minim.Document.MeasureItem[]
        ).find((m: Minim.Document.MeasureItem) => m.layout)?.layout),
  );
  const groups = group(layout!.content);
  const partIds = flow.parts.map((part) => part.id);

  function getGroupRow(
    group: Minim.Layout.SystemLayoutContentItem,
  ): Minim.Grid.Row[] {
    if (group.type === "group") {
      return group.content.flatMap((member) => {
        if (member.type === "group") {
          return getGroupRow(member);
        } else {
          return member.sources.flatMap(
            (memberSource, memberSourceIndex, memberSources) =>
              getRowString(
                memberSource,
                memberSourceIndex,
                memberSources,
                clefs,
                flow.id,
                partIds,
              ),
          );
        }
      });
    } else {
      // type="staff"
      return group.sources.flatMap((member, memberIndex, members) =>
        getRowString(member, memberIndex, members, clefs, flow.id, partIds),
      );
    }
  }

  return groups.map((group) => ({
    ...group,
    at: point,
    position: at,
    row: getGroupRow(group),
  }));
}

export function getFlowLayoutBarlinesAtPoint({
  at,
  flow,
  clefs,
  point,
  measure,
  measureIndex,
}: {
  at: Minim.Defs.StartOrEnd;
  flow: Minim.Component.Flow | Minim.Document.FlowItem;
  clefs: Minim.Event.MeasureClef[];
  point: Minim.DisplayUnit.Position;
  measure: Minim.Event.Measure;
  measureIndex: Minim.Defs.Index;
}): Minim.Event.LayoutGroup[] {
  const groups = getFlowLayoutAtPoint({
    at,
    flow,
    clefs,
    point,
    layoutId: measure.layout,
  });
  return groups.map((group) => {
    // TODO: should account for measure.repeatCount
    const isLastMeasure =
      measureIndex ===
      (flow.type === "documentFlow" ? flow.global.measures : flow.measures)
        .length -
        1;
    return {
      ...group,
      flowId: flow.id,
      barline: {
        type: at === "end" && isLastMeasure ? "final" : "regular",
        column: `e${point}-bar`,
        columnLastInSystem: `e${point}-me-bar`,
        final: false,
        row: `${group.row[0]}/${group.row.at(-1)}`,
        // TODO: Check that I haven't ruined barline separation logic!
        separation: at !== "end" || (at !== "end" && !isLastMeasure),
      },
    };
  });
}

export function getLayoutEventsForPeriod({
  flows,
  start,
  end,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
  start: Minim.DisplayUnit.Position;
  end: Minim.DisplayUnit.Position;
}): Minim.Period.PeriodItem["layoutEvents"] {
  return Object.values(flows).flatMap((flow) =>
    flow.layoutEvents.filter((event) => {
      if (event.at >= start && event.at <= end) {
        if (
          event.measureBounds.start >= start &&
          event.measureBounds.end <= end
        ) {
          // period contains an entire measure; return events of eventType "measureStart" and "measureEnd"
          return event;
        } else if (
          event.measureBounds.start >= start &&
          event.measureBounds.start < end &&
          event.measureBounds.end > end
        ) {
          // period contains the beginning of a measure; return events of eventType "measureStart"
          return event.eventType === "measureStart";
        } else if (
          event.measureBounds.end > start &&
          event.measureBounds.end <= end &&
          event.measureBounds.start < start
        ) {
          // period contains the ending of a measure; return events of eventType "measureEnd"
          return event.eventType === "measureEnd";
        }
      }
    }),
  );
}

// TODO: Get flow's state of display events at a specific point.
// Used to render system-start and cautionary clefs/meters/key signatures.
export function getDisplayEventsForPeriod({
  flows,
  start,
  end,
}: {
  flows: {
    [k: Minim.Component.Flow["id"]]: Minim.Period.PeriodItem["displayEvents"];
  };
  start: Minim.DisplayUnit.Position;
  end: Minim.DisplayUnit.Position;
}) {
  return Object.values(flows).flatMap((displayEvents) =>
    displayEvents.filter((event) => {
      if (event.at >= start && event.at <= end) {
        if (
          event.measureBounds.start >= start &&
          event.measureBounds.end <= end
        ) {
          // period contains an entire measure; return events of eventType "measureStart" and "measureEnd"
          return event;
        } else if (
          event.measureBounds.start >= start &&
          event.measureBounds.start < end &&
          event.measureBounds.end > end
        ) {
          // period contains the beginning of a measure; return events of eventType "measureStart"
          return event.eventType === "measureStart";
        } else if (
          event.measureBounds.end > start &&
          event.measureBounds.end <= end &&
          event.measureBounds.start < start
        ) {
          return event.eventType === "measureEnd";
        }
      }
    }),
  );
}
export function getSubBeamCountFromBeamEvent(
  beamEvent: Minim.Event.DurationalItem,
) {
  const _eighthIndex = durationMap.value.indexOf(DURATION.EIGHTH);
  const _durationIndex = durationMap.key.indexOf(
    beamEvent.type === "tuplet"
      ? beamEvent.outer.duration.base
      : beamEvent.type === "space"
        ? beamEvent.duration.duration.base
        : beamEvent.duration!.base,
  );
  const _duration = durationMap.value[_durationIndex];
  return _duration <= DURATION.EIGHTH ? _eighthIndex - _durationIndex : 0;
}
export function getBeamGroupsForPeriod({
  flows,
  start,
  end,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
  start: Minim.DisplayUnit.Position;
  end: Minim.DisplayUnit.Position;
}) {
  return Object.entries(flows).reduce(
    (acc, [flowId, flow]) => ({
      ...acc,
      [flowId]: flow.beamGroups
        .filter(
          (beamGroup) =>
            ((beamGroup[0].position as Minim.Bounds).start >= start &&
              (beamGroup[0].position as Minim.Bounds).start < end &&
              (beamGroup.at(-1)!.position as Minim.Bounds).start >= end) ||
            ((beamGroup.at(-1)!.position as Minim.Bounds).start >= start &&
              (beamGroup.at(-1)!.position as Minim.Bounds).start < end) ||
            ((beamGroup[0].position as Minim.Bounds).start < start &&
              (beamGroup.at(-1)!.position as Minim.Bounds).start >= end),
        )
        .map((beamGroup) =>
          beamGroup.map((beamEvent) => {
            const subBeamCount = getSubBeamCountFromBeamEvent(beamEvent);
            const firstMemberPosition = beamGroup[0].position as Minim.Bounds;
            const lastMemberPosition = beamGroup.at(-1)!
              .position as Minim.Bounds;

            return {
              ...beamEvent,
              beam:
                firstMemberPosition.start < start &&
                lastMemberPosition.start >= end
                  ? {
                      clip: "both",
                      start: `e${start}-bar`,
                      end: `e${end}-end`,
                      subBeamCount,
                    }
                  : firstMemberPosition.start < start
                    ? {
                        clip: "start",
                        start: `e${start}-bar`,
                        end: lastMemberPosition.start,
                        subBeamCount,
                      }
                    : lastMemberPosition.start >= end
                      ? {
                          clip: "end",
                          start: (beamEvent.position as Minim.Bounds).start,
                          end: `e${end}-end`,
                          subBeamCount,
                        }
                      : {
                          clip: "none",
                          start: firstMemberPosition.start,
                          end: lastMemberPosition.start,
                          subBeamCount,
                        },
            };
          }),
        ),
    }),
    {},
  );
}

export function getMeasuresForPeriod({
  flows,
  start,
  end,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
  start: Minim.DisplayUnit.Position;
  end: Minim.DisplayUnit.Position;
}): Minim.Period.PeriodItem["measures"] {
  return Object.entries(flows).reduce(
    (measuresAcc, [flowId, flow]) => ({
      ...measuresAcc,
      [flowId]: flow.measures
        .filter(
          (measure) =>
            /* contained within period */
            (measure.position.start >= start && measure.position.end <= end) ||
            /* straddles period */
            (measure.position.start < start && measure.position.end > end) ||
            /* starts in period */
            (measure.position.start >= start &&
              measure.position.start < end &&
              measure.position.end > end) ||
            /* ends in period */
            (measure.position.start < start &&
              measure.position.end > start &&
              measure.position.end <= end),
        )
        .map((measure) => ({
          ...measure,
          periodBounds: {
            startsInPeriod:
              measure.position.start >= start &&
              measure.position.start < end &&
              measure.position.end > end,
            endsInPeriod:
              measure.position.start < start &&
              measure.position.end > start &&
              measure.position.end <= end,
            lastInFlow: flow.measures.at(-1)!.id === measure.id,
          },
        })),
    }),
    {},
  );
}

/** For all flows, are there intersections of measure.position.start?  */
export function getMeasureStartsForPeriod({
  flows,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
}): Minim.DisplayUnit.Position[][] {
  return Object.values(flows).map((flow) =>
    flow.measures.flatMap((measure) => measure.position.start),
  );
}

/** For all flows, are there intersections of event.position.start? */
export function getEventStartsForPeriod({
  flows,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
}): Minim.DisplayUnit.Position[][] {
  return Object.values(flows).map((flow) =>
    flow.events
      .filter((event) => event.type === "event")
      .flatMap((event) => (event.position as Minim.Bounds).start),
  );
}

export function getPeriodIntersections({
  eventStarts,
  measureStarts,
}: {
  eventStarts: Minim.DisplayUnit.Position[][];
  measureStarts: Minim.DisplayUnit.Position[][];
}): Minim.DisplayUnit.Position[] {
  const periods = [
    ...new Set([
      // intersection of event starts
      ...eventStarts.reduce((a, b) => a.filter((c) => b.includes(c))),
      // TODO: should this be a true intersection of measure starts?
      ...measureStarts.flat(),
    ]),
  ].sort((a, b) => a - b);
  // TODO: Should be able to accommodate switching between periods and measures,
  // solely depending on when the score's flows are or are not "in alignment."
  // ANSWER: Don't set periods to intersections of event.position.start,
  // Use `flowMeasureStarts` instead.
  const flowMeasuresAfterPeriods = measureStarts.map((starts) =>
    starts.filter((start) => periods.at(-1)! < start),
  );
  return periods.concat(
    flowMeasuresAfterPeriods.some((flow) => flow.length > 0)
      ? [...new Set(flowMeasuresAfterPeriods.flat().sort((a, b) => a - b))]
      : [],
  );
}

export function getDisplayStartsForPeriod({
  flows,
}: {
  flows: Minim.Collection<Minim.Component.Flow>;
}): Minim.Parser.Flow.DisplayStarts {
  return Object.entries(flows).reduce(
    (acc, [flowId, flow]) => ({
      ...acc,
      [flowId]: flow.measures.flatMap((measure, mi, mm) => {
        return [
          {
            type: "displayEvent",
            clefs:
              mi > 0 && !areClefsEqual(mm[mi - 1].clefs, measure.clefs)
                ? measure.clefs.map((clef) => ({
                    ...clef,
                    column: `e${measure.position.start}-cle`,
                  }))
                : null,
            tempos:
              // TODO: Account for mid-measure tempo change
              measure?.tempos !== undefined &&
              (mi === 0 ||
                (mi > 0 &&
                  mm[mi - 1]?.tempos !== undefined &&
                  !areTempiEqual(mm[mi - 1].tempos, measure.tempos)))
                ? // TODO: Account for mid-measure tempo change
                  measure.tempos.map((tempo) => ({
                    ...tempo,
                    column: `e${measure.position.start}-tim / e${measure.position.end}-flow-end`,
                  }))
                : null,
            time:
              mi === 0 || !areTimeSignaturesEqual(mm[mi - 1].time, measure.time)
                ? {
                    ...measure.time,
                    column: `e${measure.position.start}-tim`,
                  }
                : null,
            key:
              mi > 0 && mm[mi - 1].key.fifths !== measure.key.fifths
                ? {
                    ...measure.key,
                    column: `e${measure.position.start}-key`,
                    prevFifths:
                      mi > 0
                        ? mm.slice(0, mi).findLast((m) => m.key !== undefined)!
                            .key
                        : undefined,
                  }
                : null,
            at: measure.position.start,
            eventType: "measureStart",
            flowId,
            measureBounds: {
              start: measure.position.start,
              end: measure.position.end,
            },
          },
          {
            type: "displayEvent",
            clefs:
              mi < mm.length - 1 &&
              !areClefsEqual(mm[mi + 1].clefs, measure.clefs)
                ? measure.clefs.map((clef) => ({
                    ...clef,
                    column: `e${measure.position.end}-me-cle`,
                  }))
                : null,
            time:
              mi < mm.length - 1 &&
              !areTimeSignaturesEqual(mm[mi + 1].time, measure.time)
                ? {
                    ...mm[mi + 1].time,
                    column: `e${measure.position.end}-me-tim`,
                  }
                : null,
            key:
              mi < mm.length - 1 && mm[mi + 1].key.fifths !== measure.key.fifths
                ? {
                    ...mm[mi + 1].key,
                    column: `e${measure.position.end}-me-key`,
                    prevFifths: measure.key,
                  }
                : null,
            at: measure.position.end,
            eventType: "measureEnd",
            flowId,
            measureBounds: {
              start: measure.position.start,
              end: measure.position.end,
            },
          },
        ];
      }),
    }),
    {},
  );
}

export function getAllEventsForPeriod({
  displayStarts,
  eventStarts,
  flows,
  periods,
}: {
  displayStarts: Minim.Parser.Flow.DisplayStarts;
  eventStarts: Minim.DisplayUnit.Position[][];
  flows: Minim.Collection<Minim.Component.Flow>;
  periods: Minim.DisplayUnit.Position[];
}) {
  // TODO:
  // If two flows are "in alignment" (e.g. don't diverge in meter) for their entirety,
  // how will we identify alignment and indicate render preference for the score's
  // measures concept instead of period?

  return [...new Set(eventStarts.flat())]
    .sort((a, b) => a - b)
    .reduce(
      (acc, eventStart) => {
        if (
          // Negated conditions below describe when we retain current period
          // and continue adding events to it.
          !(
            periods[acc.index] <= eventStart &&
            periods[acc.index + 1] !== undefined &&
            periods[acc.index + 1] > eventStart
          ) &&
          acc.index !== periods.length - 1
        ) {
          // New period; increment index.
          acc.index++;
        }

        const eventsAtStart: Minim.Parser.Period.EventsAtStart = Object.entries(
          flows,
        ).reduce(
          (acc, [flowId, flow]) => ({
            ...acc,
            [flowId]: [
              ...flow.events.filter(
                (event) =>
                  (event.position as Minim.Bounds).start === eventStart,
              ),
              // TODO: Are we using these displayEvents (as distinct events in period.events)?
              // As in, can we remove? Or will this become important to capture mid-measure
              // clef changes and the like?
              ...displayStarts[flowId]
                .flat()
                .filter((displayEvent) => displayEvent.at === eventStart),
            ],
          }),
          {},
        );

        const lastEvent = Object.values(eventsAtStart)
          .flatMap((flowEvents) =>
            flowEvents
              .filter((e) => e.type === "event")
              .sort(
                (a, b) =>
                  (a.position as Minim.Bounds).end -
                  (b.position as Minim.Bounds).end,
              ),
          )
          .at(-1)!.position;

        const _endValue =
          acc.index + 1 !== periods.length
            ? periods[acc.index + 1]
            : (lastEvent as Minim.Bounds).end;

        const _duration = _endValue - periods[acc.index];

        // If it's the first event in a period, initialize period with values.
        if (periods[acc.index] === eventStart) {
          const beamGroups = getBeamGroupsForPeriod({
            flows,
            start: periods[acc.index],
            end: _endValue,
          });
          const measures = getMeasuresForPeriod({
            flows,
            start: periods[acc.index],
            end: _endValue,
          });
          acc.result[periods[acc.index]] = {
            beamGroups,
            dimensions: { length: _duration },
            displayEvents: getDisplayEventsForPeriod({
              flows: displayStarts,
              start: periods[acc.index],
              end: _endValue,
            }),
            dynamics: Object.entries(flows).reduce(
              (dynAcc, [flowId, flow]) => ({
                ...dynAcc,
                [flowId]: flow.events
                  .filter((event) => event.type === "dynamic")
                  .filter(
                    (event) =>
                      (event.position as Minim.At).at >= periods[acc.index] &&
                      (event.position as Minim.At).at < _endValue,
                  ),
              }),
              {},
            ),
            flows: eventsAtStart,
            // add any flows from the previous period here
            flowsClipped: Object.keys(flows).reduce(
              (clipAcc, flowId) => ({
                ...clipAcc,
                [flowId]: {
                  start:
                    acc.next.index &&
                    acc.next.index === acc.index &&
                    acc.next.flowsClipped &&
                    acc.next.flowsClipped[flowId] &&
                    acc.next.flowsClipped[flowId].start.length > 0
                      ? acc.next.flowsClipped[flowId].start
                      : [],
                  end: [],
                },
              }),
              {},
            ),
            index: acc.index,
            key: Object.entries(measures).reduce(
              (keyAcc, [flowId, mm]) => ({
                ...keyAcc,
                [flowId]: mm.find((m) => m.position.start <= periods[acc.index])
                  ?.key,
              }),
              {},
            ),
            layoutEvents: getLayoutEventsForPeriod({
              flows,
              start: periods[acc.index],
              end: _endValue,
            }),
            measures,
            position: {
              start: periods[acc.index],
              end: _endValue,
            },
            staves: Object.entries(flows).reduce(
              (acc, [flowId, flow]) => ({ ...acc, [flowId]: flow.staves }),
              {},
            ),
          };
        } else if (periods[acc.index] < eventStart) {
          // Not the first event in period; Add to flows.
          const flowEvents: Minim.Collection<Minim.Event.DurationalItem[]> =
            Object.entries(acc.result[periods[acc.index]].flows).reduce(
              (acc, [flowId, flow]) => ({
                ...acc,
                [flowId]: [
                  ...(flow as Minim.Event.DurationalItem[]),
                  ...eventsAtStart[flowId],
                ],
              }),
              {},
            );

          // Reset `next` for flowsClipped
          if (acc.next && acc.next.index === acc.index) {
            acc.next = { index: 0, flowsClipped: {} };
          }

          // To render events that overflow the end of a system
          const flowsClipped: Minim.Parser.Period.FlowsClipped = Object.entries(
            flowEvents,
          ).reduce(
            (flowAcc, [flowId, flow]) => ({
              ...flowAcc,
              [flowId]: flow
                .filter(
                  (e): e is Minim.Event.DecoratedDefaultEvent =>
                    e.display !== "none" &&
                    e.position !== undefined &&
                    "end" in e.position &&
                    e.position.end !== undefined &&
                    e.position.end > _endValue,
                )
                .reduce(
                  (
                    eventAcc: Minim.Parser.Period.FlowClipped,
                    e,
                  ): Minim.Parser.Period.FlowClipped => {
                    if (acc.index < periods.length) {
                      acc.next = {
                        index: acc.index + 1,
                        flowsClipped: {
                          [flowId]: {
                            start: [
                              ...(acc.next &&
                              acc.next.flowsClipped &&
                              acc.next.flowsClipped[flowId] &&
                              acc.next.flowsClipped[flowId].start.length > 0
                                ? acc.next.flowsClipped[flowId].start
                                : []),
                            ].concat([
                              {
                                ...e,
                                // TODO: Update eventGroup (if one) with beams[{events: [<insert event>]}]
                                clipPosition: "start" as const,
                                dimensions: {
                                  length:
                                    (e.position as Minim.Bounds).end -
                                    _endValue,
                                },
                                duration: lengthToDurationObj(
                                  (e.position as Minim.Bounds).end - _endValue,
                                ),
                                position: {
                                  start: _endValue,
                                  end: (e.position as Minim.Bounds).end,
                                } as Minim.Bounds,
                                ...("notes" in e
                                  ? {
                                      notes: [
                                        ...(e.notes !== undefined
                                          ? e.notes.map((n) => ({
                                              ...n,
                                              tie: {},
                                            }))
                                          : []),
                                      ],
                                    }
                                  : {}),
                              },
                            ]),
                            end: [],
                          },
                        },
                      };
                    }
                    return {
                      start:
                        acc.result[periods[acc.index]].flowsClipped[flowId]
                          .start || [],
                      end: [
                        ...(eventAcc.end as Minim.Event.Clip[]).filter(
                          (item): item is Minim.Event.Clip =>
                            "start" in item.position,
                        ),
                        {
                          ...e,
                          // TODO: Update eventGroup (if one) with beams[{events: [<insert event>]}]
                          clipPosition: "end",
                          dimensions: {
                            length:
                              _endValue - (e.position as Minim.Bounds).start,
                          },
                          duration: lengthToDurationObj(
                            _endValue - (e.position as Minim.Bounds).start,
                          ),
                          position: {
                            ...e.position,
                            end: _endValue,
                          } as Minim.Bounds,
                          ...("notes" in e
                            ? {
                                notes: [
                                  ...(e.notes !== undefined
                                    ? e.notes.map((n) => ({
                                        ...n,
                                        tie: {},
                                      }))
                                    : []),
                                ],
                              }
                            : {}),
                        },
                      ],
                    };
                  },
                  {
                    start:
                      acc.result[periods[acc.index]].flowsClipped[flowId]
                        .start || [],
                    end: [],
                  },
                ),
            }),
            {},
          );

          // Otherwise, add new eventStart to events[]
          acc.result[periods[acc.index]] = {
            ...acc.result[periods[acc.index]],
            beamGroups: getBeamGroupsForPeriod({
              flows,
              start: periods[acc.index],
              end: _endValue,
            }),
            dimensions: { length: _duration },
            displayEvents: [
              ...new Set([
                ...acc.result[periods[acc.index]].displayEvents,
                ...getDisplayEventsForPeriod({
                  flows: displayStarts,
                  start: periods[acc.index],
                  end: _endValue,
                }),
              ]),
            ],
            flows: flowEvents,
            flowsClipped,
            layoutEvents: [
              ...new Set([
                ...acc.result[periods[acc.index]].layoutEvents,
                ...getLayoutEventsForPeriod({
                  flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
              ]),
            ],
            position: {
              ...acc.result[periods[acc.index]].position,
              end: _endValue,
            },
          };
        }

        return acc;
      },
      { result: {}, index: 0, next: {} } as {
        result: Minim.Period.PeriodItem[];
        index: number;
        next: {
          index: Minim.Defs.Index;
          flowsClipped: Minim.Parser.Period.FlowsClipped;
        };
      },
    ).result;
}

/** Are two tempi exactly equal? */
export function areTempiEqual(a: MNX.Defs.Tempo[], b: MNX.Defs.Tempo[]) {
  if (!a || !b) return true;
  return a.every(
    (tempo, tempoIndex) =>
      tempo.bpm === b[tempoIndex].bpm &&
      tempo.value.base === b[tempoIndex].value.base &&
      (tempo.value.dots ? tempo.value.dots === b[tempoIndex].value.dots : true),
  );
}
function getDurationalUnitsPerMinute(tempo: MNX.Defs.Tempo) {
  return toNumericalDuration(tempo.value) * tempo.bpm;
}
/** Are two tempi having different display expressions equal? */
export function areTempiEquivalent(a: MNX.Defs.Tempo, b: MNX.Defs.Tempo) {
  if (!a || !b) return false;
  const aMinuteLength = getDurationalUnitsPerMinute(a);
  const bMinuteLength = getDurationalUnitsPerMinute(b);
  return aMinuteLength === bMinuteLength;
}
export function getBaseFromEquivalentTempo(
  tempoA: MNX.Defs.Tempo,
  bpmB: MNX.Defs.Tempo["bpm"],
) {
  return getDurationalUnitsPerMinute(tempoA) / bpmB;
}
export function getBPMFromEquivalentTempo(
  tempoA: MNX.Defs.Tempo,
  valueB: MNX.Defs.Tempo["value"],
) {
  return getDurationalUnitsPerMinute(tempoA) / toNumericalDuration(valueB);
}

export function getObjectFraction(position: MNX.Defs.RhythmicPosition) {
  const [numerator, denominator] = position.fraction;
  return numerator / denominator;
}
export function getBeforeObjectFraction(position: MNX.Defs.RhythmicPosition) {
  const [numerator, denominator] = position.fraction;
  return (denominator - numerator) / denominator;
}
