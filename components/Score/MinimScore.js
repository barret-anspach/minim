"use client";

import React from "react";

import Systems from "./../Systems";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Flow from "./../Flow/Flow";

function MinimScore({ composition }) {
  const {
    context: { initialized, columns, rows },
  } = useMeasuresContext();

  return (
    initialized && (
      <main className={styles.score}>
        <Systems id="systems" columns={columns} rows={rows}>
          {composition.scores.map((score) =>
            score.flows.map((flow) => <Flow key={flow.id} id={flow.id} />),
          )}
        </Systems>
      </main>
    )
  );
}

export default withNoSSR(MinimScore);
