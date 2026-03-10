"use client";

import { ComponentProps, useEffect } from "react";

import Score from "./../../components/score/index.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";
import { Minim } from "./../../types/minim/index.js";

import styles from "./../../styles/styles.module.css";
import { cx } from "./../../utils/classNames";

type Props = ComponentProps<"main"> & {
  score: Minim.Document.MovementItem;
};

export default function View({ className, score, ...rest }: Props) {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    if (score.content) {
      score.content.forEach((flow) => {
        actions.setFlow({ flow });
        actions.setPeriods();
      });
    } else {
      actions.reset();
    }

    return () => {
      actions.reset();
    };
  }, [actions, score.content]);

  return (
    <Score
      className={cx(styles.score, styles.musicFont, className)}
      {...rest}
    />
  );
}
