import { articulationMap } from "../../components/chord/markings";
import { dynamicMap } from "../../components/dynamic";
import { MNX } from "../mnx";

/**
 * Need to clean these types up a LOT.
 *
 * a) types defining the SCORE
 *      - as in, the data
 * b) types defining the CONTEXT
 *      - as in, the shape of the parsed score data
 */

export namespace Minim {
  // Minim JSON score, based on MNX schema
  export type Score = {
    documents: Minim.Document.DocumentItem[];
    minim: {
      version: string;
    };
    metadata?: Minim.Document.ScoreData;
  };

  export namespace Document {
    export type ScoreData = {
      name: string;
      composer?: string;
      arranger?: string;
      completionDate?: string;
      copyright?: string;
      description?: string;
    };
    export type DocumentItem = {
      id: MNX.Defs.ID;
      metadata: Minim.Document.ScoreData;
      movements: Minim.Document.MovementItem[];
    };
    export type MovementItem = {
      id: MNX.Defs.ID;
      metadata: Minim.Document.ScoreData;
      content: Minim.Document.FlowItem[];
    };
    export type FlowItem = Omit<MNX.MNXDocument, "mnx"> & {
      type: "documentFlow";
      id: MNX.Defs.ID;
      global: {
        measures: Minim.Document.MeasureItem[];
      };
      layouts: MNX.Layout.LayoutItem[];
      parts: Minim.Part.PartItem[];
    };
    export type MeasureItem = MNX.Global.Measure & {
      // TODO: Rename to 'layoutId'
      layout?: MNX.Layout.LayoutItem["id"];
      repeatCount?: number;
    };
  }

  export namespace Part {
    export type SequenceItem =
      | Minim.Defs.Event.Default
      | Minim.Defs.Event.Dynamic
      | Minim.Defs.Event.Grace
      | Minim.Defs.Event.Ottava
      | Minim.Defs.Event.Space
      | Minim.Defs.Event.Tuplet;
    export type SequenceItemOrGroup =
      | Minim.Part.SequenceItem
      | Minim.Event.EventGroup;
    export type Sequence = Omit<MNX.Part.Sequence, "content" | "voice"> & {
      content: Minim.Part.SequenceItemOrGroup[];
      voice: Minim.Defs.VoiceNumber;
    };
    export type PartItem = Omit<MNX.Part.PartItem, "id" | "measures"> & {
      id: MNX.Defs.ID;
      global: {
        clefs: MNX.Part.Clef[];
        staves?: MNX.Defs.StaffCount;
      };
      sequences: Minim.Part.Sequence[];
    };
  }

  /** intermediate types, used when parsing score
   *  documents into a "render-able" form */
  export namespace Parser {
    export namespace Flow {
      export type DisplayStarts = Minim.Collection<Minim.Event.DisplayItem[]>;
    }
    export namespace Period {
      export type EventsAtStart = Minim.Collection<Minim.Event.EventItem[]>;
      export type FlowClipped = {
        start: Minim.Event.Clip[] | [];
        end: Minim.Event.Clip[] | [];
      };
      export type FlowsClipped =
        Minim.Collection<Minim.Parser.Period.FlowClipped>;
    }
  }

