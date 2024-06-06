import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

let StavesContext;
const { Provider } = (StavesContext = createContext());

const useStaves = () => useContext(StavesContext);

export default function StavesProvider({ children, value }) {
  return <Provider value={value}>{children}</Provider>;
}

StavesProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  value: PropTypes.object,
};

export { StavesContext, useStaves };
