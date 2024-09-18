import { createContext, useContext, useReducer } from "react";
import { timeSignatureToDuration } from "../utils/methods";

const initialState = {
  initialized: false,
  measures: [],
  page: {
    left: null,
    right: null,
  },
};

const MeasuresContext = createContext();
MeasuresContext.displayName = "MeasuresContext";

function measuresReducer (context, action) {
  switch (action.type) {
    case 'updateWidth': {
      return {
        ...context,
        page: action.width,
      };
    }
    case 'updateMeasure': {
      const measures = [...context.measures]
      measures[action.index] = { ...measures[action.index], ...action.measure }
      return {
        ...context,
        measures,
      };
    }
    case 'setAllMeasures': {
      return { ...context, initialized: true, measures: action.measures };
    }
    case 'uninitialize': {
      return { ...context, initialized: false };
    }
    default: {
      return context;
    }
  }
}

const MeasuresContextProvider = ({ children }) => {
  const [context, dispatch] = useReducer(
    measuresReducer,
    initialState
  );

  const actions = {
    updateWidth: ({ width }) => {
      dispatch({ type: 'updateWidth', width });
    },
    setAllMeasures: ({ score }) => {
      const measures = score.global.measures.reduce((acc, measure, index) => {
        return [...acc, {
          index,
          duration: measure.time
            ? timeSignatureToDuration(measure.time.count, measure.time.unit)
            : acc[index - 1].duration,
          key: measure.key ?? acc[index - 1].key,
          first: false,
          last: false,
        }];
      }, []);
      dispatch({ type: 'setAllMeasures', measures });
    },
    setBeamPosition: () => {},
    updateMeasure: ({ index, measure }) => {
      dispatch({ type: 'updateMeasure', index, measure });
    },
    uninitialize: () => {
      dispatch({ type: 'uninitialize' });
    }
  }

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

export {
  MeasuresContext,
  MeasuresContextProvider,
  useMeasuresContext,
};
