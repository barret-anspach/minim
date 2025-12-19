"use client";

import { ComponentProps } from "react";
import View from "./components/view/index.js";
import { MeasuresContextProvider } from "./contexts/MeasuresContext.js";
import type { Minim } from "./types/minim/index.js";

import "./styles/globals.css";
import clsx from "clsx";

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
      <View className={clsx("minim", className)} score={score} {...rest} />
    </MeasuresContextProvider>
  );
}
