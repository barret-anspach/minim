import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

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
    <article className={clsx(styles.systems, className)} id={id} {...rest}>
      {children}
    </article>
  );
}
