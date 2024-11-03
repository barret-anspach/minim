import { useEffect, useMemo, useState } from "react";

export default function useVars({
  varRef,
  defaultStyles = [],
  conditionalStyles = [],
  key,
  value,
  fallbackValue,
}) {
  const [className, setClassName] = useState(defaultStyles);
  const conditions = useMemo(
    () => conditionalStyles.reduce((a, e) => [...a, e.condition], []),
    [conditionalStyles],
  );

  useEffect(() => {
    if (varRef?.current !== undefined) {
      varRef.current.style.setProperty(key, value ?? fallbackValue);
    }
  }, [key, value, fallbackValue]);

  useEffect(() => {
    setClassName([
      ...defaultStyles,
      ...conditionalStyles.map((expression) => {
        switch (expression.operator) {
          case "&&":
            return expression.condition && expression.style;
          case "ternary":
            return expression.style[expression.condition ? 0 : 1];
        }
      }),
    ]);
  }, [...conditions]);

  return className;
}
