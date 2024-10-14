"use client";

import React, { useCallback, useEffect, useState } from "react";

import Systems from "../Systems";

import { withNoSSR } from "../../hooks/withNoSSR";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Flow from "../Flow/Flow";
import Period from "../Period/Period";

function Score() {
  const {
    context: { initialized, periods },
  } = useMeasuresContext();
  const [periodPositions, setPeriodPositions] = useState(
    Array.from({ length: Object.keys(periods).length }, (_, i) => i === 0),
  );

  const handlePosition = useCallback(({ index, first }) => {
    setPeriodPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = first;
      return newPositions;
    });
  }, []);

  return (
    initialized && (
      <main className={styles.score}>
        <Systems id="systems">
          {Object.values(periods).map((period, periods) => (
            <Period
              key={`per${period.position.start}`}
              index={period.index}
              period={period}
              handlePosition={handlePosition}
              first={periodPositions[period.index]}
              last={
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
