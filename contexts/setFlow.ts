import { Minim } from "../types/minim";
import { MNX } from "../types/mnx";
import {
  timeSignatureToDuration,
  getFlowLayoutBarlinesAtPoint,
  decorateEvent,
  getBeamGroupStem,
  getStavesForFlow,
  getFlowLayoutAtPoint,
} from "../utils/methods";

export function setFlow({ flow }: { flow: Minim.Document.FlowItem }) {
  const layoutEvents: Minim.Event.Layout[] = [];

  // TODO: To add: TEMPO
  // TODO: parts and even staves within a flow might have different globally-set **key signatures**.
  const measureEvents = flow.global.measures.reduce(
    (acc: Minim.Event.Measure[], m: Minim.Document.MeasureItem, mi, mm) => {
      const duration =
        m.time ?
          timeSignatureToDuration(m.time.count, m.time.unit)
        : acc[acc.length - 1].dimensions.length;
      const clefs = Array.from(
        { length: flow.parts.length },
        (_, i) => i,
      ).flatMap((partIndex) =>
        flow.parts[partIndex].global.clefs.map((clef) => ({
          ...clef,
          partIndex,
        })),
      );

      const count = Array.from({ length: m.repeatCount ?? 1 }, (_, i) => i);
      let start = mi === 0 ? 0 : acc[acc.length - 1].position.end;

      for (const i of count) {
        start = i === 0 ? start : start + duration;
        const end = start + duration;
        const measure: Minim.Event.Measure = {
          ...m,
          type: "measureEvent",
          id: `${flow.id}m${mi}r${i}`,
          key: m.key ?? acc.at(-1)!.key,
          clefs,
          tempos: m.tempos ?? acc.at(-1)!.tempos,
          time: m.time ?? acc.at(-1)!.time,
          layout: m.layout ?? acc.at(-1)!.layout,
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
            id: `${flow.id}m${mi + i}e${start}`,
            at: start,
            eventType: "measureStart",
            measureBounds: { start, end },
            flowId: flow.id,
            layoutGroups: layout,
          },
          {
            type: "layoutEvent",
            id: `${flow.id}m${mi + i}e${end}`,
            at: end,
            eventType: "measureEnd",
            measureBounds: { start, end },
            flowId: flow.id,
            layoutGroups: getFlowLayoutBarlinesAtPoint({
              flow,
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

  const events: Minim.Event.EventItem[] = flow.parts.reduce(
    (acc, part, partIndex) => {
      (part as Minim.Part.PartItem).sequences.map((voice) =>
        voice.content.map((voiceItem) => {
          const count = Array.from(
            {
              length:
                (
                  "repeatCount" in voiceItem &&
                  voiceItem.repeatCount !== undefined
                ) ?
                  voiceItem.repeatCount
                : 1,
            },
            (_, i) => i,
          );
          for (const i of count) {
            voiceItem.type === "group" ?
              voiceItem.sequence.map((event) =>
                decorateEvent({
                  acc,
                  event,
                  flowId: flow.id,
                  i,
                  part: part as Minim.Part.PartItem,
                  partIndex,
                  voice,
                  voiceItem,
                }),
              )
            : decorateEvent({
                acc,
                event: voiceItem,
                flowId: flow.id,
                i,
                part: part as Minim.Part.PartItem,
                partIndex,
                voice,
              });
          }
        }),
      );
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

  const eventGroupsWithBeams = events.filter(
    (e) =>
      "eventGroup" in e &&
      e.eventGroup !== null &&
      e.eventGroup.beams &&
      e.eventGroup.beams.length > 0,
  );
  const beamGroups =
    eventGroupsWithBeams.length === 0 ?
      []
    : eventGroupsWithBeams
        .reduce(
          (acc, event) => {
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
    beamGroups.length === 0 ?
      []
    : beamGroups.flatMap((beamGroup) =>
        beamGroup.flatMap((event) => ({
          renderId: event.renderId,
          ...("duration" in event && event.duration ?
            { duration: event.duration }
          : {}),
          beam: {
            ...getBeamGroupStem(beamGroup, event.flowId),
            staff: event.staff,
          },
        })),
      );

  const staves = getStavesForFlow(flow);

  const layoutGroups = flow.layouts.flatMap((layout) =>
    getFlowLayoutAtPoint({
      at: "start",
      flow,
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
    flowId: flow.id,
    measureEvents,
    layouts: flow.layouts,
    layoutEvents: layoutEvents,
    layoutGroups,
    parts: flow.parts,
    staves,
  };
}
