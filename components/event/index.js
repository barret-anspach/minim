import { useMemo } from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

export default function Event({ children, className, beat, pitch }) {
  const style = useMemo(
    () => ({ "--beat": beat, "--pitch": pitch }),
    [beat, pitch],
  );

  return (
    <span className={clsx(styles.event, className)} style={style}>
      {children}
    </span>
  );
}
