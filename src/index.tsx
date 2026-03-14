"use client";

import { ComponentProps } from "react";
import View from "./components/view/index.js";
import { MeasuresContextProvider } from "./contexts/MeasuresContext.js";
import type { Minim } from "./types/minim/index.js";
import { cx } from "./utils/classNames.js";

import "./styles/globals.css";

export default function Minim({
  score,
  className,
  ...rest
}: ComponentProps<"main"> & {
  score: Minim.Document.MovementItem;
  className?: string;
}) {
  return (
    <MeasuresContextProvider>
      <View className={cx("minim", className)} score={score} {...rest} />
    </MeasuresContextProvider>
  );
}
