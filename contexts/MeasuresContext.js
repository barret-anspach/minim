import { createContext, useContext, useReducer } from "react";

const initialState = {
  measures: [
    {index: 0, duration: 2048, first: false, last: false },
    {index: 1, duration: 1024, first: false, last: false },
    {index: 2, duration: 1024, first: false, last: false },
    {index: 3, duration: 1024, first: false, last: false },
    {index: 4, duration: 1024, first: false, last: false },
    {index: 5, duration: 2048, first: false, last: false },
    {index: 6, duration: 512, first: false, last: false },
    {index: 7, duration: 4096, first: false, last: false },
    {index: 8, duration: 1024, first: false, last: false },
    {index: 9, duration: 768, first: false, last: false }
  ],
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
      return { ...context, measures: action.measures };
    }
    case 'setDisplayMeasures': {
      return { ...context, displayMeasures: action.measures };
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
    setAllMeasures: ({ measures }) => {
      dispatch({ type: 'setAllMeasures', measures });
    },
    updateMeasure: ({ index, measure }) => {
      dispatch({ type: 'updateMeasure', index, measure });
    },
    registerMeasureUpdate: () => {
      dispatch({
        type: 'setDisplayMeasures',
        measures: context.measures.reduce((acc, m, mi) => {
          const _m = {
            ...m,
            index: mi,
            offsetY: m.offsetY,
            first: !context.measures[mi - 1]
              || m.offsetY !== context.measures[mi - 1].offsetY,
            last: !context.measures[mi + 1]
              || m.offsetY !== context.measures[mi + 1].offsetY,
          }
          return [...acc, _m]
        }, [])
      })
    },
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
