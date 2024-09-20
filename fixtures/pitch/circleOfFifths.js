const circleOfFifths = [
  {
    id: 1,
    note: ['G'],
    rel: {
      sharp: {
        inKeys: [0, 2, 3, 5, 7, 8, 10]
      },
      flat: {
        inKeys: [0, 3, 5, 8, 10]
      }
    },
    inKeys: [0, 2, 3, 5, 7, 8, 10],
    relativeToC: 7
  },
  {
    id: 2,
    note: ['D'],
    rel: {
      sharp: {
        inKeys: [0, 2, 7, 9]
      },
      flat: {
        inKeys: [0, 3, 5, 10]
      },
      asNeutral: {
        inKeys: [0, 2, 3, 5, 7, 9, 10]
      }
    },
    inKeys: [0, 2, 3, 5, 7, 9, 10],
    relativeToC: 2
  },
  {
    id: 3,
    note: ['A'],
    rel: {
      sharp: {
        inKeys: [0, 2, 4, 7, 9]
      },
      flat: {
        inKeys: [0, 5, 10]
      },
      asNeutral: {
        inKeys: [0, 2, 4, 5, 7, 9, 10]
      }
    },
    inKeys: [0, 2, 4, 5, 7, 9, 10],
    relativeToC: 9
  },
  {
    id: 4,
    note: ['E', 'Fb'],
    rel: {
      sharp: {
        inKeys: [0, 2, 4, 7, 9, 11]
      },
      flat: {
        index: 6,
        inKeys: [0, 5, 11]
      }
    },
    inKeys: [0, 2, 4, 5, 7, 9, 11],
    relativeToC: 4
  },
  {
    id: 5,
    note: ['B', 'Cb'],
    rel: {
      sharp: {
        inKeys: [0, 2, 4, 6, 7, 9, 11]
      },
      flat: {
        index: 5,
        inKeys: [0, 6, 11]
      }
    },
    inKeys: [0, 2, 4, 6, 7, 9, 11],
    relativeToC: 11
  },
  {
    id: 6,
    note: ['F#', 'Gb'],
    rel: {
      sharp: {
        index: 0,
        inKeys: [1, 2, 4, 6, 7, 9, 11]
      },
      flat: {
        index: 4,
        inKeys: [1, 6, 11]
      }
    },
    inKeys: [1, 2, 4, 6, 7, 9, 11],
    relativeToC: 6
  },
  {
    id: 7,
    note: ['C#', 'Db'],
    rel: {
      sharp: {
        index: 1,
        inKeys: [1, 2, 4, 6, 9, 11]
      },
      flat: {
        index: 3,
        inKeys: [1, 6, 8, 11]
      }
    },
    inKeys: [1, 2, 4, 6, 8, 9, 11],
    relativeToC: 1
  },
  {
    id: 8,
    note: ['G#', 'Ab'],
    rel: {
      sharp: {
        index: 2,
        inKeys: [1, 4, 6, 9, 11]
      },
      flat: {
        index: 2,
        inKeys: [1, 3, 6, 8, 11]
      }
    },
    inKeys: [1, 3, 4, 6, 8, 9, 11],
    relativeToC: 8
  },
  {
    id: 9,
    note: ['D#', 'Eb'],
    rel: {
      sharp: {
        index: 3,
        inKeys: [1, 4, 6, 11]
      },
      flat: {
        index: 1,
        inKeys: [1, 3, 6, 8, 10, 11]
      }
    },
    inKeys: [1, 3, 4, 6, 8, 10, 11],
    relativeToC: 3
  },
  {
    id: 10,
    note: ['A#', 'Bb'],
    rel: {
      sharp: {
        index: 4,
        inKeys: [1, 6, 11]
      },
      flat: {
        index: 0,
        inKeys: [1, 3, 5, 6, 8, 10, 11]
      }
    },
    inKeys: [1, 3, 5, 6, 8, 10, 11],
    relativeToC: 10
  },
  {
    id: 11,
    note: ['E#', 'F'],
    rel: {
      sharp: {
        index: 5,
        inKeys: [0, 1, 6]
      },
      flat: {
        inKeys: [0, 1, 3, 5, 6, 8, 10]
      }
    },
    inKeys: [0, 1, 3, 5, 6, 8, 10],
    relativeToC: 5
  },
  {
    id: 0,
    note: ['B#, C'],
    rel: {
      sharp: {
        index: 6,
        inKeys: [0, 1, 7]
      },
      flat: {
        inKeys: [0, 1, 3, 5, 8, 10]
      },
      asNeutral: {
        inKeys: [0, 1, 3, 5, 7, 7, 10]
      }
    },
    inKeys: [0, 1, 3, 5, 7, 8, 10],
    relativeToC: 0
  }
]

export default circleOfFifths;
