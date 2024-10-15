import { useMemo } from "react";

const metadata = require("../../public/fonts/bravura/bravura_metadata.json");
import styles from "./Staff.module.css";

export default function StaffLine({
  pitch,
  start,
  end,
  weight = metadata.engravingDefaults.staffLineThickness / 4,
}) {
  const style = useMemo(
    () => ({
      "--pitch": pitch,
      "--start": start,
      "--end": end,
      "--weight": `${weight}rem`,
    }),
    [end, pitch, start, weight],
  );

  return <hr className={styles.line} style={style} />;
}
