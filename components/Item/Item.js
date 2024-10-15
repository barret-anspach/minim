import { useMemo } from "react";
import clsx from "clsx";

import styles from "./Item.module.css";

function Item({
  children,
  className,
  column,
  label = false,
  padEnd,
  pitch,
  size,
  text = false,
}) {
  const style = useMemo(
    () => ({
      "--column": column ?? "e0",
      "--padEnd": padEnd ? `${padEnd}rem` : "0.1rem",
      "--pitch": pitch,
      "--size": size ? `${size}rem` : "4rem",
    }),
    [column, padEnd, pitch, size],
  );
  return (
    <span
      className={clsx([
        styles.item,
        label && styles.label,
        text && styles.text,
        className,
      ])}
      style={style}
    >
      {children}
    </span>
  );
}

export default Item;
