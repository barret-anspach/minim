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
export function getStem(
  chord,
  midline,
  direction = null,
  beam = null,
  pitchPrefix = null,
) {
  const { bounds, direction: chordDirection } = getStemDirectionForChord(
    chord,
    midline,
  );
  const stemDirection = direction ?? chordDirection;
  // *** presumes pitches in chord pitches are ordered from top to bottom
  const noteStaff =
    stemDirection === "up" ? chord[0].staff : chord[chord.length - 1].staff;
  const terminus = beam
    ? beam.pitch
    : stemDirection === "up"
      ? getDiatonicTransposition(bounds.upper, 7)
      : getDiatonicTransposition(bounds.lower, -7);
  return {
    direction: stemDirection,
    row:
      stemDirection === "up"
        ? {
            start: `${pitchPrefix ? `${pitchPrefix}s${beam ? beam.staff : noteStaff}` : null}${terminus}`,
            end: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${bounds.lower}`,
          }
        : {
            start: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${bounds.upper}`,
            end: `${pitchPrefix ? `${pitchPrefix}s${beam ? beam.staff : noteStaff}` : null}${terminus}`,
          },
    noteStaff,
  };
}
export function getBeamGroupStem(beamGroup, pitchPrefix = null) {
  // TODO: Lots of cleanup to do here. And a lot more complexity to add, unfortunately.
  // Pitch:
  // Get bounds for all pitches under beam
  const beamGroupNotes = beamGroup
    .filter((e) => e.notes)
    .flatMap((e) => e.notes);
  /*  Direction:
      If multiple voices,
          voice 1: "up"
          voice 2: "down"
   */
  const beamGroupStaves = beamGroupNotes.reduce(
    (acc, note) => acc.add(note.staff),
    new Set(),
  );
  // const beamGroupNoteStaves = beamGroupNotes.map((note) => note.staff, []);
  // const staffWithMostNotes = Array.from(new Set(beamGroupNoteStaves)).reduce(
  //   (prev, curr) =>
  //     beamGroupNoteStaves.filter((el) => el === curr).length >
  //     beamGroupNoteStaves.filter((el) => el === prev).length
  //       ? curr
  //       : prev,
  // );
  const directionForMultipleVoices =
    beamGroup[0].partVoices === 1
      ? direction
      : beamGroup[0].voice % beamGroup[0].partVoices === 1
        ? "up"
        : "down";
  const directionForMultipleStaves =
    beamGroupStaves.size > 1
      ? beamGroup[0].staff % beamGroupStaves.size === 0
        ? "down"
        : "up"
      : directionForMultipleVoices;
  const stemDirection = directionForMultipleStaves;
  const noteStaff =
    stemDirection === "up"
      ? beamGroup[0].staff
      : beamGroup[beamGroup.length - 1].staff;
  const {
    rangeClef: { midline },
  } = getPitches(
    stemDirection === "up"
      ? beamGroup[0].clef.clef
      : beamGroup.at(-1).clef.clef,
  );
  // compare acc's bounds against chord's bounds, and push lower down and upper up
  const { bounds, direction } = getStemDirectionForChord(
    beamGroupNotes,
    midline,
  );
  const terminus =
    stemDirection === "up"
      ? getDiatonicTransposition(bounds.upper, 7)
      : getDiatonicTransposition(bounds.lower, -7);
  return {
    direction: stemDirection,
    pitch: terminus,
    row: `${pitchPrefix ? `${pitchPrefix}s${noteStaff}` : null}${terminus}`,
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
  // De-duplicate leger lines (i.e. if two notes in chord are below staff,
  // only draw one set of leger lines);
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
}) {
  const _duration = toNumericalDuration(event.duration);
  acc.push({
    ...event,
    renderId: `${event.id}_rep${i}`,
    flowId,
    partId: part.id,
    partIndex,
    partVoices: part.sequences.length,
    // TODO: rename to 'voiceNumber'
    voice: voice.voice,
    eventGroup: voiceItem,
    clef: part.global.clefs[voice.staff - 1],
    clefs: part.global.clefs,
    // TODO: rename to 'staffNumber'
    staff: voice.staff,
    staves: Array.from({ length: part.global.staves }, (_, i) => i + 1),
    index: acc[acc.length - 1] ? acc[acc.length - 1]?.index + i + 1 : i,
    position: {
      start:
        acc.length === 0 ||
        acc[acc.length - 1].voice !== voice.voice ||
        acc[acc.length - 1].staff !== voice.staff
          ? 0
          : acc[acc.length - 1].position.end,
      end:
        acc.length === 0 ||
        acc[acc.length - 1].voice !== voice.voice ||
        acc[acc.length - 1].staff !== voice.staff
          ? _duration
          : acc[acc.length - 1].position.end + _duration,
    },
    dimensions: {
      length: _duration,
    },
  });
}

