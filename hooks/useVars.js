import { useLayoutEffect, useState } from "react";

export default function useVars({
  varRef,
  defaultStyles = [],
  conditionalStyles = [],
  key,
  value,
  fallbackValue
}) {
  const [className, setClassName] = useState([...defaultStyles]);
  const conditions = conditionalStyles.reduce((a, e) => [...a, e.condition], []);

  useLayoutEffect(() => {
    if (varRef?.current !== undefined) {
      varRef.current.style.setProperty(key, value ?? fallbackValue);
    }
  }, [key, value, fallbackValue]);

  useLayoutEffect(() => {
    setClassName([...defaultStyles, ...conditionalStyles.map(expression => {
      switch (expression.operator) {
        case '&&':
          return expression.condition && expression.style;
      }
    })]);
  }, [...conditions]);

  return className;
}

export function setRefElemFromArrayByIndex({ element, refArray, index }) {
    return refArray.current[index] = element;
  }
