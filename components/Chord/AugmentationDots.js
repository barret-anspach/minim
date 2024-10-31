import { useMemo } from "react";
import clsx from "clsx";

import Item from "../item";

import styles from "./styles.module.css";

export default function AugmentationDots({ className, event, prefix, pitch }) {
  const dotArray = useMemo(
    () => Array.from({ length: event.duration.dots }, (_, i) => i),
    [event.duration.dots],
  );
  const column = useMemo(
    () => `e${event.position.start}-ste-up`,
    [event.position.start],
  );

  return event.duration.dots && event.duration.dots > 0
    ? dotArray.map((dotIndex) => (
        <Item
          key={`${prefix}_dot${dotIndex}`}
          className={clsx(styles.dot, className)}
          column={column}
          pitch={pitch}
        >
          
        </Item>
      ))
    : null;
}
