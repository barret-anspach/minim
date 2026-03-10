import { useMemo } from "react";

import styles from "./styles.module.css";
import metadata from "./../../../public/fonts/bravura/bravura_metadata.json";

import { Minim } from "./../../types/minim/index.js";

type StaffLineProps = {
  pitch: Minim.Grid.Row;
  start: Minim.Grid.Column;
  end: Minim.Grid.Column;
  weight?: number;
};

export default function StaffLine({
  pitch,
  start,
  end,
  weight = metadata.engravingDefaults.staffLineThickness / 4,
}: StaffLineProps) {
  const style = useMemo(
    () => ({
      "--pitch": pitch,
      "--start": start,
      "--end": end,
      "--weight": `${weight}em`,
    }),
    [end, pitch, start, weight],
  );

  return <hr className={styles.line} style={style} data-staff-line />;
}
