import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

let GridContext;
const { Provider } = (GridContext = createContext());

const useGrid = () => useContext(GridContext);

export default function GridProvider({ children, value }) {
  return <Provider value={value}>{children}</Provider>;
}

GridProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  value: PropTypes.object,
};

export { GridContext, useGrid };
