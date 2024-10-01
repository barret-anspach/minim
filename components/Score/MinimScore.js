"use client";

import React from "react";

import Systems from "./../Systems";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Score from "./Score";

function MinimScore({ composition }) {
  const {
    context: { initialized },
  } = useMeasuresContext();

  return (
    initialized && (
      <main className={styles.score}>
        <Systems id="systems">
          {composition.scores.map((score) =>
            score.flows.map((flow) => <Score key={flow.id} score={flow} />),
          )}
        </Systems>
      </main>
    )
  );
}

export default withNoSSR(MinimScore);