  export namespace Defs {
    export type BarlineType = "final" | "regular";
    export type Barline = {
      type: Minim.Defs.BarlineType;
      column: Minim.Grid.Column;
      columnLastInSystem: Minim.Grid.Column;
      final: boolean;
      row: Minim.Grid.Row;
      separation: boolean;
    };
    export type Beam = {
      direction: MNX.Defs.UpOrDown;
      pitch: Minim.Defs.PitchString;
      row: Minim.Grid.Row;
      noteStaff: MNX.Defs.StaffNumber;
      /** TODO: Already returned by getBeamGroupStem() as noteStaff: remove */
      staff: MNX.Defs.StaffNumber;
    };
    export type BeamData = {
      clip: "none" | "start" | "end" | "both";
      start: Minim.Grid.Column;
      end: Minim.Grid.Column;
      subBeamCount: number;
    };
    export type BeamEvent = {
      renderId: MNX.Defs.ID;
      beam: Minim.Defs.Beam;
      duration?: MNX.Defs.NoteValue;
    };
    export type ChordBounds = {
      upper: PitchString;
      lower: PitchString;
    };
    export type DiatonicInterval = number;
    export type DynamicMarkingOptions = {
      value: (typeof dynamicMap.shorthand)[number];
    };
    export type DynamicMarking = {
      dynamic?: DynamicMarkingOptions;
    };
    export type Index = number;
    export type Marking = {
      column: Minim.Grid.Column;
      position: MNX.Defs.UpOrDown;
      key: string;
      name: string;
      pitch: Minim.Defs.PitchString;
      row: Minim.Grid.Row;
      items: Minim.Defs.MarkingPropertiesItem[];
    };
    export type MarkingIntermediate = {
      name: string;
      properties: Minim.Defs.MarkingProperties;
      options:
        | MNX.Defs.Pointing
        | MNX.Defs.Breath
        | MNX.Defs.Tremolo
        | Minim.Defs.DynamicMarkingOptions
        | {};
    };
    export type MarkingProperties = {
      column: Minim.Grid.Column;
      item: MarkingPropertiesItem;
      key: string;
      noteOnLine: boolean;
      noteWithinStaff: boolean;
      pitch: string;
      position: MNX.Defs.UpOrDown;
      region: Minim.Defs.MarkingRegion;
      rowPrefix: string;
      stemDirection: MNX.Defs.UpOrDown;
    };
    export type MarkingPropertiesItem =
      | {
          type: "dynamic";
          glyph: MNX.Defs.SmuflGlyph;
          height: string;
          key: keyof typeof dynamicMap.shorthand;
        }
      | {
          type: "marking";
          glyph: MNX.Defs.SmuflGlyph;
          height: string;
          key: keyof typeof articulationMap.shorthand;
        };
    export type MarkingRegion = "above" | "below" | "note" | "outside";
    export type PitchClass = "a" | "b" | "c" | "d" | "e" | "f" | "g";
    /** Shorthand pitch-and-octave value (with lowercase pitch). */
    export type PitchString = string;
    export type PitchParts = {
      stepIndex: number;
      pitchClass: PitchClass;
      octave: number;
    };
    export type StaffBounds = {
      upper: Minim.Defs.StaffLinePitch;
      lower: Minim.Defs.StaffLinePitch;
    };
    export type StaffItem = {
      part: Minim.Part.PartItem & {
        partIndex: Minim.Defs.Index;
      };
      staves: Minim.Layout.Staff[];
    };
    export type StaffLinePitch = {
      id: PitchString;
      pitchClass: PitchClass;
      octave: number;
      units?: {
        midi: number;
      };
    };
    export type StartOrEnd = "start" | "end";
    export type Stem = {
      direction: MNX.Defs.UpOrDown;
      pitch: {
        start: Minim.Defs.PitchString;
        end: Minim.Defs.PitchString;
      };
      row: {
        start: Minim.Grid.Row;
        end: Minim.Grid.Row;
      };
      noteStaff: Minim.Defs.Index;
    };
    export type VoiceNumber = number;

    export namespace Event {
      export type EventProps = {
        id: MNX.Defs.ID;
        display: "none" | null | undefined;
      };
      export type Default = MNX.Defs.Event.Default &
        Minim.Defs.Event.EventProps;
      export type Dynamic = MNX.Defs.Event.Dynamic &
        Minim.Defs.Event.EventProps;
      export type Grace = MNX.Defs.Event.Grace & Minim.Defs.Event.EventProps;
      export type Ottava = MNX.Defs.Event.Ottava & Minim.Defs.Event.EventProps;
      export type Space = MNX.Defs.Event.Space & Minim.Defs.Event.EventProps;
      export type Tuplet = Omit<MNX.Defs.Event.Tuplet, "content"> &
        Minim.Defs.Event.EventProps & {
          content: Minim.Event.Clip[];
        };
    }
  }

  // General shapes
  export type Collection<T> = {
    [k: string]: T;
  };
  export type At = {
    at: DisplayUnit.Position;
  };
  export type Bounds = {
    start: DisplayUnit.Position;
    end: DisplayUnit.Position;
  };
  export type Dimensions = {
    length: DisplayUnit.Duration;
  };

