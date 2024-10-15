import { useMemo } from "react";
import clsx from "clsx";

import styles from "./Event.module.css";

export default function Event({ children, className, beat, pitch }) {
  const ref = useRef(null);
  const style = useMemo(
    () => ({ "--beat": beat, "--pitch": pitch }),
    [beat, pitch],
  );

  return (
    <span ref={ref} className={clsx(styles.event, className)} style={style}>
      {children}
    </span>
  );
}
