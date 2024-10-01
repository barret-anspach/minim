"use client";

import React from "react";

import Systems from "./../Systems";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { MeasuresContextProvider } from "./../../contexts/MeasuresContext";

import styles from "./Score.module.css";
import Score from "./Score";

function MinimScore({ composition }) {
  return (
    <main className={styles.score}>
      {composition.scores.map((score) =>
        score.flows.map((flow) => (
          <MeasuresContextProvider key={flow.id}>
            <Systems key={flow.id} id={`${flow.id}_systems`}>
              <Score key={flow.id} score={flow} />
            </Systems>
          </MeasuresContextProvider>
        )),
      )}
    </main>
  );
}

export default withNoSSR(MinimScore);
