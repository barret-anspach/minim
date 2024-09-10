import circleOfFifths from './../../fixtures/pitch/circleOfFifths';

// Some rules about key signatures:
//
// 1) All accidentals are written within the staff
// 2) Sharp navigationKeys begin with F# (Maj: semitone below tonic, min: Maj2 above tonic)
//    and ascend through circle of fifths
// 3) Flat navigationKeys begin with Bb (Maj: P4 above tonic, min: Maj3 below tonic)
//    and descend through circle of fifths

// SO:  If keySignature.sharp[major/minor] specified, I'd use the keySignature.id to iterate through the circleOfFifths,
//      starting at the beginning, (harmonicStep) => and return all semitones where harmonicStep.rel.sharp.inKeys.includes(keySignature.id)
//      Then construct the key signature with those semitones at value harmonicStep.relativeToC

//      If keySignature.flat[major/minor], same as above, but iterate through circleOfFifths starting at the end

// TODO: for all signatures, aliasId if pitch equivalency (and only surface spelling difference, e.g. AbM & G#M)

const keySignatures = [
  {
    id: 0,
    type: 'keySignature',
    neutral: {
      accidentalsCount: 0,
      accidentalSemitonesFromC: null,
      events: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      major: {
        name: 'C Major',
        abbreviation: 'C',
        tonicRelativeToC: 0
      },
      minor: {
        name: 'a minor',
        abbreviation: 'a',
        tonicRelativeToC: 9
      }
    }
  },
  {
    id: 1,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 7,
      accidentalSemitonesFromC: circleOfFifths.find(hs => hs.rel.sharp.inKeys.includes(1)).id,
      events: ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
      major: {
        name: 'C# Major',
        abbreviation: 'C#',
        tonicRelativeToC: 1
      },
      minor: {
        name: 'a# minor',
        abbreviation: 'a#',
        tonicRelativeToC: 10
      }
    },
    flat: {
      accidentalsCount: 5,
      accidentalSemitonesFromC: circleOfFifths.reverse().find(hs => hs.rel.flat.inKeys.includes(1)).id,
      events: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
      major: {
        name: 'Db Major',
        abbreviation: 'Db',
        tonicRelativeToC: 1
      },
      minor: {
        name: 'bb minor',
        abbreviation: 'bb',
        tonicRelativeToC: 10
      }
    }
  },
  {
    id: 2,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 2,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(2)).map(hs => hs.id),
      events: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
      major: {
        name: 'D Major',
        abbreviation: 'D',
        tonicRelativeToC: 2
      },
      minor: {
        name: 'b minor',
        abbreviation: 'b',
        tonicRelativeToC: 11
      }
    },
    flat: undefined
  },
  {
    id: 3,
    type: 'keySignature',
    sharp: undefined,
    flat: {
      accidentalsCount: 3,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(3)).map(hs => hs.id).reverse(),
      events: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
      major: {
        name: 'Eb Major',
        abbreviation: 'Eb',
        tonicRelativeToC: 3
      },
      minor: {
        name: 'c minor',
        abbreviation: 'c',
        tonicRelativeToC: 0
      }
    }
  },
  {
    id: 4,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 4,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(4)).map(hs => hs.id),
      events: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
      major: {
        name: 'E Major',
        abbreviation: 'E',
        tonicRelativeToC: 4
      },
      minor: {
        name: 'c# minor',
        abbreviation: 'c#',
        tonicRelativeToC: 1
      }
    },
    flat: undefined
  },
  {
    id: 5,
    type: 'keySignature',
    sharp: undefined,
    flat: {
      accidentalsCount: 1,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(5)).map(hs => hs.id).reverse(),
      events: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      major: {
        name: 'F Major',
        abbreviation: 'F',
        tonicRelativeToC: 5
      },
      minor: {
        name: 'd minor',
        abbreviation: 'd',
        tonicRelativeToC: 2
      }
    }
  },
  {
    id: 6,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 6,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(6)).map(hs => hs.id),
      events: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
      major: {
        name: 'F# Major',
        abbreviation: 'F#',
        tonicRelativeToC: 6
      },
      minor: {
        name: 'd# minor',
        abbreviation: 'd#',
        tonicRelativeToC: 3
      }
    },
    flat: {
      accidentalsCount: 6,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(6)).map(hs => hs.id).reverse(),
      events: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
      major: {
        name: 'Gb Major',
        abbreviation: 'Gb',
        tonicRelativeToC: 6
      },
      minor: {
        name: 'eb minor',
        abbreviation: 'eb',
        tonicRelativeToC: 3
      }
    }
  },
  {
    id: 7,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 1,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(7)).map(hs => hs.id),
      events: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      major: {
        name: 'G Major',
        abbreviation: 'G',
        tonicRelativeToC: 7
      },
      minor: {
        name: 'e minor',
        abbreviation: 'e',
        tonicRelativeToC: 4
      }
    },
    flat: undefined
  },
  {
    id: 8,
    type: 'keySignature',
    sharp: undefined,
    flat: {
      accidentalsCount: 4,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(8)).map(hs => hs.id).reverse(),
      events: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
      major: {
        name: 'Ab Major',
        abbreviation: 'Db',
        tonicRelativeToC: 8
      },
      minor: {
        name: 'f minor',
        abbreviation: 'f',
        tonicRelativeToC: 5
      }
    }
  },
  {
    id: 9,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 3,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(9)).map(hs => hs.id),
      events: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
      major: {
        name: 'A Major',
        abbreviation: 'A',
        tonicRelativeToC: 9
      },
      minor: {
        name: 'f# minor',
        abbreviation: 'f#',
        tonicRelativeToC: 6
      }
    },
    flat: undefined
  },
  {
    id: 10,
    type: 'keySignature',
    sharp: undefined,
    flat: {
      accidentalsCount: 2,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(10)).map(hs => hs.id).reverse(),
      events: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
      major: {
        name: 'Bb Major',
        abbreviation: 'Bb',
        tonicRelativeToC: 10
      },
      minor: {
        name: 'g minor',
        abbreviation: 'g',
        tonicRelativeToC: 7
      }
    }
  },
  {
    id: 11,
    type: 'keySignature',
    sharp: {
      accidentalsCount: 5,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.sharp.inKeys.includes(11)).map(hs => hs.id),
      events: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
      major: {
        name: 'B Major',
        abbreviation: 'B',
        tonicRelativeToC: 11
      },
      minor: {
        name: 'g# minor',
        abbreviation: 'g#',
        tonicRelativeToC: 8
      }
    },
    flat: {
      accidentalsCount: 7,
      accidentalSemitonesFromC: circleOfFifths.filter(hs => hs.rel.flat.inKeys.includes(11)).map(hs => hs.id).reverse(),
      events: ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'],
      major: {
        name: 'Cb Major',
        abbreviation: 'Cb',
        tonicRelativeToC: 11
      },
      minor: {
        name: 'ab minor',
        abbreviation: 'ab',
        tonicRelativeToC: 8
      }
    }
  }
]

export default keySignatures