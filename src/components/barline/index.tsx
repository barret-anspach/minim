import { PropsWithChildren, useMemo } from "react";
import { Properties } from "csstype";

import metadata from "./../../../public/fonts/bravura/bravura_metadata.json";
import { Minim } from "./../../types/minim/index.js";

import styles from "./styles.module.css";
import { cx } from "./../../utils/classNames";

function RegularBarline() {
  return <div className={cx(styles.line, styles.thinLine, styles.margin)} />;
}

function FinalBarline() {
  return (
    <>
      <div className={cx(styles.line, styles.thinLine, styles.separation)} />
      <div className={cx(styles.line, styles.thickLine)} />
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
}: PropsWithChildren<BarlineProps>) {
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
      className={cx(styles.barline, separation && styles.separation, className)}
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
