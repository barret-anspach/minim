import { createContext, useContext, useMemo, useReducer } from "react";
import {
  areClefsEqual,
  areTempiEqual,
  areTimeSignaturesEqual,
  decorateEvent,
  getBeamGroupsForPeriod,
  getBeamGroupStem,
  getDisplayEventsForPeriod,
  getEventStartsForPeriod,
  getFlowLayoutAtPoint,
  getFlowLayoutBarlinesAtPoint,
  getLayoutEventsForPeriod,
  getMeasuresForPeriod,
  getMeasureStartsForPeriod,
  getStavesForFlow,
  getPeriodIntersections,
  lengthToDurationObj,
  timeSignatureToDuration,
  getDisplayStartsForPeriod,
  getAllEventsForPeriod,
} from "../utils/methods";
import { Minim } from "../types/minim";
import { MNX } from "../types/mnx";
import { setFlow } from "./setFlow";

type Context = {
  flows: {
    [k: Minim.Component.Flow["id"]]: Minim.Component.Flow;
  };
  initialized: boolean;
  periods: Minim.Period.PeriodItem[];
};
type Action = {
  type: string;
  payload: any;
};

const initialState: Context = {
  initialized: false,
  flows: {},
  periods: [],
};

const MeasuresContext = createContext<{
  context: Context;
  actions: { [k: string]: (props?: any) => void };
}>({ context: initialState, actions: {} });
MeasuresContext.displayName = "MeasuresContext";

function measuresReducer(context: Context, action: Action) {
  switch (action.type) {
    case "reset": {
      return initialState;
    }
    case "setFlow": {
      const flows = context.flows;
      flows[action.payload.flowId] = {
        type: "componentFlow",
        id: action.payload.flowId,
        beamEvents: action.payload.beamEvents,
        beamGroups: action.payload.beamGroups,
        events: action.payload.events,
        layouts: action.payload.layouts,
        layoutEvents: action.payload.layoutEvents,
        layoutGroups: action.payload.layoutGroups,
        measures: action.payload.measureEvents,
        parts: action.payload.parts,
        staves: action.payload.staves,
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

      const flowMeasureStarts = getMeasureStartsForPeriod({
        flows: context.flows,
      });
      const flowEventStarts = getEventStartsForPeriod({ flows: context.flows });
      let periods = getPeriodIntersections({
        eventStarts: flowEventStarts,
        measureStarts: flowMeasureStarts,
      });

      const flowDisplayStarts: Minim.Parser.Flow.DisplayStarts =
        getDisplayStartsForPeriod({ flows: context.flows });
      const periodEvents = getAllEventsForPeriod({
        displayStarts: flowDisplayStarts,
        eventStarts: flowEventStarts,
        flows: context.flows,
        periods,
      });

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
          [action.payload.key]: {
            ...context.periods[action.payload.key],
            ...action.payload.period,
          },
        },
      };
    }
    default: {
      return context;
    }
  }
}

const MeasuresContextProvider = ({
  children,
}: {
  children?: React.ReactNode[];
}) => {
  const [context, dispatch] = useReducer(measuresReducer, initialState);

  const actions = useMemo(
    () => ({
      reset: () => {
        dispatch({ type: "reset", payload: null });
      },
      setFlow: ({ flow }: { flow: Minim.Document.FlowItem }) => {
        const payload = setFlow({ flow });
        dispatch({ type: "setFlow", payload });
      },
      setPeriods: () => {
        dispatch({ type: "setPeriods", payload: null });
      },
      updatePeriod: ({
        key,
        period,
      }: {
        key: string;
        period: Minim.Period.PeriodItem;
      }) => {
        dispatch({ type: "updatePeriod", payload: { key, period } });
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
