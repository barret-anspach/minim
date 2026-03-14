import React from "react";

import styles from "./styles.module.css";
import { cx } from "./../../utils/classNames.js";

interface SystemsProps {
  className?: string;
  children: React.ReactNode;
  id: string;
}

export default function Systems({
  className,
  children,
  id,
  ...rest
}: SystemsProps) {
  return (
    <article className={cx(styles.systems, className)} id={id} {...rest}>
      {children}
    </article>
  );
}
