import { useLayoutEffect, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { useMeasuresContext } from '../contexts/MeasuresContext';

export const useWidth = (target) => {
  const { actions } = useMeasuresContext();
  const [width, setWidth] = useState({ left: null, right: null });
  
  useLayoutEffect(() => {
    if (target.current !== null) {
      setWidth({
        left: target.current.offsetLeft,
        right: target.current.offsetLeft + target.current.offsetWidth,
      })
    }
  }, [target]);
  
  useResizeObserver(target, (entry) => {
    setWidth({
      left: entry.target.offsetLeft,
      right: entry.target.offsetLeft + entry.target.offsetWidth,
    })
    actions.updateWidth({width})
  })
  return width
};
