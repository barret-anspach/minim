"use client";

import React from "react";

import Systems from "../Systems";

import { withNoSSR } from "../../hooks/withNoSSR";
import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Flow from "../Flow/Flow";
import Barline from "../Barline/Barline";

function Score({ composition }) {
  const {
    context: { initialized, columns, rows, periods },
  } = useMeasuresContext();

  return (
    initialized && (
      <main className={styles.score}>
        <Systems id="systems" columns={columns} rows={rows}>
          {composition.scores.map((score) =>
            score.flows.map((flow) => <Flow key={flow.id} id={flow.id} />),
          )}
          {periods.map((period) => (
            <Barline
              key={`period_${period}`}
              type={"period"}
              column={`e${period}-bar`}
              separation={true}
            />
          ))}
        </Systems>
      </main>
    )
  );
}

export default withNoSSR(Score);
