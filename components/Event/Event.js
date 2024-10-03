import { useRef } from "react";
import clsx from "clsx";

import useVars from "../../hooks/useVars";
import styles from "./Event.module.css";

export default function Event({ children, beat, pitch }) {
  const ref = useRef(null);

  useVars({
    varRef: ref,
    key: "--beat",
    value: beat,
  });
  useVars({
    varRef: ref,
    key: "--pitch",
    value: pitch,
  });

  return (
    <span ref={ref} className={clsx(styles.event)}>
      {children}
    </span>
  );
}
