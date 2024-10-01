import { createContext, useContext, useReducer } from "react";
import { timeSignatureToDuration } from "../utils/methods";

const initialState = {
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
      flows[flows.id] = action.measures;
      return { ...context, initialized: true, flows };
    }
    default: {
      return context;
    }
  }
}

const MeasuresContextProvider = ({ children }) => {
  const [context, dispatch] = useReducer(measuresReducer, initialState);

  const actions = {
    updateWidth: ({ width }) => {
      dispatch({ type: "updateWidth", width });
    },
    setFlow: ({ flow }) => {
      // TODO: refactor to store a flat list of events in flows[], decorated into a standalone shape so we can then assemble measures, taking into account *all* flow events.
      // The above requires that tempo, clef, key and meter changes are all transformed from the json score into an event.
      const measures = flow.global.measures.reduce((acc, measure, index) => {
        const count = Array.from(
          { length: measure.repeatCount ?? 1 },
          (_, i) => i,
        );
        let meas = [];
        let start = index === 0 ? 0 : acc[acc.length - 1].start;
        for (const i of count) {
          const duration = measure.time
            ? timeSignatureToDuration(measure.time.count, measure.time.unit)
            : acc[index - 1].duration;
          start = i === 0 ? start : start + duration;
          const _index = acc[acc.length - 1]
            ? acc[acc.length - 1]?.index + i + 1
            : i;
          meas = [
            ...meas,
            {
              index: _index,
              start,
              duration,
              clefs: flow.parts.map((part) => part.global.clefs),
              voices: flow.parts.map((part) => {
                // part.sequences.length === number of voices in part
                const voiceEvents = Array.from(
                  { length: part.sequences.length },
                  (_, i) => i,
                ).reduce(
                  // get an array of events by voice
                  // (assumption: sequence.content is always of event type "measure")
                  (acc, voiceNumber) =>
                    (acc[voiceNumber] =
                      part.sequences[voiceNumber].content[index]),
                  [],
                );
                // get duration, and start and end "duration-stamps"
                return voiceEvents;
              }),
              key: measure.key ?? acc[index - 1].key,
              time:
                measure.time ?? meas[i - 1].time ?? acc[acc.length - 1].time,
              first: false,
              last: false,
            },
          ];
        }
        return [...acc, ...meas];
      }, []);
      dispatch({ type: "setFlow", measures, flowId: flow.id });
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
