"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useMeasuresContext } from "../contexts/MeasuresContext";

const Score = dynamic(() => import("../components/score"), { ssr: false });
import score from "../fixtures/scores/minim-score-test.json";
import styles from "./styles.module.css";
import { bravura } from "../utils/fonts";
import clsx from "clsx";

export default function Minim() {
  const { actions } = useMeasuresContext();
  useEffect(() => {
    score.documents.forEach((document) =>
      document.movements.forEach((movement) =>
        movement.content.forEach((flow) => {
          actions.setFlow({ flow });
          actions.setPeriods();
          // TODO: register each document and movement,
          // and provide a means for the user to navigate
          // among them.
        }),
      ),
    );
  }, [actions]);

  return (
    <>
      <Head>
        {/* TODO: How to handle page title? */}
        <meta
          property="og.title"
          key="title"
          content={`${score.documents[0].metadata.name}:${" "}
          ${score.documents[0].movements[0].metadata.name}`}
        />
      </Head>
      {score.documents.map((document) =>
        document.movements.map((movement) => (
          <div key={`${document.id}_${movement.id}`} className={styles.grid}>
            {/* <nav className={styles.nav}>This is the nav.</nav> */}
            {/* <div className={styles.textarea}>
              Editor input and intermediate renderer go here
            </div> */}
            {/* <textarea className={styles.textarea} /> */}
            <Score
              className={clsx(styles.score, bravura.className)}
              compositionMetadata={document.metadata}
              movementMetadata={movement.metadata}
            />
          </div>
        )),
      )}
    </>
  );
}
