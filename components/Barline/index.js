import { useMemo } from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

import metadata from "../../public/fonts/bravura/bravura_metadata.json";

function RegularBarline({ type }) {
  return (
    <div
      className={clsx(styles.line, styles.thinLine, styles.margin, {
        [`${styles.period}`]: type === "period",
      })}
    />
  );
}

function FinalBarline() {
  return (
    <>
      <div className={clsx(styles.line, styles.thinLine, styles.separation)} />
      <div className={clsx(styles.line, styles.thickLine)} />
    </>
  );
}

function Barline({
  children,
  className = null,
  column,
  row = "1 / -1",
  separation,
  type = "regular",
}) {
  const style = useMemo(
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
        <RegularBarline type={type} />
      )}
    </div>
  );
}

export default Barline;
