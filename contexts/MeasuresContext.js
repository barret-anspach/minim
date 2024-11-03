import { createContext, useContext, useMemo, useReducer } from "react";
import {
  areClefsEqual,
  areTempiEqual,
  areTimeSignaturesEqual,
  decorateEvent,
  getBeamGroupsForPeriod,
  getBeamGroupStem,
  getDisplayEventsForPeriod,
  getFlowLayoutAtPoint,
  getFlowLayoutBarlinesAtPoint,
  getLayoutEventsForPeriod,
  getMeasuresForPeriod,
  getStavesForFlow,
  lengthToDurationObj,
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
    case "reset": {
      return initialState;
    }
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
    case "setPeriods": {
      // PERIODS: sections of musical material (that may match the bounds of an
      // entire measure, but might be shorter), which allow for synchronizing
      // independent flows and placing material into systems.

      // TODO: TEMPO affects all events positions in a flow!!!
      // Need to adjust each event's position by tempo (if one).
      // Should happen when setting flows? ==> NOPE, don't have enough context yet.
      // const scalar = Object.values(context.flows).reduce((acc, flow) => [
      //   ...acc,
      //   flow.measures.flatMap((measure, mi, mm) => measure.tempos.flatMap((tempo) => mi < mm.length ? areTempiEquivalent() : <something>))
      // ]
      // )

      // Ia. For all flows, are there intersections of measure.position.start?
      const flowMeasureStarts = Object.values(context.flows).map((flow) =>
        flow.measures.flatMap((measure) => measure.position.start),
      );

      // Ib. For all flows, are there intersections of event.position.start?
      const flowEventStarts = Object.values(context.flows).map((flow) =>
        flow.events
          .filter((event) => event.type === "event")
          .flatMap((event) => event.position.start),
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
                  // As in, can we remove? Or will this become important to capture mid-measure
                  // clef changes and the like?
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
              const beamGroups = getBeamGroupsForPeriod({
                flows: context.flows,
                start: periods[acc.index],
                end: _endValue,
              });
              const measures = getMeasuresForPeriod({
                flows: context.flows,
                start: periods[acc.index],
                end: _endValue,
              });
              acc.result[periods[acc.index]] = {
                beamGroups,
                dimensions: { length: _duration },
                displayEvents: getDisplayEventsForPeriod({
                  flows: flowDisplayStarts,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                dynamics: Object.entries(context.flows).reduce(
                  (dynAcc, [flowId, flow]) => ({
                    ...dynAcc,
                    [flowId]: flow.events
                      .filter((event) => event.type === "dynamic")
                      .filter(
                        (event) =>
                          event.position.at >= periods[acc.index] &&
                          event.position.at < _endValue,
                      ),
                  }),
                  {},
                ),
                flows: eventsAtStart,
                // add any flows from the previous period here
                flowsClipped: Object.keys(context.flows).reduce(
                  (clipAcc, flowId) => ({
                    ...clipAcc,
                    [flowId]: {
                      start:
                        acc.next.index &&
                        acc.next.index === acc.index &&
                        acc.next.flowsClipped &&
                        acc.next.flowsClipped[flowId] &&
                        acc.next.flowsClipped[flowId].length > 0
                          ? acc.next.flowsClipped[flowId]
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
                    [flowId]: mm.find(
                      (m) => m.position.start <= periods[acc.index],
                    )?.key,
                  }),
                  {},
                ),
                layoutEvents: getLayoutEventsForPeriod({
                  flows: context.flows,
                  start: periods[acc.index],
                  end: _endValue,
                }),
                measures,
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

              // Reset `next` for flowsClipped
              if (acc.next && acc.next.index === acc.index) {
                acc.next = {};
              }

              // To render events that overflow the end of a system
              const flowsClipped = Object.entries(flows).reduce(
                (flowAcc, [flowId, flow]) => ({
                  ...flowAcc,
                  [flowId]: flow
                    .filter(
                      (e) =>
                        e.type === "event" &&
                        e.display !== "none" &&
                        e.position.end > _endValue,
                    )
                    .reduce(
                      (eventAcc, e) => {
                        if (acc.index < periods.length) {
                          acc.next = {
                            index: acc.index + 1,
                            flowsClipped: {
                              [flowId]: [
                                ...(acc.next &&
                                acc.next.flowsClipped &&
                                acc.next.flowsClipped[flowId] &&
                                acc.next.flowsClipped[flowId].length > 0
                                  ? acc.next.flowsClipped[flowId]
                                  : []),
                                {
                                  ...e,
                                  // TODO: Update eventGroup (if one) with beams[{events: [<insert event>]}]
                                  clipPosition: "start",
                                  dimensions: {
                                    length: e.position.end - _endValue,
                                  },
                                  duration: lengthToDurationObj(
                                    e.position.end - _endValue,
                                  ),
                                  position: {
                                    ...e.position,
                                    start: _endValue,
                                  },
                                  ...(e.notes
                                    ? {
                                        notes: [
                                          ...e.notes.map((n) => ({
                                            ...n,
                                            tie: {},
                                          })),
                                        ],
                                      }
                                    : {}),
                                },
                              ],
                            },
                          };
                        }
                        return {
                          start:
                            acc.result[periods[acc.index]].flowsClipped[flowId]
                              .start || [],
                          end: [
                            ...eventAcc.end,
                            {
                              ...e,
                              // TODO: Update eventGroup (if one) with beams[{events: [<insert event>]}]
                              clipPosition: "end",
                              dimensions: {
                                length: _endValue - e.position.start,
                              },
                              duration: lengthToDurationObj(
                                _endValue - e.position.start,
                              ),
                              position: {
                                ...e.position,
                                end: _endValue,
                              },
                              ...(e.notes
                                ? {
                                    notes: [
                                      ...e.notes.map((n) => ({
                                        ...n,
                                        tie: {},
                                      })),
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
                flowsClipped,
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
          { result: {}, index: 0, next: {} },
        ).result;

      return {
        ...context,
        periods: periodEvents,
      };
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
    default: {
      return context;
    }
  }
}

const MeasuresContextProvider = ({ children }) => {
  const [context, dispatch] = useReducer(measuresReducer, initialState);

  const actions = useMemo(
    () => ({
      reset: () => {
        dispatch({ type: "reset" });
      },
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

            acc.push({
              ...m,
              type: "measureEvent",
              id: `${flow.id}m${mi}r${i}`,
              key: m.key ?? acc.at(-1).key,
              clefs,
              time: m.time ?? acc.at(-1).time,
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

        const dynamics = events.filter((e) => e.type === "dynamic");
        const eventsWithDynamicsAsMarkings = events
          .filter((e) => e.type !== "dynamic")
          .map((event) => {
            const dynamic = dynamics.find(
              (dynamic) =>
                dynamic.position.at === event.position.start &&
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

        const eventGroupsWithBeams = events.filter((e) => e.eventGroup?.beams);
        const beamGroups =
          eventGroupsWithBeams.length === 0
            ? []
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

        const beamEvents =
          beamGroups.length === 0
            ? []
            : beamGroups.flatMap((beamGroup) =>
                beamGroup.flatMap((event) => ({
                  renderId: event.renderId,
                  ...(event.duration ? { duration: event.duration } : {}),
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
          events: eventsWithDynamicsAsMarkings,
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
    }),
    [],
  );

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
