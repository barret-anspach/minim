"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

import Systems from "../Systems";

import { withNoSSR } from "../../hooks/withNoSSR";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Flow from "../Flow/Flow";
import Period from "../Period/Period";

function Score({ composition }) {
  const {
    context: { initialized, periods },
  } = useMeasuresContext();
  const periodRefs = useRef([]);
  const [periodPositions, setPeriodPositions] = useState(
    Array.from({ length: Object.keys(periods).length }, (_, i) => i === 0),
  );

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const firstChildOffsetLeft = entries[0].target.offsetLeft;
      const newArr = [...periodPositions];
      for (let i = 0; i < entries.length; i++) {
        newArr[i] = entries[i].target.offsetLeft === firstChildOffsetLeft;
      }
      setPeriodPositions(newArr);
    });

    if (periodRefs.current) {
      periodRefs.current.forEach((ref) => {
        if (ref) {
          observer.observe(ref, {});
        }
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [periodPositions]);

  return (
    initialized && (
      <main className={styles.score}>
        {composition.data && (
          <header className={styles.header}>
            <div className={styles.title}>
              <h1>{composition.data.name}</h1>
            </div>
            <h2>{composition.data.composer}</h2>
          </header>
        )}
        <Systems id="systems">
          {Object.values(periods).map((period, _, periods) => (
            <Period
              ref={(ref) => (periodRefs.current[period.index] = ref)}
              key={`per${period.position.start}`}
              index={period.index}
              period={period}
              systemStart={periodPositions[period.index]}
              systemEnd={
                periodPositions[period.index + 1] ??
                period.index === periods.length - 1
              }
            >
              {Object.entries(period.flows).map(([flowId, flow]) => (
                <Flow
                  key={`per${period.index}_${flowId}`}
                  id={flowId}
                  period={period}
                  periods={periods}
                  periodFlow={flow}
                />
              ))}
            </Period>
          ))}
        </Systems>
      </main>
    )
  );
}

export default withNoSSR(Score);
