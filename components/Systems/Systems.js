import { useRef } from "react";

import { useWidth } from "../../hooks/useWidth";
import styles from "./Systems.module.css";

export default function Systems({ children, columns, rows, ...rest }) {
  const ref = useRef(null);
  useWidth(ref);
  return (
    <article
      ref={ref}
      className={styles.systems}
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gridTemplateRows:
          rows ??
          "[fscore0_flow0s1] auto [fscore0_flow0s2] auto [fscore0_flow1s1] auto [fscore0_flow1s2] auto",
      }}
      {...rest}
    >
      {children}
    </article>
  );
}
