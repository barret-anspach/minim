import {
  ForwardedRef,
  forwardRef,
  Fragment,
  PropsWithChildren,
  useMemo,
} from "react";
import clsx from "clsx";

import Barline from "./../../components/barline/index.js";
import { BeamGroup } from "./../../components/beamGroup/index.js";
import Bracket from "./../../components/bracket/index.js";
import Clef from "./../../components/clef/index.js";
import Item from "./../../components/item/index.js";
import Key from "./../../components/key/index.js";
import Meter from "./../../components/meter/index.js";
import Staff from "./../../components/staff/index.js";
import Tempo from "./../../components/tempo/index.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";
import { overlapStaffRows } from "./../../utils/getPitches.js";
import { getColumnsForPeriod } from "./../../utils/methods.js";

import { Minim } from "./../../types/minim/index.js";

import styles from "./styles.module.css";

type PeriodProps = {
  index: Minim.Defs.Index;
  period: Minim.Period.PeriodItem;
  systemStart: boolean;
  systemEnd: boolean;
};

const Period = forwardRef<HTMLDivElement, PropsWithChildren<PeriodProps>>(
  function Period(
    {
      children,
      index,
      period,
      systemStart,
      systemEnd,
    }: PropsWithChildren<PeriodProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const {
      context: { flows },
    } = useMeasuresContext();

    // final is true if all measures in a period are last in their flow,
    // OR only one flow is remaining and it's last in its flow.
    // TODO: move to setPeriods?
    const final =
      (Object.values(period.measures).every((mm) => mm.length > 0) &&
        Object.values(period.measures)
          .flat()
          .every((m) => m.periodBounds?.lastInFlow)) ||
      (Object.values(period.measures).reduce(
        (acc, mm) => acc + mm.length,
        0,
      ) === 1 &&
        Object.values(period.measures)
          .filter((mm) => mm.length > 0)
          .flat()
          .some((m) => m.periodBounds?.lastInFlow));
    const columns = useMemo(
      () =>
        getColumnsForPeriod({
          flows: period.flows,
          end: period.position.end,
          final,
        }),
      [final, period.flows, period.position.end],
    );
    const rows = useMemo(
      () =>
        overlapStaffRows(
          Object.entries(period.staves)
            .filter(([id]) => period.measures[id].length > 0)
            .flatMap((staffMap) =>
              Object.values(staffMap[1]).flatMap((part) => part.staves),
            ),
        ),
      [period.measures, period.staves],
    );
    const systemBarlineRows = useMemo(
      () =>
        Object.values(flows as Minim.Collection<Minim.Component.Flow>)
          .reduce(
            (acc, flow) => [
              ...acc,
              flow.layoutGroups
                .filter((group) => period.measures[group.flowId].length > 0)
                .flatMap((group) => group.row),
            ],
            [] as Minim.Grid.Row[][],
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
                  row={`${systemBarlineRows[0]}/${systemBarlineRows.at(-1)}`}
                  separation={true}
                />
              )}
              {/* <Barline
              type={"period"}
              column={`e${period.position.start}-bar`}
              row={`${systemBarlineRows[0]}/${systemBarlineRows.at(-1)}`}
              separation={true}
            /> */}
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
            staves.map(({ clef, rangeClef, staffIndex, staffBounds }) => (
              <Fragment key={`${id}s${staffIndex + 1}_items`}>
                {period.index === 0 && staffIndex === 0 && (
                  <Item
                    className={styles.partLabel}
                    column={`e0-text`}
                    pitch={`${id}p${part.partIndex}s${staffIndex + 1}${staffBounds!.upper.id} /
                      ${id}p${part.partIndex}s${staves.length}${staves[staves.length - 1].staffBounds!.lower.id}`}
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
                      pitch={`${id}p${part.partIndex}s${staffIndex + 1}${staffBounds!.upper.id} /
                        ${id}p${part.partIndex}s${staves.length}${staves[staves.length - 1].staffBounds!.lower.id}`}
                    >
                      {part.shortName}
                    </Item>
                  )}
                {period.measures[id].length > 0 && (
                  <Staff
                    id={`${id}p${part.partIndex}s${staffIndex + 1}`}
                    key={`${id}p${part.partIndex}s${staffIndex + 1}`}
                    rangeClef={rangeClef}
                    staffBounds={staffBounds}
                    start={`e${period.position.start}-bar`}
                    end={
                      period.measures[id].find(
                        (m) => m.periodBounds?.lastInFlow,
                      )
                        ? `e${period.measures[id].find((m) => m.periodBounds?.lastInFlow)!.position.end}-bar-end`
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
                    clefType={rangeClef!.type}
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
                        {event.key &&
                          (event.eventType === "measureStart" ||
                            (event.eventType === "measureEnd" &&
                              systemEnd)) && (
                            <Key
                              id={`${id}p${part.partIndex}s${staffIndex + 1}`}
                              clefType={rangeClef!.type}
                              column={event.key.column}
                              fifths={event.key.fifths}
                              prevFifths={event.key.prevFifths.fifths}
                            />
                          )}
                        {event.tempos &&
                          // TODO: this isn't quite right; tempo markings are displayed on certain staves in a score,
                          // should be driven by layout not staffIndex 0
                          staffIndex === 0 &&
                          event.tempos.map((tempo, tempoIndex) => (
                            <Tempo
                              key={`${id}p${part.partIndex}s${staffIndex + 1}tempo${tempoIndex}`}
                              id={`${id}p${part.partIndex}s${staffIndex + 1}tempo${tempoIndex}`}
                              beat={tempo.column}
                              pitch={`${id}p${part.partIndex}s${staffIndex + 1}-tempo`}
                              tempo={tempo}
                            />
                          ))}
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
            )),
          ),
        )}
        {period.layoutEvents &&
          period.layoutEvents.map((layout, leIndex) =>
            layout.layoutGroups.map((group, groupIndex) => (
              <Fragment key={`${index}le${leIndex}lg${groupIndex}`}>
                {((group.position === "end" &&
                  systemEnd &&
                  group.barline.type !== "final") ||
                  group.barline.type === "final" ||
                  group.position === "start") && (
                  <Barline
                    key={`${index}_grp${groupIndex}_bar`}
                    type={group.barline.type}
                    column={
                      group.position === "end" && systemEnd
                        ? group.barline.type === "final"
                          ? group.barline.column
                          : group.barline.columnLastInSystem
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
  },
);

export default Period;
