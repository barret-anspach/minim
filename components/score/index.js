"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

import Flow from "../flow";
import Period from "../period";
import Systems from "../systems";

import { withNoSSR } from "../../hooks/withNoSSR";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./styles.module.css";
import Editor from "../Editor";

function Score({ children, className, composition }) {
  const {
    context: { initialized, periods },
  } = useMeasuresContext();
  const periodRefs = useRef([]);
  const [periodPositions, setPeriodPositions] = useState(
    Array.from({ length: Object.keys(periods).length }, (_, i) => i === 0),
  );
  // TODO: using periodPositions to determine which periods are in a given system,
  // we can set flex–basis on periods to "soften" some of flexbox's spacing choices,
  // and even provide a means to customize period spacing.
  const getSystemsFromPeriodPositions = useCallback(
    (positions) => {
      const result = [];
      let i = 0,
        ri = -1;
      for (const period of positions) {
        const value = Object.values(periods)[i];
        if (!!period) {
          ri++;
          result[ri] = [value];
        } else {
          result[ri].push(value);
        }
        i++;
      }
      return result;
    },
    [periods],
  );
  const [systems, setSystems] = useState(
    getSystemsFromPeriodPositions(periodPositions),
  );

  useLayoutEffect(() => {
    function onResize() {
      const observer = new ResizeObserver((entries) => {
        const firstChildOffsetLeft = entries[0].target.offsetLeft;
        const newArr = [...periodPositions];
        for (let i = 0; i < entries.length; i++) {
          newArr[i] = entries[i].target.offsetLeft === firstChildOffsetLeft;
        }
        if (periodPositions.some((p, i) => p !== newArr[i])) {
          setPeriodPositions(newArr);
          setSystems(getSystemsFromPeriodPositions(newArr));
        }
      });

      if (periodRefs.current) {
        periodRefs.current.forEach((ref) => {
          if (ref) {
            observer.observe(ref, {});
          }
        });
      }

      return observer;
    }
    const observer = onResize();
    // Calculate layout/period positions when printing
    window.addEventListener("beforeprint", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("beforeprint", onResize);
    };
  }, [getSystemsFromPeriodPositions, periodPositions]);

  return (
    initialized && (
      <main className={clsx(styles.score, className)} role="main">
        {composition.data && (
          <header className={styles.header}>
            <div className={styles.title}>
              <h1>{composition.data.name}</h1>
            </div>
            <h2>{composition.data.composer}</h2>
          </header>
        )}
        <div className={styles.systems}>
          <Systems id="systems">
            {Object.values(periods).map((period, _, periods) => (
              <Period
                ref={(ref) => (periodRefs.current[period.index] = ref)}
                key={`per${period.index}`}
                index={period.index}
                period={period}
                systemStart={periodPositions[period.index]}
                systemEnd={
                  periodPositions[period.index + 1] ??
                  period.index === periods.length - 1
                }
              >
                {Object.keys(period.flows).map((flowId) => (
                  <Flow
                    key={`per${period.index}_${flowId}`}
                    id={flowId}
                    period={period}
                    systemStart={periodPositions[period.index]}
                    systemEnd={
                      periodPositions[period.index + 1] ??
                      period.index === periods.length - 1
                    }
                  />
                ))}
              </Period>
            ))}
          </Systems>
        </div>
        {children}
        {/* <Editor view={view} setView={handleView} /> */}
      </main>
    )
  );
}

export default withNoSSR(Score);