export function getStavesForFlow(flow) {
  return flow.parts.map((part) => ({
    part,
    staves: Array.from({ length: part.global.staves }, (_, i) => {
      const clef = part.global.clefs.find((c) => c.staff === i + 1);
      const { pitches, rangeClef, staffBounds } = getPitches(
        clef.clef,
        `${flow.id}s${i + 1}`,
      );
      return {
        clef,
        pitches,
        rangeClef,
        staffBounds,
        staffIndex: i,
      };
    }),
  }));
}
export function getColumnsForPeriod({ period }) {
  const uniqueStarts = Object.groupBy(
    Object.values(period.flows).flat(),
    (e) => (e.type === "event" ? e.position.start : e.at),
  );

  // TODO: reduce should return an object with named grid lines and track widths,
  // that we can THEN use to insert last columns and properly format
  const columns = Object.entries(uniqueStarts)
    .reduce((acc, [start, startEvents], index, starts) => {
      const columnWidth =
        index < starts.length - 1
          ? starts[index + 1][1][0].position.start - parseInt(start) + "fr"
          : (period.position.end - parseInt(start) + "fr" ?? "auto");
      if (index === starts.length - 1) {
        // Add start- and end-positions for the last event in a flow
        return `${acc}${makeColumn({ start, columnWidth })}${makeColumn({ start: period.position.end, columnWidth: "auto" })}`;
      } else {
        return `${acc}${makeColumn({ start, columnWidth })}`;
      }
    }, "[")
    .concat("]");
  return columns;
}

