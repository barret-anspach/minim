import clsx from "clsx";
import { withNoSSR } from "../../hooks/withNoSSR";
import styles from "./styles.module.css";

function StaffDisplayItem({ children, type, start }) {
  return (
    <span
      className={clsx(
        styles.staffDisplayItem,
        ["key", "brace"].includes(type) && styles.row,
        ["tim", "bracket", "art"].includes(type) && styles.column,
        start.includes("me-") && styles.end,
      )}
      style={{ "--start": start }}
    >
      {children}
    </span>
  );
}

export default withNoSSR(StaffDisplayItem);
