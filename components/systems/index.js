import clsx from "clsx";
import styles from "./styles.module.css";

export default function Systems({ children, view, ...rest }) {
  return (
    <article className={clsx(styles.systems, styles[view])} {...rest}>
      {children}
    </article>
  );
}
