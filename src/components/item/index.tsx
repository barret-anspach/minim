import { PropsWithChildren, useMemo } from "react";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { cx } from "./../../utils/classNames.js";

type ItemProps = {
  pitch: Minim.Grid.Row;
  className?: string;
  column?: Minim.Grid.Column;
  label?: boolean;
  padEnd?: number;
  size?: number;
  text?: boolean;
};

function Item({
  children,
  className,
  column,
  label = false,
  padEnd,
  pitch,
  size,
  text = false,
  ...rest
}: PropsWithChildren<ItemProps>) {
  const style = useMemo(
    () => ({
      "--column": column ?? "e0",
      "--padEnd": padEnd ? `${padEnd}em` : "0.1em",
      "--pitch": pitch,
      "--size": size ? `${size}em` : "4em",
    }),
    [column, padEnd, pitch, size],
  );
  return (
    <span
      className={cx([
        styles.item,
        label && styles.label,
        text && styles.text,
        className,
      ])}
      style={style}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Item;
