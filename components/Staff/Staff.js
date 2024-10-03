import React, { useEffect, useRef } from "react";

import Item from "../Item";
import StaffLine from "./StaffLine";

import { usePitches } from "../../hooks/usePitches";
import useVars from "../../hooks/useVars";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./Staff.module.css";
import { useMeasuresContext } from "../../contexts/MeasuresContext";
const range = require("../../fixtures/pitch/range.json");

function Staff({
  number,
  clef,
  id,
  lined = true,
  lines = { start: null, end: null },
  start = "m-start",
  end = "m-end",
  children,
}) {
  const { actions } = useMeasuresContext();
  const ref = useRef(null);
  const style = usePitches(clef.clef, id);

  useEffect(() => {
    actions.addGridRows({ rows: style.pitches });
  }, [style.pitches]);

  useVars({
    varRef: ref,
    key: "--bounds",
    value: `${id}${style.staffBounds.upper.id} / ${id}${style.staffBounds.lower.id}`,
  });
  useVars({
    varRef: ref,
    key: "--pitches",
    value: style.pitches,
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
        clef &&
        range.clefs[style.rangeClef.type] &&
        range.clefs[style.rangeClef.type].staffLinePitches.map(
          (line, lineIndex) => (
            <StaffLine
              key={`${id}_lin${lineIndex}`}
              pitch={`${id}${line.id}`}
              start={lines.start ?? start}
              end={lines.end ?? end}
            />
          ),
        )}

      {children}
    </div>
  );
}

export default withNoSSR(Staff);