export function makeColumn({ start, columnWidth }) {
  const columnArray = getColumnArray({ start, columnWidth });
  return columnArray.reduce(
    (str, column, index) =>
      `${str}${index > 0 ? "[" : ""}${column.lines.join(" ")}${index !== columnArray.length - 1 ? `] ${column.value} ` : " "}`,
    "",
  );
}
// Every possible event placement type is given its own named column line (per *event*)
export function getColumnArray({ start, columnWidth }) {
  const columnArray = [
    {
      lines: ["start", "text"],
      value: "auto",
    },
    {
      lines: ["bracket"],
      value: "auto",
    },
    {
      lines: ["bar"],
      value: "auto",
    },
    {
      lines: ["cle"],
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
      lines: ["acc"],
      value: "auto",
    },
    {
      lines: ["art"],
      value: "auto",
    },
    {
      lines: ["not"],
      value: "auto",
    },
    {
      lines: ["ste-up"],
      value: "auto",
    },
    {
      lines: ["trailing-space"],
      value: `minmax(0.1rem, ${columnWidth})`,
    },
    {
      lines: ["me-cle"],
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
  return columnArray.map((column) => ({
    ...column,
    lines: column.lines.map((line) => `e${start}-${line}`),
  }));
}

export function areClefsEqual(clefsA, clefsB) {
  return clefsA.every(
    (clef, clefIndex) =>
      clef.clef.sign === clefsB[clefIndex].clef.sign &&
      clef.clef.staffPosition === clefsB[clefIndex].clef.staffPosition,
  );
}

export function getFlowLayoutAtPoint({ at, flow, clefs, point, layoutId }) {
  function group(content) {
    return content.flatMap(
      (item) =>
        item.type === "group"
          ? {
              type: item.type,
              content: group(item.content),
              symbol: item.symbol,
            }
          : item, // type="staff"
    );
  }

  const layout = flow.layouts.find(
    (layout) =>
      layout.id ===
      (layoutId ?? flow.global.measures.find((m) => m.layout).layout),
  );
  const groups = group(layout.content);

  function getRowString(member, memberIndex, members) {
    const { staffBounds } = getPitches(clefs[member.staff - 1].clef);
    const rowString =
      members.length === 1
        ? [
            `${flow.id}s${member.staff}${staffBounds.upper.id}`,
            `${flow.id}s${member.staff}${staffBounds.lower.id}`,
          ]
        : `${flow.id}s${member.staff}${staffBounds[memberIndex === 0 ? "upper" : "lower"].id}`;
    return rowString;
  }

  function getGroupRow(group) {
    if (group.type === "group") {
      return group.content.flatMap((member) => {
        if (member.type === "group") {
          return getGroupRow(member);
        } else {
          return member.sources.flatMap(
            (memberSource, memberSourceIndex, memberSources) =>
              getRowString(memberSource, memberSourceIndex, memberSources),
          );
        }
      });
    } else {
      // type="staff"
      return group.sources.flatMap((member, memberIndex, members) =>
        getRowString(member, memberIndex, members),
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
}) {
  const groups = getFlowLayoutAtPoint({
    at,
    flow,
    clefs,
    point,
    layoutId: measure.layout,
  });
  return groups.map((group) => {
    const isLastMeasure = measureIndex === flow.global.measures.length - 1;
    return {
      ...group,
      barline: {
        type: at === "end" && isLastMeasure ? "final" : "regular",
        column: at === "end" ? `e${point}-me-bar` : `e${point}-bar`,
        row: `${group.row[0]}/${group.row.at(-1)}`,
        separation: !(at === "end" || (at === "end" && isLastMeasure)),
      },
    };
  });
}

export function getLayoutEventsForPeriod({ flows, periodStart, periodEnd }) {
  return Object.values(flows).flatMap((flow) =>
    flow.layoutEvents.filter((event) => {
      if (event.at >= periodStart && event.at <= periodEnd) {
        if (
          event.measureBounds.start >= periodStart &&
          event.measureBounds.end <= periodEnd
        ) {
          // period contains an entire measure; return events of eventType "measureStart" and "measureEnd"
          return event;
        } else if (
          event.measureBounds.start >= periodStart &&
          event.measureBounds.start < periodEnd &&
          event.measureBounds.end > periodEnd
        ) {
          // period contains the beginning of a measure; return events of eventType "measureStart"
          return event.eventType === "measureStart";
        } else if (
          event.measureBounds.end > periodStart &&
          event.measureBounds.end <= periodEnd &&
          event.measureBounds.start < periodStart
        ) {
          return event.eventType === "measureEnd";
        }
      }
    }),
  );
}

// TODO: Get flow's state of display events at a specific point.
// Used to render system-start and cautionary clefs/meters/key signatures.
export function getDisplayEventsForPeriod({ flows, periodStart, periodEnd }) {
  return Object.values(flows).flatMap((displayEvents) =>
    displayEvents.filter((event) => {
      if (event.at >= periodStart && event.at <= periodEnd) {
        if (
          event.measureBounds.start >= periodStart &&
          event.measureBounds.end <= periodEnd
        ) {
          // period contains an entire measure; return events of eventType "measureStart" and "measureEnd"
          return event;
        } else if (
          event.measureBounds.start >= periodStart &&
          event.measureBounds.start < periodEnd &&
          event.measureBounds.end > periodEnd
        ) {
          // period contains the beginning of a measure; return events of eventType "measureStart"
          return event.eventType === "measureStart";
        } else if (
          event.measureBounds.end > periodStart &&
          event.measureBounds.end <= periodEnd &&
          event.measureBounds.start < periodStart
        ) {
          return event.eventType === "measureEnd";
        }
      }
    }),
  );
}

export function getBeamGroupsForPeriod({ flows, start, end }) {
  // TODO: Logic not quite right. Some artifacts and incomplete/missing beams.
  return Object.entries(flows).reduce(
    (acc, [flowId, flow]) => ({
      ...acc,
      [flowId]: flow.beamGroups
        .filter(
          (beamGroup) =>
            (beamGroup[0].position.start >= start &&
              beamGroup[0].position.start < end &&
              beamGroup.at(-1).position.start >= end) ||
            (beamGroup.at(-1).position.start >= start &&
              beamGroup.at(-1).position.start < end) ||
            (beamGroup[0].position.start < start &&
              beamGroup.at(-1).position.start >= end),
        )
        .map((beamGroup) =>
          beamGroup.map((beamEvent) => ({
            ...beamEvent,
            beam:
              beamGroup[0].position.start < start &&
              beamGroup.at(-1).position.start >= end
                ? {
                    clip: "both",
                    start: `e${start}-bar`,
                    end: `e${end}-end`,
                  }
                : beamGroup[0].position.start < start
                  ? {
                      clip: "start",
                      start: `e${start}-bar`,
                      end: beamGroup.at(-1).position.start,
                    }
                  : beamGroup.at(-1).position.start >= end
                    ? {
                        clip: "end",
                        start: beamEvent.position.start,
                        end: `e${end}-end`,
                      }
                    : {
                        clip: "none",
                        start: beamGroup[0].position.start,
                        end: beamGroup.at(-1).position.start,
                      },
          })),
        ),
    }),
    {},
  );
}
