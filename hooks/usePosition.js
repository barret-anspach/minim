import { useLayoutEffect, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";

import { useMeasuresContext } from "../contexts/MeasuresContext";
import { approxEqual } from "../utils/methods";

export const usePosition = (target, index, key) => {
  const {
    context: { periods, page },
    actions,
  } = useMeasuresContext();
  const [position, setPosition] = useState({ first: false, last: false });
  const nextPeriod = Object.values(periods).at(index + 1);

  useLayoutEffect(() => {
    const offset = {
      top: target.current.offsetTop,
      left: target.current.offsetLeft,
      right: Math.round(target.current.getBoundingClientRect().right),
    };
    setPosition({
      first: approxEqual(offset.left, page.left),
      last:
        !nextPeriod ||
        offset.top !== nextPeriod.positionInSystem.offset.top ||
        approxEqual(page.right, offset.right),
    });
  }, [nextPeriod, page.left, page.right, target]);

  useResizeObserver(target, (entry) => {
    const offset = {
      top: entry.target.offsetTop,
      left: entry.target.offsetLeft,
      right: Math.round(entry.target.getBoundingClientRect().right),
    };
    const positionInSystem = {
      first: approxEqual(offset.left, page.left),
      last:
        !nextPeriod ||
        offset.top !== nextPeriod.positionInSystem.offset.top ||
        approxEqual(page.right, offset.right),
      offset,
    };
    actions.updatePeriod({
      key,
      period: {
        ...Object.values(periods)[index],
        positionInSystem: positionInSystem,
      },
    });
    setPosition(positionInSystem);
  });

  return position;
};
