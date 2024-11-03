import clsx from "clsx";
import styles from "./styles.module.css";

export default function Systems({ className, children, ...rest }) {
  return (
    <article className={clsx(styles.systems, className)} {...rest}>
      {children}
    </article>
  );
}
