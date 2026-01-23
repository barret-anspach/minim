"use client";

import clsx from "clsx";
import { ComponentProps, useEffect } from "react";

import Score from "./../../components/score/index.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";
import { Minim } from "./../../types/minim/index.js";

import styles from "./../../styles/styles.module.css";

type Props = ComponentProps<"main"> & {
  score: Minim.Document.MovementItem;
};

export default function View({ className, score, ...rest }: Props) {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    score.content.forEach((flow, flowIndex) => {
      actions.setFlow({ flow, flowIndex });
      actions.setPeriods();
    });
  }, [actions, score.content]);

  return (
    <Score
      className={clsx("minim", styles.score, styles.musicFont, className)}
      {...rest}
    />
  );
}
