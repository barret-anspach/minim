import React, { useMemo } from "react";

import StaffLine from "./StaffLine";

import { withNoSSR } from "../../hooks/withNoSSR";
import styles from "./Staff.module.css";

function Staff({
  id,
  pitches,
  rangeClef,
  staffBounds,
  lined = true,
  lines = { start: null, end: null },
  start = "m-start",
  end = "m-end",
  children,
}) {
  const style = useMemo(
    () => ({
      "--bounds": `${id}${staffBounds.upper.id} / ${id}${staffBounds.lower.id}`,
      "--pitches": pitches,
      "--start": start,
      "--end": end,
    }),
    [end, id, pitches, staffBounds.lower.id, staffBounds.upper.id, start],
  );

  return (
    <div className={styles.staff} style={style}>
      {lined &&
        rangeClef &&
        rangeClef.staffLinePitches.map((line, lineIndex) => (
          <StaffLine
            key={`${id}_lin${lineIndex}`}
            pitch={`${id}${line.id}`}
            start={lines.start ?? start}
            end={lines.end ?? end}
          />
        ))}

      {children}
    </div>
  );
}

export default withNoSSR(Staff);
