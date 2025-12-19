import { JSX, PropsWithChildren, useMemo } from "react";

import StaffLine from "./../../components/staff/staffLine.js";

import styles from "./styles.module.css";

import { MNX } from "./../../types/mnx/index.js";
import { Minim } from "./../../types/minim/index.js";

type StaffProps = {
  id: MNX.Defs.ID;
  lines?: { start?: Minim.Grid.Column; end?: Minim.Grid.Column };
  start: Minim.Grid.Column;
  end: Minim.Grid.Column;
  lined?: boolean;
  rangeClef?: Minim.Range.Clef;
  staffBounds?: Minim.Defs.StaffBounds;
};

function Staff({
  id,
  rangeClef,
  staffBounds,
  lined = true,
  lines = { start: undefined, end: undefined },
  start = "m-start",
  end = "m-end",
  children,
}: PropsWithChildren<StaffProps>): JSX.Element {
  const style = useMemo(
    () => ({
      "--bounds": `${id}${staffBounds!.upper.id}/${id}${staffBounds!.lower.id}`,
      "--start": start,
      "--end": end,
    }),
    [end, id, staffBounds, start],
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

export default Staff;
