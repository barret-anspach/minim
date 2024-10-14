import { useLayoutEffect, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";

export const usePosition = (target, index) => {
  const [positions, setPositions] = useState([]);

  useLayoutEffect(() => {
    if (target) {
      const parent = target.parentElement;
      if (!parent || getComputedStyle(parent).display !== "flex") {
        return false;
      }
      const firstChildOffsetLeft = target.offsetLeft;
      let isNotFirst = false;
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child.offsetLeft < firstChildOffsetLeft) {
          isNotFirst = true;
          break;
        }
      }
      setPositions((prev) => {
        const newArr = [...prev];
        newArr[index] = isNotFirst;
        return newArr;
      });
    }
  }, [index, target]);

  useResizeObserver(target, (entry) => {
    setPositions((prev) => {
      const newArr = [...prev];
      newArr[index] = entry.target.offsetLeft < target.offsetLeft;
      return newArr;
    });
  });

  return { systemStart: positions[index], systemEnd: positions[index + 1] };
};
