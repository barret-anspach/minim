"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useMeasuresContext } from "../contexts/MeasuresContext";

const Score = dynamic(() => import("../components/score"), { ssr: false });
import score from "../fixtures/scores/minim-score-test.json";

export default function Minim() {
  const { actions } = useMeasuresContext();
  useEffect(() => {
    score.documents.forEach((document) =>
      document.movements.forEach((movement) =>
        movement.content.forEach((flow) => {
          actions.setFlow({ flow });
          actions.setPeriods();
        }),
      ),
    );
  }, [actions]);

  return (
    <>
      <Head>
        <title>
          {/* TODO: How to handle page title? */}
          {score.documents[0].metadata.name}:{" "}
          {score.documents[0].movements[0].metadata.name}
        </title>
      </Head>
      {score.documents.map((document) =>
        document.movements.map((movement) => (
          <Score
            key={`${document.id}_${movement.id}`}
            compositionMetadata={document.metadata}
            movementMetadata={movement.metadata}
          />
        )),
      )}
    </>
  );
}
