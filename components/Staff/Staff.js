import React, { useRef } from "react";

import StaffLine from "./StaffLine";

import useVars from "../../hooks/useVars";
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
  const ref = useRef(null);

  useVars({
    varRef: ref,
    key: "--bounds",
    value: `${id}${staffBounds.upper.id} / ${id}${staffBounds.lower.id}`,
  });
  useVars({
    varRef: ref,
    key: "--pitches",
    value: pitches,
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

  return (
    <div className={styles.staff} ref={ref}>
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
