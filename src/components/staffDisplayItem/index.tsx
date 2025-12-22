import clsx from "clsx";
import { PropsWithChildren } from "react";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";

type StaffDisplayItemTypes = "brace" | "bracket" | "art" | "key" | "tim";

type StaffDisplayItemProps = {
  type: StaffDisplayItemTypes;
  start: Minim.Grid.Column;
};

function StaffDisplayItem({
  children,
  type,
  start,
  ...rest
}: PropsWithChildren<StaffDisplayItemProps>) {
  return (
    <span
      className={clsx(
        styles.staffDisplayItem,
        ["key", "brace"].includes(type) && styles.row,
        ["tim", "bracket", "art"].includes(type) && styles.column,
        start.includes("me-") && styles.end,
      )}
      style={{ "--start": start }}
      {...rest}
    >
      {children}
    </span>
  );
}

export default StaffDisplayItem;
