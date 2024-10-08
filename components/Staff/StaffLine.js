import { useRef } from "react";

import useVars from "../../hooks/useVars";

const metadata = require("../../public/fonts/bravura/bravura_metadata.json");
import styles from "./Staff.module.css";

export default function StaffLine({
  pitch,
  start,
  end,
  weight = metadata.engravingDefaults.staffLineThickness / 4,
}) {
  const ref = useRef(null);
  useVars({
    varRef: ref,
    key: "--pitch",
    value: pitch,
  });
  useVars({
    varRef: ref,
    key: "--start",
    value: start,
  });
  useVars({
    varRef: ref,
    key: "--end",
    value: end,
  });
  useVars({
    varRef: ref,
    key: "--weight",
    value: `${weight}rem`,
  });
  return <hr ref={ref} className={styles.line} />;
}
