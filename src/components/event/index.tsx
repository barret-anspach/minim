import { PropsWithChildren, useMemo } from "react";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { cx } from "./../../utils/classNames";

type EventProps = {
  className?: string;
  beat: Minim.Grid.Column;
  pitch: Minim.Grid.Row;
};

export default function Event({
  children,
  className,
  beat,
  pitch,
  ...rest
}: PropsWithChildren<EventProps>) {
  const style = useMemo(
    () => ({ "--beat": beat, "--pitch": pitch }),
    [beat, pitch],
  );

  return (
    <span
      data-event
      className={cx(styles.event, className)}
      style={style}
      {...rest}
    >
      {children}
    </span>
  );
}
