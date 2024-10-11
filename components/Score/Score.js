"use client";

import React from "react";

import Systems from "../Systems";

import { withNoSSR } from "../../hooks/withNoSSR";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Flow from "../Flow/Flow";
import Barline from "../Barline/Barline";
import Measure from "../Measure/Measure";

function Score({ composition }) {
  const {
    context: { initialized, periods },
  } = useMeasuresContext();

  return (
    initialized && (
      <main className={styles.score}>
        <Systems id="systems">
          {Object.values(periods).map((period, periodIndex, periods) => (
            <Measure
              key={`measure_${period.position.start}`}
              index={period.index}
              measure={period}
              measureIndex={periodIndex}
              measures={periods}
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
            </Measure>
          ))}
          {/* {composition.scores.map((score) =>
            score.flows.map((flow) => <Flow key={flow.id} id={flow.id} />),
          )} */}
        </Systems>
      </main>
    )
  );
}

export default withNoSSR(Score);
