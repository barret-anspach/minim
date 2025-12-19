import React, { useMemo } from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";

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
}: React.PropsWithChildren<EventProps>) {
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
