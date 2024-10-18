import { forwardRef, Fragment, useMemo } from "react";
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
import { getColumnsForPeriod } from "../../utils/methods";

import styles from "./Period.module.css";
import { overlap } from "../../utils/getPitches";

const Period = forwardRef(function Period(
  { children, index, period, systemStart, systemEnd },
  ref,
) {
  const {
    context: { flows },
  } = useMeasuresContext();

  const columns = useMemo(
    () =>
      getColumnsForPeriod({ flows: period.flows, end: period.position.end }),
    [period.flows, period.position.end],
  );
  const rows = useMemo(
    () =>
      Object.entries(period.staves)
        .filter(([id, _]) => period.measures[id].length > 0)
        .flatMap(([_, parts]) =>
          overlap(
            Object.values(parts).flatMap((part) => part.staves),
            12,
          ),
        )
        .join(" "),
    [period.measures, period.staves],
  );
  const lefthandBarlineRows = useMemo(
    () =>
      Object.values(flows)
        .reduce(
          (acc, flow) => [
            ...acc,
            flow.layoutGroups
              .filter((group) => period.measures[group.flowId].length > 0)
              .flatMap((group) => group.row),
          ],
          [],
        )
        .flat(),
    [flows, period.measures],
  );
  const style = useMemo(
    () => ({
      "--duration": period.dimensions.length,
      "--indent": index === 0 ? "3rem" : "auto",
      "--rows": rows,
      "--columns": columns,
    }),
    [columns, index, period.dimensions.length, rows],
  );

  return (
    <section
      ref={ref}
      className={clsx(
        styles.period,
        systemStart && styles.first,
        systemEnd && styles.last,
      )}
      style={style}
    >
      {Object.entries(flows).map(([flowId, flow]) =>
        flow.layoutGroups.map((group, groupIndex) => (
          <Fragment key={`${flowId}per${index}grp${groupIndex}_system-start`}>
            {(index === 0 || systemStart) &&
              period.measures[flowId].length > 0 && (
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
                key={`${flowId}per${index}bea${beamGroupIndex}`}
                beamGroup={beamGroup}
                prefix={`${flowId}p${beamGroup[0].partIndex}`}
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
                    pitch={`${id}p${part.partIndex}s${staffIndex + 1}${staffBounds.upper.id}/${id}p${part.partIndex}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                  >
                    {part.name}
                  </Item>
                )}
                {systemStart &&
                  period.index !== 0 &&
                  staffIndex === 0 &&
                  period.measures[id].length > 0 && (
                    <Item
                      className={styles.partLabel}
                      column={`e${period.position.start}-text`}
                      pitch={`${id}p${part.partIndex}s${staffIndex + 1}${staffBounds.upper.id}/${id}p${part.partIndex}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                    >
                      {part.shortName}
                    </Item>
                  )}
                {period.measures[id].length > 0 && (
                  <Staff
                    id={`${id}p${part.partIndex}s${staffIndex + 1}`}
                    key={`${id}p${part.partIndex}s${staffIndex + 1}`}
                    pitches={pitches}
                    rangeClef={rangeClef}
                    staffBounds={staffBounds}
                    start={`e${period.position.start}-bar`}
                    end={
                      period.measures[id].find((m) => m.periodBounds.lastInFlow)
                        ? `e${period.measures[id].find((m) => m.periodBounds.lastInFlow).position.end}-cle`
                        : `e${period.position.end}-end`
                    }
                  />
                )}
                {clef && systemStart && period.measures[id].length > 0 && (
                  <Clef
                    id={`${id}p${part.partIndex}s${staffIndex + 1}`}
                    clef={clef.clef}
                    column={`e${period.position.start}-cle`}
                  />
                )}
                {period.key[id] && systemStart && (
                  <Key
                    id={`${id}p${part.partIndex}s${staffIndex + 1}`}
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
                            id={`${id}p${part.partIndex}s${staffIndex + 1}`}
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
                              id={`${id}p${part.partIndex}s${staffIndex + 1}`}
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
              {((group.position === "end" &&
                systemEnd &&
                group.barline.type !== "final") ||
                group.barline.type === "final" ||
                group.position === "start") && (
                <Barline
                  key={`${index}_grp${groupIndex}_bar`}
                  type={group.barline.type}
                  column={
                    group.position === "end" &&
                    systemEnd &&
                    group.barline.type !== "final"
                      ? group.barline.columnLastInSystem
                      : group.barline.column
                  }
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
});

export default Period;
