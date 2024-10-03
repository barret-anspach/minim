import { createContext, useContext, useReducer } from "react";
import { decorateEvent, timeSignatureToDuration } from "../utils/methods";

const initialState = {
  columns: "",
  rows: "",
  flows: {},
  initialized: false,
  measures: [],
  page: {
    left: null,
    right: null,
  },
};

const MeasuresContext = createContext();
MeasuresContext.displayName = "MeasuresContext";

function measuresReducer(context, action) {
  switch (action.type) {
    case "updateWidth": {
      return {
        ...context,
        page: action.width,
      };
    }
    case "setFlow": {
      const flows = context.flows;
      flows[action.flowId] = {
        displayEvents: action.displayEvents,
        events: action.events,
        measures: action.displayEvents,
        parts: action.parts,
      };
      return { ...context, initialized: true, flows };
    }
    case "setGridColumns": {
      const uniqueStarts = Object.groupBy(
        Object.values(context.flows).flatMap((flow) => flow.events),
        (e) => e.position.start,
      );
      // TODO: column width should be current event's dimensions.length minus next event's start
      const columns = Object.entries(uniqueStarts).reduce(
        (acc, [start, value], index, starts) => {
          // What grid track gets this value? Should really be the entirety of `e${start}`.
          const columnWidth =
            index < starts.length - 1
              ? starts[index + 1][1][0].position.start - parseInt(start) + "fr"
              : (value[0].dimensions.length + "fr" ?? "auto");
          // Every possible displayEvent type is given its own named column (per *event*)
          return `${acc} e${start}-start e${start}-text] auto [e${start}-bracket] auto [e${start}-bar] auto [e${start}-cle] auto [e${start}-key] auto [e${start}-tim] auto [e${start}-acc] auto [e${start}-art] auto [e${start}-ste-dow] auto [e${start}-not] auto [e${start}-ste-up] auto [e${start}-me-cle] auto [e${start}-me-bar] auto [e${start}-me-key] auto [e${start}-me-tim] auto [e${start}-end${index === starts.length - 1 ? "]" : ""}`;
        },
        "[",
      );
      return { ...context, columns };
    }
    case "addGridRows": {
      return { ...context, rows: context.rows.concat(action.rows) };
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
      // Left to add: CLEF, TEMPO
      const displayEvents = flow.global.measures.reduce((acc, m, mi, mm) => {
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
            key: m.key ?? acc[mi - 1].key,
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
        // TODO: How should a clef change be placed in the score?
        const clefsByStaff = Object.groupBy(
          part.global.clefs,
          ({ staff }) => staff,
        );

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

      dispatch({
        type: "setFlow",
        displayEvents,
        events,
        parts: flow.parts,
        flowId: flow.id,
      });
      dispatch({
        type: "setGridColumns",
        displayEvents,
        events,
      });
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
