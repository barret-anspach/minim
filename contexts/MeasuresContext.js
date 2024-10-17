import { createContext, useContext, useReducer } from "react";
import {
  areClefsEqual,
  areTimeSignaturesEqual,
  decorateEvent,
  getBeamGroupsForPeriod,
  getBeamGroupStem,
  getDisplayEventsForPeriod,
  getFlowLayoutAtPoint,
  getFlowLayoutBarlinesAtPoint,
  getLayoutEventsForPeriod,
  getLayoutGroupsForPeriod,
  getMeasuresForPeriod,
  getStavesForFlow,
  timeSignatureToDuration,
} from "../utils/methods";

const initialState = {
  flows: {},
  initialized: false,
  periods: [],
  page: {
    left: null,
    right: null,
  },
};

const MeasuresContext = createContext();
MeasuresContext.displayName = "MeasuresContext";

function measuresReducer(context, action) {
  switch (action.type) {
    case "setFlow": {
      const flows = context.flows;
      flows[action.flowId] = {
        id: action.flowId,
        beamEvents: action.beamEvents,
        beamGroups: action.beamGroups,
        events: action.events,
        layouts: action.layouts,
        layoutEvents: action.layoutEvents,
        layoutGroups: action.layoutGroups,
        measures: action.measureEvents,
        parts: action.parts,
        staves: action.staves,
      };
      return { ...context, initialized: true, flows };
    }
    case "updatePeriod": {
      return {
        ...context,
        periods: {
          ...context.periods,
          [action.key]: {
            ...context.periods[action.key],
            ...action.period,
          },
        },
      };
    }
    case "setPeriods": {
      // Ia. For all flows, are there intersections of measure.position.start?
      const flowMeasureStarts = Object.values(context.flows).map((flow) =>
        flow.measures.flatMap((measure) => measure.position.start),
      );

      // Ib. For all flows, are there intersections of event.position.start?
      const flowEventStarts = Object.values(context.flows).map((flow) =>
        flow.events.flatMap((event) => event.position.start),
      );
      let periods = [
        ...new Set([
          ...flowEventStarts.reduce((a, b) => a.filter((c) => b.includes(c))),
          ...flowMeasureStarts.flat(),
        ]),
      ].sort((a, b) => a - b);

      // TODO: Should be able to accommodate switching between periods and measures,
      // solely depending on when the score's flows are or are not "in alignment."
      // ANSWER: Don't set periods to intersections of event.position.start,
      // Use `flowMeasureStarts` instead.
      const flowMeasuresAfterPeriods = flowMeasureStarts.map((measureStarts) =>
        measureStarts.filter((start) => periods.at(-1) < start),
      );
      periods = periods.concat(
        flowMeasuresAfterPeriods.some((flow) => flow.length > 0)
          ? [...new Set(flowMeasuresAfterPeriods.flat().sort((a, b) => a - b))]
          : [],
      );

      const flowDisplayStarts = Object.entries(context.flows).reduce(
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
                time:
                  mi === 0 ||
                  !areTimeSignaturesEqual(mm[mi - 1].time, measure.time)
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
                            ? mm
                                .slice(0, mi)
                                .findLast((m) => m.key !== undefined).key
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
                  mi < mm.length - 1 &&
                  mm[mi + 1].key.fifths !== measure.key.fifths
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

      // TODO:
      // If two flows are "in alignment" (e.g. don't diverge in meter) for their entirety,
      // how will we identify alignment and indicate render preference for the score's
      // measures concept instead of period?
      const periodEvents = [...new Set(flowEventStarts.flat())]
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
            const eventsAtStart = Object.entries(context.flows).reduce(
              (acc, [flowId, flow]) => ({
                ...acc,
                [flowId]: [
                  ...flow.events.filter(
                    (event) => event.position.start === eventStart,
                  ),
                  // TODO: Are we using these displayEvents (as distinct events in period.events)?
                  // As in, can we remove ? Or will this become important to capture mid-measure
                  // clef changes and the like ?
                  ...flowDisplayStarts[flowId]
                    .flat()
                    .filter((displayEvent) => displayEvent.at === eventStart),
                ],
              }),
              {},
            );

            const _endValue =
              acc.index + 1 !== periods.length
                ? periods[acc.index + 1]
                : Object.values(eventsAtStart)
                    .flat()
                    .filter((e) => e.type === "event")
                    .sort((a, b) => a.position.end - b.position.end)
                    .at(-1).position.end;

            const _duration = _endValue - periods[acc.index];

            // If it's the first event in a period, initialize period with values.
            if (periods[acc.index] === eventStart) {
              acc.result[periods[acc.index]] = {
                beamGroups: getBeamGroupsForPeriod({
                  flows: context.flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                dimensions: { length: _duration },
                displayEvents: getDisplayEventsForPeriod({
                  flows: flowDisplayStarts,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                flows: eventsAtStart,
                index: acc.index,
                key: Object.entries(context.flows).reduce(
                  (keyAcc, [flowId, flow]) => ({
                    ...keyAcc,
                    [flowId]: flow.measures.find(
                      (m) => m.position.end >= periods[acc.index],
                    )?.key,
                  }),
                  {},
                ),
                layoutEvents: getLayoutEventsForPeriod({
                  flows: context.flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                measures: getMeasuresForPeriod({
                  flows: context.flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                position: {
                  start: periods[acc.index],
                  end: _endValue,
                },
                staves: Object.entries(context.flows).reduce(
                  (acc, [flowId, flow]) => ({ ...acc, [flowId]: flow.staves }),
                  {},
                ),
              };
            } else if (periods[acc.index] < eventStart) {
              // Not the first event in period; Add to flows.
              const flows = Object.entries(
                acc.result[periods[acc.index]].flows,
              ).reduce(
                (acc, [flowId, flow]) => ({
                  ...acc,
                  [flowId]: [...flow, ...eventsAtStart[flowId]],
                }),
                {},
              );
              // Otherwise, add new eventStart to events[]
              acc.result[periods[acc.index]] = {
                ...acc.result[periods[acc.index]],
                beamGroups: getBeamGroupsForPeriod({
                  flows: context.flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                dimensions: { length: _duration },
                displayEvents: [
                  ...new Set([
                    ...acc.result[periods[acc.index]].displayEvents,
                    ...getDisplayEventsForPeriod({
                      flows: flowDisplayStarts,
                      start: periods[acc.index],
                      end: _endValue,
                    }),
                  ]),
                ],
                flows,
                layoutEvents: [
                  ...new Set([
                    ...acc.result[periods[acc.index]].layoutEvents,
                    ...getLayoutEventsForPeriod({
                      flows: context.flows,
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
          { result: {}, index: 0 },
        ).result;

      return {
        ...context,
        periods: periodEvents,
      };
    }
    default: {
      return context;
    }
  }
}

const MeasuresContextProvider = ({ children }) => {
  const [context, dispatch] = useReducer(measuresReducer, initialState);

  const actions = {
    setFlow: ({ flow }) => {
      const layoutEvents = [];

      // TODO: To add: TEMPO
      // TODO: parts and even staves within a flow might have different globally-set **key signatures**.
      const measureEvents = flow.global.measures.reduce((acc, m, mi, mm) => {
        const duration = m.time
          ? timeSignatureToDuration(m.time.count, m.time.unit)
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
          const layout = getFlowLayoutBarlinesAtPoint({
            flow,
            clefs,
            at: "start",
            point: start,
            measure: m,
            measureIndex: mi,
            measures: mm,
          });
          delete m.repeatCount;

          acc.push({
            ...m,
            type: "measureEvent",
            id: `${flow.id}m${mi}r${i}`,
            key: m.key ?? acc[mi - 1].key,
            clefs,
            time: m.time ?? acc[mi - 1].time,
            layout,
            dimensions: {
              length: duration,
            },
            position: {
              start,
              end,
            },
            positionInSystem: {
              first: false,
              last: false,
            },
          });

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
                measure: m,
                measureIndex: mi,
                measures: mm,
              }),
            },
          );
        }
        return acc;
      }, []);

      const events = flow.parts.reduce((acc, part, partIndex) => {
        part.sequences.map((voice) =>
          voice.content.map((voiceItem) => {
            // TODO: Need to inject meter and key changes as "events"
            const count = Array.from(
              { length: voiceItem.repeatCount ?? 1 },
              (_, i) => i,
            );
            for (const i of count) {
              voiceItem.type === "group"
                ? voiceItem.sequence.map((event) =>
                    decorateEvent({
                      acc,
                      event,
                      flowId: flow.id,
                      i,
                      part,
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
                    part,
                    partIndex,
                    voice,
                  });
            }
          }),
        );
        return acc;
      }, []);

      const eventGroupsWithBeams = events.filter((e) => e.eventGroup?.beams);
      const beamGroups =
        eventGroupsWithBeams.length === 0
          ? null
          : eventGroupsWithBeams
              .reduce(
                (acc, event) => {
                  const b = event.eventGroup.beams.flatMap(
                    (beam) => beam.events,
                  );
                  const bJSON = JSON.stringify(b);
                  if (!acc.seen.has(bJSON)) {
                    const count = Array.from(
                      { length: event.eventGroup.repeatCount ?? 1 },
                      (_, i) => i,
                    );
                    for (const i of count) {
                      acc.result.push(b.map((e) => `${e}_rep${i}`));
                    }
                    acc.seen.add(bJSON);
                  }
                  return acc;
                },
                { result: [], seen: new Set() },
              )
              .result.reduce(
                (acc, beamGroup) => [
                  ...acc,
                  beamGroup.map((beamGroupId) =>
                    eventGroupsWithBeams.find(
                      (beamedEvent) => beamedEvent.renderId === beamGroupId,
                    ),
                  ),
                ],
                [],
              );

      const beamEvents = beamGroups.flatMap((beamGroup) =>
        beamGroup.flatMap((event) => ({
          renderId: event.renderId,
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

      dispatch({
        type: "setFlow",
        beamEvents,
        beamGroups,
        events,
        flowId: flow.id,
        measureEvents,
        layouts: flow.layouts,
        layoutEvents: layoutEvents,
        layoutGroups,
        parts: flow.parts,
        staves,
      });
    },
    setPeriods: () => {
      dispatch({ type: "setPeriods" });
    },
    updatePeriod: ({ key, period }) => {
      dispatch({ type: "updatePeriod", key, period });
    },
  };

  return (
    <MeasuresContext.Provider value={{ context, actions }}>
      {children}
    </MeasuresContext.Provider>
  );
};

const useMeasuresContext = () => {
  const context = useContext(MeasuresContext);
  if (context === undefined) {
    throw new Error("useMeasuresContext is used outside of its Provider");
  }
  return context;
};

export { MeasuresContext, MeasuresContextProvider, useMeasuresContext };
