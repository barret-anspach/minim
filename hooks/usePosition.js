import { useLayoutEffect, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { useMeasuresContext } from '../contexts/MeasuresContext';
import { approxEqual } from '../utils/methods';

export const usePosition = (target, index) => {
  const { context: { page }, actions } = useMeasuresContext();
  const [position, setPosition] = useState({first: false, last: false});
  
  useLayoutEffect(() => {
    const offset = {
      top: target.current.offsetTop,
      left: target.current.offsetLeft,
      right: target.current.offsetLeft + target.current.offsetWidth,
    }
    setPosition({
      first: approxEqual(offset.left, page.left),
      last: approxEqual(offset.right, page.right),
    })
  }, [target]);
  
  useResizeObserver(target, (entry) => {
    const offset = {
      top: entry.target.offsetTop,
      left: entry.target.offsetLeft,
      right: entry.target.offsetLeft + entry.target.offsetWidth,
    }
    const _position = {
      first: approxEqual(offset.left, page.left),
      last: approxEqual(offset.right, page.right),
    }
    actions.updateMeasure({ index, measure: { ..._position, ...offset } })
    setPosition(_position)
  })

  return position;
};