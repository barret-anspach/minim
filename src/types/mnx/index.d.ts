export namespace MNX {
  // internal namespaces
  export namespace Defs {
    // types
    export type ID = string;
    export type Color = string;
    export type IntegerUnsigned = number;
    export type MeasureNumber = number;
    export type Orientation = string;
    export type PositiveInteger = number;
    export type SmuflFont = string;
    export type SmuflGlyph = string;
    export type SlurSide = UpOrDown;
    export type SlurTieEndLocation = string;
    export type StaffCount = number;
    export type StaffLabel = string;
    export type StaffLabelRef = string;
    export type StaffNumber = number;
    export type StaffPosition = number;
    export type StemDirection = UpOrDown;
    export type StyleClass = string;
    export type VoiceName = string;
    // enums
    export enum BarlineType {
      regular = "regular",
      dotted = "dotted",
      dashed = "dashed",
      heavy = "heavy",
      lightLight = "lightLight",
      lightHeavy = "lightHeavy",
      heavyLight = "heavyLight",
      heavyHeavy = "heavyHeavy",
      tick = "tick",
      short = "short",
      noBarline = "noBarline",
    }
    export enum BaseDuration {
      duplexMaxima = "duplexMaxima",
      maxima = "maxima",
      longa = "longa",
      breve = "breve",
      whole = "whole",
      half = "half",
      quarter = "quarter",
      eighth = "eighth",
      "16th" = "16th",
      "32nd" = "32nd",
      "64th" = "64th",
      "128th" = "128th",
      "256th" = "256th",
      "512th" = "512th",
      "1024th" = "1024th",
      "2048th" = "2048th",
      "4096th" = "4096th",
    }
    export enum EnclosureSymbol {
      parentheses = "parentheses",
      brackets = "brackets",
    }
    export enum GraceType {
      makeTime = "makeTime",
      startFollowing = "startFollowing",
      startPrevious = "startPrevious",
    }
    export enum PitchClass {
      A = "A",
      B = "B",
      C = "C",
      D = "D",
      E = "E",
      F = "F",
      G = "G",
    }
    export enum RepeatJumpType {
      dsalfine = "dsalfine",
      segno = "segno",
    }
    export enum StaffSymbol {
      bracket = "bracket",
      brace = "brace",
      noSymbol = "noSymbol",
    }
    export enum TupletDisplaySetting {
      noNumber = "noNumber",
      inner = "inner",
      both = "both",
    }
    export type UpOrDown = "up" | "down";
    // interfaces
    export type AccidentalDisplay = {
      show: boolean;
      enclosure?: Enclosure;
    };
    export type BeamListItem = {
      events: ID[];
      hooks?: Hook[];
      inner?: BeamListItem[];
    };
    export type Breath = {
      symbol?: string;
    };
    export type Clef = {
      sign: "C" | "F" | "G";
      staffPosition: StaffPosition;
      class?: StyleClass;
      color?: Color;
      glyph?: SmuflGlyph;
      octave?: number;
    };
    export type Enclosure = {
      symbol: EnclosureSymbol;
    };
    export namespace Event {
      export type Default = {
        type: "event";
        duration?: NoteValue;
        id?: ID;
        markings?: Markings;
        measure?: boolean;
        notes?: Note[];
        orient?: Orientation;
        rest?: Rest;
        slurs?: Slur[];
        smuflFont?: SmuflFont;
        staff?: StaffNumber;
        stemDirection?: StemDirection;
      };
      export type Dynamic = {
        type: "dynamic";
        value: string;
        glyph?: SmuflGlyph;
      };
      export type Grace = {
        type: "grace";
        content: Event.Default[];
        class?: StyleClass;
        color?: Color;
        graceType?: GraceType;
        slash?: boolean;
      };
      export type Ottava = {
        type: "ottava";
        end: MeasureRhythmicPosition;
        value: 1 | 2 | -1 | -2;
        orient?: Orientation;
        staff?: StaffNumber;
      };
      export type Space = {
        type: "space";
        duration: NoteValueQuantity;
      };
      export type Tuplet = {
        type: "tuplet";
        content: Event.Default[];
        inner: NoteValueQuantity;
        outer: NoteValueQuantity;
        orient?: Orientation;
        showNumber?: TupletDisplaySetting;
        showValue?: TupletDisplaySetting;
        staff?: StaffNumber;
      };
    }
    export type Hook = {
      direction: "left" | "right";
      event: ID;
    };
    export type Key = {
      fifths: number;
      class?: Defs.StyleClass;
      color?: Defs.Color;
    };
    export type Markings = {
      accent?: Pointing;
      breath?: Breath;
      softAccent?: object;
      spiccato?: object;
      staccatissimo?: object;
      staccato?: object;
      stress?: object;
      strongAccent?: Pointing;
      tenuto?: object;
      tremolo?: Tremolo;
      unstress?: object;
    };
    export type MeasureRhythmicPosition = {
      bar: MeasureNumber;
      position: RhythmicPosition;
    };
    export type Note = {
      pitch: Pitch;
      accidentalDisplay?: AccidentalDisplay;
      class?: StyleClass;
      id?: ID;
      perform?: object;
      smuflFont?: SmuflFont;
      staff?: StaffNumber;
      tie?: Tie;
    };
    export type NoteValue = {
      base: BaseDuration;
      dots?: PositiveInteger;
    };
    export type NoteValueQuantity = {
      duration: NoteValue;
      multiple: PositiveInteger;
    };
    export type Pitch = {
      octave: number;
      step: PitchClass;
      alter: number;
    };
    export type Pointing = {
      pointing?: UpOrDown;
    };
    export type Rest = {
      staffPosition?: StaffPosition;
    };
    export type RhythmicPosition = {
      fraction: [IntegerUnsigned, IntegerUnsigned];
      graceIndex?: IntegerUnsigned;
    };
    export type Slur = {
      endNote: ID;
      lineType: string;
      location: SlurTieEndLocation;
      side: SlurSide;
      sideEnd: SlurSide;
      startNote: ID;
      target: ID;
    };
    export type Tempo = {
      bpm: number;
      value: NoteValue;
      location?: RhythmicPosition;
    };
    export type Tie = {
      location?: SlurTieEndLocation;
      target?: ID;
    };
    export type Time = {
      count: Defs.PositiveInteger;
      unit: 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128;
    };
    export type Tremolo = {
      marks: PositiveInteger;
    };
  }

  export namespace Global {
    export type Measure = {
      barline?: {
        type: Defs.BarlineType;
      };
      ending?: {
        duration: number;
        class?: Defs.StyleClass;
        color?: Defs.Color;
        numbers?: number[];
        open?: boolean;
      };
      fine?: {
        location: Defs.RhythmicPosition;
        class?: Defs.StyleClass;
        color?: Defs.Color;
      };
      index?: Defs.MeasureNumber;
      jump?: {
        location: Defs.RhythmicPosition;
        type: Defs.RepeatJumpType;
      };
      key?: Defs.Key;
      number?: Defs.MeasureNumber;
      repeatEnd?: {
        times?: number;
      };
      repeatStart?: object;
      segno?: {
        location: Defs.RhythmicPosition;
        class?: Defs.StyleClass;
        color?: Defs.Color;
        glyph?: Defs.SmuflGlyph;
      };
      tempos?: Defs.Tempo[];
      time?: Defs.Time;
    };
    export type Style = {
      selector: string;
      color?: Defs.Color;
    };
  }

  export namespace Layout {
    export type SystemLayoutContentItem =
      | {
          type: "group";
          content: SystemLayoutContentItem[];
          label?: Defs.StaffLabel;
          symbol: Defs.StaffSymbol;
        }
      | {
          type: "staff";
          sources: SystemLayoutContentSource[];
          label?: Defs.StaffLabel;
          labelref?: Defs.StaffLabelRef;
          symbol?: Defs.StaffSymbol;
        };
    export type SystemLayoutContentSource = {
      part: Defs.ID;
      label?: Defs.StaffLabel;
      labelref?: Defs.StaffLabelRef;
      staff?: Defs.StaffNumber;
      stem?: Defs.StemDirection;
      voice?: Defs.VoiceName;
    };
    export type LayoutItem = {
      content: SystemLayoutContentItem[];
      id: Defs.ID;
    };
  }

  export namespace Part {
    export type SequenceItem =
      | Defs.Event.Default
      | Defs.Event.Dynamic
      | Defs.Event.Grace
      | Defs.Event.Ottava
      | Defs.Event.Space
      | Defs.Event.Tuplet;
    export type Clef = {
      clef: Defs.Clef;
      position?: Defs.RhythmicPosition;
      staff?: Defs.StaffNumber;
    };
    export type Measure = {
      sequences: Sequence[];
      beams?: Defs.BeamListItem[];
      clefs?: Part.Clef[];
    };
    export type PartItem = {
      id?: Defs.ID;
      measures?: Part.Measure[];
      name?: string;
      shortName?: string;
      smuflFont?: Defs.SmuflFont;
      staves?: Defs.StaffCount;
    };
    export type Sequence = {
      content: SequenceItem[];
      orient?: OrientationType;
      staff?: Defs.StaffNumber;
      voice?: Defs.VoiceName;
    };
  }

  export namespace Score {
    export type LayoutChange = {
      layout: Defs.ID;
      location: Defs.MeasureRhythmicPosition;
    };
    export type MultiMeasureRestItem = {
      duration: number;
      start: Defs.MeasureNumber;
      label?: string;
    };
    export type Page = {
      systems: System[];
      layout?: Defs.ID;
    };
    export type ScoreItem = {
      name: string;
      layout?: Defs.ID;
      multimeasureRests?: Score.MultiMeasureRestItem[];
      pages?: Score.Page[];
    };
    export type System = {
      measure: Defs.MeasureNumber;
      layout?: Defs.ID;
      layoutChanges?: LayoutChange[];
    };
  }

  // MNX JSON document shape
  export type MNXDocument = {
    global: {
      measures: Global.Measure[];
      styles?: Global.Style[];
    };
    mnx: {
      version: number;
      support?: {
        useAccidentalDisplay?: boolean;
      };
    };
    parts: Part.PartItem[];
    layouts?: Layout.LayoutItem[];
    scores?: Score.ScoreItem[];
  };
}
