import { createContext, useContext, useMemo, useReducer } from "react";

import { setFlow } from "./../contexts/setFlow.js";
import {
  getEventStartsForPeriod,
  getMeasureStartsForPeriod,
  getPeriodIntersections,
  getDisplayStartsForPeriod,
  getAllEventsForPeriod,
} from "./../utils/methods.js";

import { Minim } from "./../types/minim/index.js";

type Context = {
  flows: {
    [k: Minim.Component.Flow["id"]]: Minim.Component.Flow;
  };
  initialized: boolean;
  periods: Record<number, Minim.Period.PeriodItem>;
};

type SetFlowProps = { flow: Minim.Document.FlowItem };
type SetFlowPayloadProps = Minim.Component.Flow;
type UpdatePeriodProps = {
  key: number;
  period: Minim.Period.PeriodItem;
};
type Actions = {
  setFlow: (props: SetFlowProps) => void;
  updatePeriod: (props: UpdatePeriodProps) => void;
  setPeriods: () => void;
  reset: () => void;
};

type DispatchAction =
  | { type: "reset"; payload: null }
  | { type: "setPeriods"; payload: null }
  | { type: "setFlow"; payload: SetFlowPayloadProps }
  | { type: "updatePeriod"; payload: UpdatePeriodProps };

const initialState: Context = {
  initialized: false,
  flows: {},
  periods: {},
};

const initialActions: Actions = {
  setFlow: () => {},
  setPeriods: () => {},
  updatePeriod: () => {},
  reset: () => {},
};

const MeasuresContext = createContext<{
  context: Context;
  actions: Actions;
}>({ context: initialState, actions: initialActions });
MeasuresContext.displayName = "MeasuresContext";

function measuresReducer(context: Context, action: DispatchAction) {
  switch (action.type) {
    case "reset": {
      return {
        initialized: false,
        flows: {},
        periods: {},
      };
    }
    case "setFlow": {
      const flows = context.flows;
      flows[action.payload.id] = {
        type: "componentFlow",
        id: action.payload.id,
        beamEvents: action.payload.beamEvents,
        beamGroups: action.payload.beamGroups,
        events: action.payload.events,
        layouts: action.payload.layouts,
        layoutEvents: action.payload.layoutEvents,
        layoutGroups: action.payload.layoutGroups,
        measures: action.payload.measures,
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
      const periods = getPeriodIntersections({
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
      const periods = {
        ...context.periods,
        [action.payload.key]: {
          ...context.periods[action.payload.key],
          ...action.payload.period,
        },
      };

      return {
        ...context,
        periods,
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
  children?: React.ReactNode;
}) => {
  const [context, dispatch] = useReducer(measuresReducer, initialState);

  const actions = useMemo(
    () => ({
      reset: () => {
        dispatch({ type: "reset", payload: null });
      },
      setFlow: ({ flow }: SetFlowProps) => {
        const payload: SetFlowPayloadProps = setFlow({ flow });
        dispatch({ type: "setFlow", payload });
      },
      setPeriods: () => {
        dispatch({ type: "setPeriods", payload: null });
      },
      updatePeriod: ({ key, period }: UpdatePeriodProps) => {
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
