import React, { useMemo } from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

import metadata from "../../public/fonts/bravura/bravura_metadata.json";
import { Minim } from "../../types/minim";
import { Properties } from "csstype";

function RegularBarline() {
  return <div className={clsx(styles.line, styles.thinLine, styles.margin)} />;
}

function FinalBarline() {
  return (
    <>
      <div className={clsx(styles.line, styles.thinLine, styles.separation)} />
      <div className={clsx(styles.line, styles.thickLine)} />
    </>
  );
}

type BarlineProps = Omit<Minim.Defs.Barline, "columnLastInSystem" | "final"> & {
  className?: string;
};

function Barline({
  children,
  className = undefined,
  column,
  row = "1 / -1",
  separation,
  type = "regular",
}: React.PropsWithChildren<BarlineProps>) {
  const style: Properties = useMemo(
    () => ({
      "--separation": `${metadata.engravingDefaults.barlineSeparation / 4}rem`,
      "--column": column,
      "--row": row,
    }),
    [column, row],
  );

  return (
    <div
      className={clsx(
        styles.barline,
        separation && styles.separation,
        className,
      )}
      style={style}
    >
      {children ? (
        children
      ) : type === "final" ? (
        <FinalBarline />
      ) : (
        <RegularBarline />
      )}
    </div>
  );
}

export default Barline;
