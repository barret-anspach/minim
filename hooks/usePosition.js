import { useLayoutEffect, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { useMeasuresContext } from '../contexts/MeasuresContext';
import { approxEqual } from '../utils/methods';

export const usePosition = (target, index) => {
  const { context: { measures, page }, actions } = useMeasuresContext();
  const [position, setPosition] = useState({first: false, last: false});
  
  useLayoutEffect(() => {
    const offset = {
      top: target.current.offsetTop,
      left: target.current.offsetLeft,
      right: Math.round(target.current.getBoundingClientRect().right),
    }
    setPosition({
      first: approxEqual(offset.left, page.left),
      last: !measures[index + 1]
        || offset.top !== measures[index + 1].top
        || approxEqual(page.right, offset.right),
    })
  }, [measures[index + 1], page.left, page.right, target]);
  
  useResizeObserver(target, (entry) => {
    const offset = {
      top: entry.target.offsetTop,
      left: entry.target.offsetLeft,
      right: Math.round(entry.target.getBoundingClientRect().right),
    }
    const _position = {
      first: approxEqual(offset.left, page.left),
      last: !measures[index + 1]
        || offset.top !== measures[index + 1].top
        || approxEqual(page.right, offset.right),
    }
    actions.updateMeasure({ index, measure: { ..._position, ...offset } })
    setPosition(_position)
  })

  return position;
};