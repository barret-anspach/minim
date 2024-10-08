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
        right: target.current.offsetParent.offsetWidth - Math.round(target.current.offsetWidth) - Math.round(target.current.getBoundingClientRect().x),
      })
    }
  }, [target]);
  
  useResizeObserver(target, (entry) => {
    setWidth({
      left: entry.target.offsetLeft,
      right: entry.target.offsetParent.offsetWidth - Math.round(entry.contentRect.width) - Math.round(entry.target.getBoundingClientRect().x),
    })
    actions.updateWidth({width})
  })
  return width
};
