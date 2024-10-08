import { createContext, useContext, useReducer } from "react";
import {
  decorateEvent,
  getBeamGroupStem,
  timeSignatureToDuration,
} from "../utils/methods";

const initialState = {
  columns: "",
  rows: "",
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
    case "addGridRows": {
      return { ...context, rows: context.rows.concat(action.rows) };
    }
    case "setFlow": {
      const flows = context.flows;
      flows[action.flowId] = {
        beamEvents: action.beamEvents,
        beamGroups: action.beamGroups,
        events: action.events,
        measures: action.measureEvents,
        parts: action.parts,
      };
      return { ...context, initialized: true, flows };
    }
    case "setGridColumns": {
      const uniqueStarts = Object.groupBy(
        Object.values(context.flows).flatMap((flow) => flow.events),
        (e) => e.position.start,
      );
      // Store last event for every flow here, to reference in columns constructor.
      const uniqEventsByFlow = Object.groupBy(
        Object.values(context.flows).flatMap((flow) => flow.events),
        (e) => e.flowId,
      );

      // TODO: reduce should return an object with named grid lines and track widths,
      // that we can THEN use to insert last columns and properly format
      const columns = Object.entries(uniqueStarts)
        .reduce((acc, [start, eventsAtStart], index, starts) => {
          const columnWidth =
            index < starts.length - 1
              ? starts[index + 1][1][0].position.start - parseInt(start) + "fr"
              : (eventsAtStart[0].dimensions.length + "fr" ?? "auto");
          // Every possible displayEvent type is given its own named column line (per *event*)
          const makeColumn = ({ start, columnWidth }) => {
            return `e${start}-start e${start}-text] auto [e${start}-bracket] auto [e${start}-bar] auto [e${start}-cle] auto [e${start}-key] auto [e${start}-tim] auto [e${start}-acc] auto [e${start}-art] auto [e${start}-not] auto [e${start}-ste-up] auto [e${start}-trailing-space] minmax(0.1rem, ${columnWidth}) [e${start}-me-cle] auto [e${start}-me-bar] auto [e${start}-me-key] auto [e${start}-me-tim] auto [e${start}-end `;
          };
          if (
            uniqEventsByFlow[eventsAtStart[0].flowId].at(-1).position.end ===
            eventsAtStart[0].position.end
          ) {
            // Add start- and end-positions for the last event in a flow
            return `${acc}${makeColumn({ start, columnWidth, index, starts })}${makeColumn({ start: eventsAtStart[0].position.end, columnWidth: "auto", index, starts })}`;
          } else {
            return `${acc}${makeColumn({ start, columnWidth, index, starts })}`;
          }
        }, "[")
        .concat("]");
      return { ...context, columns };
    }
    case "setPeriods": {
      const flowEvents = Object.values(context.flows).map((flow) =>
        flow.events.flatMap((event) => event.position.start),
      );
      // I. for all flows, are there intersections of
      // event.position.start?
      // (TODO: and event.position.end?)
      const periods = flowEvents.reduce((a, b) =>
        a.filter((c) => b.includes(c)),
      );
      // II. TODO: if one flow is longer than the other,
      // or only one flow,
      // add periods @remaining flow's measure starts.
      // III. TODO: Finally, group all flow events into
      // "Periods" so we can again reflow systems.
      return {
        ...context,
        periods: [...new Set(periods)].sort((a, b) => a - b),
      };
    }
    case "updateWidth": {
      return {
        ...context,
        page: action.width,
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
    addGridRows: ({ rows }) => {
      dispatch({ type: "addGridRows", rows });
    },
    updateWidth: ({ width }) => {
      dispatch({ type: "updateWidth", width });
    },
    setFlow: ({ flow }) => {
      // TODO: Transform tempo, clef, key and meter changes from the json score into an object of type "event."
      // To add: TEMPO
      // TODO: parts and even staves within a flow might have different keys set globally.
      const measureEvents = flow.global.measures.reduce((acc, m, mi, mm) => {
        const duration = m.time
          ? timeSignatureToDuration(m.time.count, m.time.unit)
          : acc[acc.length - 1].dimensions.length;
        const count = Array.from({ length: m.repeatCount ?? 1 }, (_, i) => i);
        let start = mi === 0 ? 0 : acc[acc.length - 1].position.end;
        for (const i of count) {
          start = i === 0 ? start : start + duration;
          delete m.repeatCount;
          acc.push({
            ...m,
            type: "measureEvent",
            key: m.key ?? acc[mi - 1].key,
            clefs: Array.from(
              { length: flow.parts.length },
              (_, i) => i,
            ).flatMap((partIndex) =>
              flow.parts[partIndex].global.clefs.map((clef) => ({
                ...clef,
                partIndex,
              })),
            ),
            time: m.time ?? acc[mi - 1].time,
            dimensions: {
              length: duration,
            },
            position: {
              start,
              end: start + duration,
            },
            positionInSystem: {
              first: false,
              last: false,
            },
          });
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

      dispatch({
        type: "setFlow",
        beamEvents,
        beamGroups,
        events,
        measureEvents,
        parts: flow.parts,
        flowId: flow.id,
      });
      dispatch({
        type: "setGridColumns",
        measureEvents,
        events,
      });
    },
    setPeriods: () => {
      dispatch({ type: "setPeriods" });
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
