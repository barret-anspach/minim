import { useRef } from "react";
import clsx from "clsx";

import useVars from "../../hooks/useVars";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./StaffDisplayItem.module.css";

function StaffDisplayItem({ children, type, start }) {
  const varRef = useRef(null);
  const className = useVars({
    defaultStyles: [styles.staffDisplayItem],
    conditionalStyles: [
      { condition: type === "key", operator: "&&", style: styles.row },
      { condition: type === "tim", operator: "&&", style: styles.column },
      { condition: start.includes("me-"), operator: "&&", style: styles.end },
    ],
    key: "--main-axis",
    value: "1fr",
  });

  useVars({
    varRef,
    key: "--start",
    value: start,
  });

  return (
    <span ref={varRef} className={clsx(className)}>
      {children}
    </span>
  );
}

export default withNoSSR(StaffDisplayItem);
