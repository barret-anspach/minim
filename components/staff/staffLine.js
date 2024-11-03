import { useMemo } from "react";
import styles from "./styles.module.css";
const metadata = require("../../public/fonts/bravura/bravura_metadata.json");

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
