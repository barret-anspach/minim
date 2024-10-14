import { Fragment, useLayoutEffect, useRef } from "react";
import clsx from "clsx";

import Barline from "../Barline/Barline";
import { BeamGroup } from "../BeamGroup/BeamGroup";
import Bracket from "../Bracket/Bracket";
import Clef from "../Clef";
import Item from "../Item";
import Key from "../Key";
import Meter from "../Meter";
import Staff from "../Staff";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import useVars from "../../hooks/useVars";
import { getColumnsForPeriod } from "../../utils/methods";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./Period.module.css";

const Period = ({
  children,
  handlePosition,
  index,
  period,
  systemStart,
  systemEnd,
}) => {
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
        // element.setAttribute("data-first", false);
        handlePosition({ index, first: false });
      } else {
        // element.setAttribute("data-first", true);
        handlePosition({ index, first: true });
      }
    }

    setTimeout(getPositionInSystem(ref.current), 0);
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
        condition: systemStart,
        operator: "&&",
        style: styles.first,
      },
      {
        condition: systemEnd,
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
    <section ref={ref} className={clsx(className)}>
      {Object.entries(flows).map(([flowId, flow]) =>
        flow.layoutGroups.map((group, groupIndex) => (
          <Fragment key={`${flowId}p${index}g${groupIndex}_system-start`}>
            {(index === 0 || systemStart) && (
              <Bracket
                type={group.symbol}
                column={`e${period.position.start}-bracket`}
                row={`${group.row[0]}/${group.row.at(-1)}`}
              />
            )}
            {(index === 0 || systemStart) && (
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
                {systemStart && period.index !== 0 && staffIndex === 0 && (
                  <Item
                    className={styles.partLabel}
                    column={`e${period.position.start}-text`}
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
                {clef && systemStart && (
                  <Clef
                    id={`${id}s${staffIndex + 1}`}
                    clef={clef.clef}
                    column={`e${period.position.start}-cle`}
                  />
                )}
                {period.key[id] && systemStart && (
                  <Key
                    id={`${id}s${staffIndex + 1}`}
                    clefType={rangeClef.type}
                    column={`e${period.position.start}-key`}
                    fifths={period.key[id].fifths}
                  />
                )}
                {period.displayEvents.map(
                  (event, eventIndex) =>
                    event.flowId === id && (
                      <Fragment
                        key={`${id}s${staffIndex + 1}eve${eventIndex}_dis`}
                      >
                        {event.key && (
                          <Key
                            id={`${id}s${staffIndex + 1}`}
                            clefType={rangeClef.type}
                            column={event.key.column}
                            fifths={event.key.fifths}
                            prevFifths={event.key.prevFifths}
                          />
                        )}
                        {event.time &&
                          (event.eventType === "measureStart" ||
                            (event.eventType === "measureEnd" &&
                              systemEnd)) && (
                            <Meter
                              id={`${id}s${staffIndex + 1}`}
                              clef={clef.clef}
                              count={event.time.count}
                              unit={event.time.unit}
                              start={event.time.column}
                            />
                          )}
                      </Fragment>
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
              {((group.position === "end" && systemEnd) ||
                group.barline.type === "final" ||
                group.position === "start") && (
                <Barline
                  key={`${index}_grp${groupIndex}_bar`}
                  type={group.barline.type}
                  column={group.barline.column}
                  row={group.barline.row}
                  separation={group.barline.separation}
                />
              )}
            </Fragment>
          )),
        )}
      {children}
    </section>
  );
};

export default withNoSSR(Period);
