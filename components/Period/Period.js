import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import Barline from "../Barline/Barline";
import Bracket from "../Bracket/Bracket";
import Item from "../Item";
import Staff from "../Staff";

import useVars from "../../hooks/useVars";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./Period.module.css";
import { getColumnsForPeriod } from "../../utils/methods";
import { useMeasuresContext } from "../../contexts/MeasuresContext";
import { BeamGroup } from "../BeamGroup/BeamGroup";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";

function Period({
  children,
  index,
  period,
  handlePosition,
  first,
  last,
  ...rest
}) {
  const {
    context: { flows },
  } = useMeasuresContext();
  const ref = useRef(null);
  const columns = getColumnsForPeriod({ period });
  const rows = Object.values(period.staves)
    .flatMap((parts) =>
      Object.values(parts).flatMap((part) =>
        part.staves.flatMap((staff) => staff.pitches),
      ),
    )
    .join("");
  const lefthandBarlineRows = Object.values(flows)
    .reduce(
      (acc, flow) => [...acc, flow.layoutGroups.flatMap((group) => group.row)],
      [],
    )
    .flat();

  useLayoutEffect(() => {
    function getPositionInSystem(element) {
      const parent = element.parentElement;
      if (!parent || getComputedStyle(parent).display !== "flex") {
        return false;
      }
      const firstChildOffsetLeft = element.offsetLeft;
      let isNotFirst = false;
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child.offsetLeft < firstChildOffsetLeft) {
          isNotFirst = true;
          break;
        }
      }
      if (isNotFirst) {
        element.setAttribute("data-first", false);
        handlePosition({ index, first: false });
      } else {
        element.setAttribute("data-first", true);
        handlePosition({ index, first: true });
      }
    }

    setTimeout(() => getPositionInSystem(ref.current), 0);
    window.addEventListener("resize", () => getPositionInSystem(ref.current));

    return () => {
      window.removeEventListener("resize", () =>
        getPositionInSystem(ref.current),
      );
    };
  }, [index]);

  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.period],
    conditionalStyles: [
      {
        condition: first,
        operator: "&&",
        style: styles.first,
      },
      {
        condition: last,
        operator: "&&",
        style: styles.last,
      },
    ],
    key: "--duration",
    value: period.dimensions.length,
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
      {Object.entries(flows).map(([flowId, flow]) =>
        flow.layoutGroups.map((group, groupIndex) => (
          <Fragment key={`${flowId}p${index}g${groupIndex}_system-start`}>
            {(index === 0 || first) && (
              <Bracket
                type={group.symbol}
                column={`e${period.position.start}-bracket`}
                row={`${group.row[0]}/${group.row.at(-1)}`}
              />
            )}
            {(index === 0 || first) && (
              <Barline
                type={"regular"}
                column={`e${period.position.start}-bar`}
                row={`${lefthandBarlineRows[0]}/${lefthandBarlineRows.at(-1)}`}
                separation={true}
              />
            )}
          </Fragment>
        )),
      )}
      {Object.entries(period.beamGroups).map(([flowId, flow]) =>
        flow.map(
          (beamGroup, beamGroupIndex) =>
            beamGroup.length > 0 && (
              <BeamGroup
                key={`${flowId}p${index}bea${beamGroupIndex}`}
                beamGroup={beamGroup}
                prefix={flowId}
              />
            ),
        ),
      )}
      {Object.entries(period.staves).map(([id, flow]) =>
        flow.map(({ part, staves }) =>
          staves.map(
            ({ clef, pitches, rangeClef, staffIndex, staffBounds }) => (
              <Fragment key={`${id}s${staffIndex + 1}_items`}>
                {period.index === 0 && staffIndex === 0 && (
                  <Item
                    className={styles.partLabel}
                    column={`e0-text`}
                    pitch={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                  >
                    {part.name}
                  </Item>
                )}
                {first && period.index !== 0 && staffIndex === 0 && (
                  <Item
                    className={styles.partLabel}
                    column={`e${period.key}-text`}
                    pitch={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                  >
                    {part.shortName}
                  </Item>
                )}
                <Staff
                  id={`${id}s${staffIndex + 1}`}
                  key={`${id}s${staffIndex + 1}`}
                  pitches={pitches}
                  rangeClef={rangeClef}
                  staffBounds={staffBounds}
                  start={`e${period.position.start}-bar`}
                  end={`e${period.position.end}-end`}
                />
                {period.displayEvents.map(
                  (event, eventIndex) =>
                    event.flowId === id &&
                    ((event.eventType === "measureEnd" && last) ||
                      event.eventType === "measureStart") && (
                      <MeasureDisplayMatter
                        key={`${event.flowId}e${eventIndex}s${staffIndex}_dis`}
                        clef={clef.clef}
                        event={event}
                        flowId={event.flowId}
                        rangeClef={rangeClef}
                        staffBounds={staffBounds}
                        staffIndex={staffIndex}
                      />
                    ),
                )}
              </Fragment>
            ),
          ),
        ),
      )}
      {period.layoutEvents &&
        period.layoutEvents.map((layout, leIndex) =>
          layout.layoutGroups.map((group, groupIndex) => (
            <Fragment key={`${index}le${leIndex}_grp${groupIndex}`}>
              <Barline
                key={`${index}_grp${groupIndex}_bar`}
                type={group.barline.type}
                column={group.barline.column}
                row={group.barline.row}
                separation={group.barline.separation}
              />
            </Fragment>
          )),
        )}
      {children}
    </section>
  );
}

export default withNoSSR(Period);