  export namespace DisplayUnit {
    export type Duration = number;
    export type Position = number;
  }

  export namespace Grid {
    type Column = string;
    type Row = string;
  }

  /** TODO: perhaps these types belong in `Parsed`? */
  export namespace Component {
    export type Clef = MNX.Defs.Clef;
    export type ClefPositioned = Minim.Component.Clef & {
      column: Minim.Grid.Column;
    };
    export type Flow = {
      type: "componentFlow";
      id: string;
      beamEvents?: Minim.Event.Beam[];
      beamGroups: Minim.Event.BeamGroup[];
      events: Minim.Event.EventItem[];
      measures: Minim.Event.Measure[];
      layouts: MNX.Layout.LayoutItem[];
      layoutEvents: Minim.Event.Layout[];
      layoutGroups: Minim.Event.LayoutGroup[];
      parts: Minim.Part.PartItem[];
      staves: Minim.Defs.StaffItem[];
    };
    export type Key = MNX.Defs.Key;
    export type KeyPositioned = Minim.Component.Key & {
      column: Minim.Grid.Column;
      prevFifths: Minim.Component.Key;
    };
    export type LegerLine = {
      index: number;
      pitch: string;
    };
    export type Tempo = MNX.Defs.Tempo;
    export type TempoPositioned = Minim.Component.Tempo & {
      column: Minim.Grid.Column;
    };
    export type Time = MNX.Defs.Time;
    export type TimePositioned = Minim.Component.Time & {
      column: Minim.Grid.Column;
    };
  }

  /** TODO: Should these be divvied up between Parser.Flow and Parser.Period? */
  export namespace Event {
    export type DecoratedDefaultEvent = Minim.Defs.Event.Default &
      Minim.Event.EventDecorationItem;
    export type DecoratedSpaceEvent = Minim.Defs.Event.Space &
      Minim.Event.EventDecorationItem;
    export type DecoratedTupletEvent = Minim.Defs.Event.Tuplet &
      Minim.Event.EventDecorationItem;
    export type DurationalItem =
      | Minim.Event.DecoratedDefaultEvent
      | Minim.Event.DecoratedSpaceEvent
      | Minim.Event.DecoratedTupletEvent;
    export type BeamedEventItem = Minim.Event.DurationalItem & {
      beam: Minim.Defs.BeamData;
    };
    export type BeamGroup = Minim.Event.BeamedEventItem[];
    export type BeamEvent = {
      beam: Minim.Defs.Beam;
      duration?: MNX.Defs.NoteValue | MNX.Defs.NoteValueQuantity;
      renderId: MNX.Defs.ID;
    };
    export type EventGroup = {
      type: "group";
      id: MNX.Defs.ID;
      sequence: Minim.Part.SequenceItem[];
      beams?: MNX.Defs.BeamListItem[];
      repeatCount?: number;
    };
    export type EventDecorationItem = {
      renderId: MNX.Defs.ID;
      flowId: MNX.Defs.ID;
      partId?: MNX.Defs.ID;
      partIndex: Minim.Defs.Index;
      partVoices: number;
      voice: number;
      eventGroup: Minim.Event.EventGroup | null;
      clef: MNX.Part.Clef;
      clefs: MNX.Part.Clef[];
      staff: MNX.Defs.StaffNumber;
      staves: MNX.Defs.StaffNumber[];
      index: Minim.Defs.Index;
      position: Bounds | At;
      dimensions: Minim.Dimensions;
      markings?: MNX.Defs.Markings & Minim.Defs.DynamicMarking;
    };
    /** Post-"setFlow" Decorated event */
    export type EventItem = Minim.Part.SequenceItem &
      Minim.Event.EventDecorationItem;
    export type Clip = Minim.Defs.Event.Default &
      Minim.Event.EventDecorationItem & {
        clipPosition: "start" | "end" | "both";
      };
    export type DisplayItem = {
      type: "displayEvent";
      at: DisplayUnit.Position;
      clefs: Component.Clef[] | null;
      eventType: "measureStart" | "measureEnd";
      flowId: Component.Flow["id"];
      key: Component.KeyPositioned | null;
      measureBounds: Minim.Bounds;
      tempos: Component.TempoPositioned[] | null;
      time: Component.TimePositioned | null;
    };
    export type Layout = {
      type: "layoutEvent";
      id: MNX.Defs.ID;
      at: Minim.DisplayUnit.Position;
      eventType: "measureStart" | "measureEnd";
      flowId: Component.Flow["id"];
      measureBounds: Minim.Bounds;
      layoutGroups: Minim.Event.LayoutGroup[];
    };
    export type LayoutGroup = Minim.Layout.SystemLayoutContentItem & {
      flowId: MNX.Defs.ID;
      at: Minim.DisplayUnit.Position;
      position: Minim.Defs.StartOrEnd;
      row: Minim.Grid.Row[];
      barline: Minim.Defs.Barline;
    };
    export type MeasureClef = MNX.Part.Clef & {
      partIndex: Minim.Defs.Index;
    };
    export type Measure = {
      type: "measureEvent";
      id: MNX.Defs.ID;
      key: MNX.Defs.Key;
      clefs: MeasureClef[];
      tempos: MNX.Defs.Tempo[];
      time: MNX.Defs.Time;
      /** MNX.Layout.LayoutItem group ID */
      layout?: MNX.Defs.ID;
      dimensions: Dimensions;
      periodBounds?: {
        startsInPeriod: boolean;
        endsInPeriod: boolean;
        lastInFlow: boolean;
      };
      position: Minim.Bounds;
    };
  }

