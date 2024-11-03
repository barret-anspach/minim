import React, { useMemo } from "react";
import StaffLine from "./staffLine";
import { withNoSSR } from "../../hooks/withNoSSR";
import styles from "./styles.module.css";

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
      "--start": start,
      "--end": end,
    }),
    [end, id, staffBounds.lower.id, staffBounds.upper.id, start],
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
