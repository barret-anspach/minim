import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { cx } from "./../../utils/classNames";

type StaffDisplayItemTypes = "brace" | "bracket" | "art" | "key" | "tim";

type StaffDisplayItemProps = {
  type: StaffDisplayItemTypes;
  start: Minim.Grid.Column;
};

function StaffDisplayItem({
  children,
  type,
  start,
}: React.PropsWithChildren<StaffDisplayItemProps>) {
  return (
    <span
      className={cx(
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

export default StaffDisplayItem;
