import { Fragment, useRef } from "react";
import clsx from "clsx";

import Barline from "../Barline/Barline";
import Bracket from "../Bracket/Bracket";

import { usePosition } from "../../hooks/usePosition";
import useVars from "../../hooks/useVars";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./Measure.module.css";
import { getColumnsForPeriod } from "../../utils/methods";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

function Measure({
  children,
  index,
  measure,
  measureIndex,
  measures,
  ...rest
}) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const ref = useRef(null);
  const columns = getColumnsForPeriod({ period: measure });
  const rows = Object.values(measure.staves)
    .flatMap((parts) =>
      Object.values(parts).flatMap((part) =>
        part.staves.flatMap((staff) => staff.pitches),
      ),
    )
    .join("");
  const flowsPositionEnd = Object.values(flows).map(
    (flow) => flow.events.at(-1).position.end,
  );
  // const { first, last } = usePosition(ref, index, measure.position.start);

  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.measure],
    conditionalStyles: [
      {
        condition: measure.positionInSystem.first,
        operator: "&&",
        style: styles.first,
      },
      {
        condition: measure.positionInSystem.last,
        operator: "&&",
        style: styles.last,
      },
    ],
    key: "--duration",
    value: measure.dimensions.length,
  });
  useVars({
    varRef: ref,
    key: "--indent",
    value: index === 0 ? "3rem" : "auto",
  });
  useVars({
    varRef: ref,
    key: "--rows",
    value: rows,
  });
  useVars({
    varRef: ref,
    key: "--columns",
    value: columns,
  });

  return (
    <section ref={ref} className={clsx(className)} {...rest}>
      {measure.layoutEvents &&
        measure.layoutEvents.map((layout, leIndex) =>
          layout.layoutGroups.map((group, groupIndex) => (
            <Fragment key={`${index}le${leIndex}_grp${groupIndex}`}>
              <Barline
                key={`${index}_grp${groupIndex}_bar`}
                className={styles.barline}
                type={group.barline.type}
                column={group.barline.column}
                row={group.barline.row}
                separation={group.barline.separation}
              />
              {(index === 0 || measure.positionInSystem.first) && (
                <Bracket
                  type={group.bracket.type}
                  column={group.bracket.column}
                  row={group.bracket.row}
                />
              )}
            </Fragment>
          )),
        )}
      {children}
    </section>
  );
}

export default withNoSSR(Measure);
