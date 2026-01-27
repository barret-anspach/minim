import {
  timeSignatureToDuration,
  getFlowLayoutBarlinesAtPoint,
  decorateEvent,
  getBeamGroupStem,
  getStavesForFlow,
  getFlowLayoutAtPoint,
  getMeasureClefsForPart,
  getOrCreateFlowLayoutByLayoutID,
  getFlowId,
} from "./../utils/methods.js";

import { Minim } from "./../types/minim/index.js";
import { MNX } from "./../types/mnx/index.js";
import { KEY_DEFAULT, TIME_DEFAULT } from "../constants/defaults.js";

export function setFlow({
  flow,
  flowIndex,
}: {
  flow: Minim.Document.FlowItem;
  flowIndex: number;
}) {
  const isMNX = flow.parts.some((part) => part.measures);

  const id = getFlowId({ flow, flowIndex });
  const layoutEvents: Minim.Event.Layout[] = [];

  // TODO: To add: TEMPO
  // TODO: parts and even staves within a flow might have different globally-set **key signatures**.
  const measureEvents = flow.global.measures.reduce(
    (acc: Minim.Event.Measure[], m: Minim.Document.MeasureItem, mi) => {
      const duration = m.time
        ? timeSignatureToDuration(m.time.count, m.time.unit)
        : acc[acc.length - 1].dimensions.length;
      // Grab clefs either from each part's global defs, or from parts' measure defs.
      const clefs: Minim.Event.MeasureClef[] = Array.from(
        { length: flow.parts.length },
        (_, i) => i,
      ).flatMap((partIndex) =>
        getMeasureClefsForPart({ part: flow.parts[partIndex], partIndex }),
      );

      const count = Array.from({ length: m.repeatCount ?? 1 }, (_, i) => i);
      let start = mi === 0 ? 0 : acc[acc.length - 1].position.end;

      for (const i of count) {
        start = i === 0 ? start : start + duration;
        const end = start + duration;
        const measure: Minim.Event.Measure = {
          ...m,
          type: "measureEvent",
          id: `${id}m${mi}r${i}`,
          key: m.key ?? acc.at(-1)?.key ?? KEY_DEFAULT,
          clefs,
          tempos: m.tempos ?? acc.at(-1)?.tempos,
          time: m.time ?? acc.at(-1)?.time ?? TIME_DEFAULT,
          layout: m.layout ?? acc.at(-1)?.layout,
          dimensions: {
            length: duration,
          },
          position: {
            start,
            end,
          },
        };
        const layout = getFlowLayoutBarlinesAtPoint({
          flow: flow as Minim.Document.FlowItem,
          flowIndex,
          clefs,
          at: "start",
          point: start,
          measure,
          measureIndex: mi,
        });

        acc.push(measure);

        layoutEvents.push(
          {
            type: "layoutEvent",
            id: `${id}m${mi + i}e${start}`,
            at: start,
            eventType: "measureStart",
            measureBounds: { start, end },
            flowId: id,
            layoutGroups: layout,
          },
          {
            type: "layoutEvent",
            id: `${id}m${mi + i}e${end}`,
            at: end,
            eventType: "measureEnd",
            measureBounds: { start, end },
            flowId: id,
            layoutGroups: getFlowLayoutBarlinesAtPoint({
              flow,
              flowIndex,
              clefs,
              at: "end",
              point: end,
              measure,
              measureIndex: mi,
            }),
          },
        );
      }
      return acc;
    },
    [],
  );

  function decorateEvents({
    acc,
    part,
    partIndex,
    voice,
    voiceIndex,
    voiceItem,
  }: {
    acc: Minim.Event.EventItem[];
    part: MNX.Part.PartItem;
    partIndex: number;
    voice: Minim.Part.Sequence;
    voiceIndex: Minim.Defs.Index;
    voiceItem: Minim.Part.SequenceItemOrGroup;
  }) {
    const count = Array.from(
      {
        length:
          "repeatCount" in voiceItem && voiceItem.repeatCount !== undefined
            ? voiceItem.repeatCount
            : 1,
      },
      (_, i) => i,
    );

    for (const i of count) {
      if (voiceItem.type === "group") {
        voiceItem.sequence.map((event) =>
          decorateEvent({
            acc,
            event,
            flowId: id,
            i,
            part: part as Minim.Part.PartItem,
            partIndex,
            voice,
            voiceIndex,
            voiceItem,
          }),
        );
      } else {
        decorateEvent({
          acc,
          event: voiceItem,
          flowId: id,
          i,
          part: part as Minim.Part.PartItem,
          partIndex,
          voice,
          voiceIndex,
        });
      }
    }
  }

  const events: Minim.Event.EventItem[] = flow.parts.reduce(
    (acc, part, partIndex) => {
      if ("sequences" in part) {
        (part as Minim.Part.PartItem).sequences.forEach((voice, voiceIndex) =>
          voice.content.forEach((voiceItem) => {
            decorateEvents({
              acc,
              part,
              partIndex,
              voice,
              voiceIndex,
              voiceItem,
            });
          }),
        );
      } else {
        (part as MNX.Part.PartItem).measures.forEach((measure) => {
          measure.sequences.forEach(
            (voice: MNX.Part.Sequence & Minim.Part.Sequence, voiceIndex) =>
              (voice.content as Minim.Part.SequenceItemOrGroup[]).forEach(
                (voiceItem) => {
                  decorateEvents({
                    acc,
                    part,
                    partIndex,
                    voice,
                    voiceIndex,
                    voiceItem,
                  });
                },
              ),
          );
        });
      }

      return acc;
    },
    [],
  );

  const dynamics = events.filter((e) => e.type === "dynamic");

  const eventsWithDynamicsAsMarkings = events
    .filter((e): e is Minim.Event.DecoratedDefaultEvent => e.type === "event")
    .map((event) => {
      const dynamic = dynamics.find(
        (dynamic) =>
          (dynamic.position as Minim.At).at ===
            (event.position as Minim.Bounds).start &&
          dynamic.partIndex === event.partIndex &&
          dynamic.staff === event.staff,
      );

      if (dynamic) {
        return {
          ...event,
          markings: {
            ...event.markings,
            dynamic: {
              type: "dynamic",
              value: dynamic.value,
              staff: dynamic.staff,
            },
          },
        };
      } else {
        return event;
      }
    });

  // TODO: beam.events can be nested in MNX
  function parseBeams(beams: MNX.Defs.BeamListItem[]) {
    return beams.flatMap((beamListItem, beamListItemIndex) => {
      let res = beamListItem.events.map((e) => ({
        ...events.find((ev) => e === ev.id),
        eventGroup: {
          type: "group",
          id: `grp${beamListItemIndex}`,
          sequence: events.filter((ev) => beamListItem.events.includes(ev.id)),
          beams: beamListItem.beams,
        } as Minim.Event.EventGroup,
      }));
      if (beamListItem.beams?.length > 0) {
        res = [...res, ...parseBeams(beamListItem.beams)];
      }
      return res;
    });
  }

  const eventGroupsWithBeams = !isMNX
    ? events.filter(
        (e) =>
          "eventGroup" in e &&
          e.eventGroup !== null &&
          e.eventGroup.beams &&
          e.eventGroup.beams.length > 0,
      )
    : parseBeams(
        flow.parts.flatMap((part) =>
          part.measures.flatMap((meas) => meas.beams),
        ),
      );

  const beamGroups =
    eventGroupsWithBeams.length === 0
      ? []
      : eventGroupsWithBeams
          .reduce(
            (acc, event) => {
              // TODO: This is all wrong now. Redo the whole beam thing, please.
              const b = event.eventGroup!.beams!.flatMap((beam) => beam.events);
              const bJSON = JSON.stringify(b);
              if (!acc.seen.has(bJSON)) {
                const count = Array.from(
                  { length: event.eventGroup!.repeatCount ?? 1 },
                  (_, i) => i,
                );
                for (const i of count) {
                  acc.result.push(b.map((e) => `${e}_rep${i}`));
                }
                acc.seen.add(bJSON);
              }
              return acc;
            },
            { result: [] as MNX.Defs.ID[][], seen: new Set() },
          )
          .result.reduce(
            (acc, beamGroup) => [
              ...acc,
              beamGroup.map(
                (beamGroupId) =>
                  eventGroupsWithBeams.find(
                    (beamedEvent) => beamedEvent.renderId === beamGroupId,
                  )!,
              ),
            ],
            [] as Minim.Event.EventItem[][],
          );

  const beamEvents: Minim.Event.BeamEvent[] =
    beamGroups.length === 0
      ? []
      : beamGroups.flatMap((beamGroup) =>
          beamGroup.flatMap((event) => ({
            renderId: event.renderId,
            ...("duration" in event && event.duration
              ? { duration: event.duration }
              : {}),
            beam: {
              ...getBeamGroupStem(beamGroup, event.flowId),
              staff: event.staff,
            },
          })),
        );

  const staves = getStavesForFlow({ flow, flowIndex });

  const layouts = flow.layouts ?? [
    getOrCreateFlowLayoutByLayoutID({ flow, layoutId: `sco0_flo0_lay0` }),
  ];
  const layoutGroups = layouts.flatMap((layout) =>
    getFlowLayoutAtPoint({
      at: "start",
      flow,
      flowIndex,
      clefs: staves.flatMap((group) =>
        group.staves.flatMap((staff) => staff.clef),
      ),
      point: 0,
      layoutId: layout.id,
    }),
  );

  return {
    beamEvents,
    beamGroups,
    events: eventsWithDynamicsAsMarkings,
    id,
    measures: measureEvents,
    layouts,
    layoutEvents: layoutEvents,
    layoutGroups,
    parts: flow.parts,
    staves,
    type: "componentFlow",
  } as Minim.Component.Flow;
}