  export namespace Layout {
    export type Staff = {
      clef: Minim.Event.MeasureClef;
      flowId: MNX.Defs.ID;
      partIndex: Minim.Defs.Index;
      /* grid-template-rows */
      pitches?: string;
      pitchesArray: string[];
      prefix?: string;
      rangeClef?: Minim.Range.Clef;
      staffBounds?: Minim.Defs.StaffBounds;
      staffIndex: Minim.Defs.Index;
      translateY?: Minim.Range.Clef["translateY"];
    };
    export type SystemLayoutContentItem =
      | (MNX.Layout.SystemLayoutContentItem & { flowId: MNX.Defs.ID })
      | MNX.Layout.SystemLayoutContentItem;
  }

  export namespace Period {
    // Period object
    export type PeriodItem = {
      // TODO: Define BeamGroups!
      beamGroups: Minim.Collection<Minim.Event.BeamGroup[]>;
      dimensions: Minim.Dimensions;
      displayEvents: Minim.Event.DisplayItem[];
      dynamics: Minim.Collection<Minim.Defs.Event.Dynamic[]>;
      // TODO: Rename to "events"
      flows: Minim.Collection<Minim.Event.EventItem[]>;
      flowsClipped: Minim.Parser.Period.FlowsClipped;
      index: Minim.Defs.Index;
      key: Minim.Collection<Minim.Component.Key>;
      layoutEvents: Minim.Event.Layout[];
      measures: Minim.Collection<Minim.Event.Measure[]>;
      position: Minim.Bounds;
      staves: Minim.Collection<Minim.Defs.StaffItem[]>;
    };
  }

  export namespace Range {
    export type ClefSign = "G" | "C" | "F";
    export type ClefType = "treble" | "alto" | "bass";
    export type KeyAccidentals = {
      sharp: Minim.Defs.PitchString[];
      flat: Minim.Defs.PitchString[];
    };
    export type BoundsItem = {
      node: "lowerBound" | "upperBound";
      base: Minim.Defs.StaffLinePitch;
    };
    export type Clef = {
      type: Minim.Range.ClefType;
      sign: Minim.Range.ClefSign;
      staffPosition: number;
      staffPitch: Minim.Defs.PitchString;
      midline: Minim.Defs.PitchString;
      glyph: MNX.Defs.SmuflGlyph;
      keyAccidentals: Minim.Range.KeyAccidentals;
      bounds: Minim.Range.BoundsItem[];
      translateY: string;
      /** Pitches are ordered highest first */
      staffLinePitches: Minim.Defs.StaffLinePitch[];
    };
  }
}
