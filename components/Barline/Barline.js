import { useRef } from "react";
import clsx from "clsx";

import useVars from "../../hooks/useVars";
import metadata from "./../../public/fonts/bravura/bravura_metadata.json";

import styles from "./Barline.module.css";
import { withNoSSR } from "../../hooks/withNoSSR";

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
  const ref = useRef(null);
  const _className = useVars({
    varRef: ref,
    defaultStyles: [styles.barline],
    conditionalStyles: [
      { condition: separation, operator: "&&", style: styles.separation },
    ],
    key: "--separation",
    value: `${metadata.engravingDefaults.barlineSeparation / 4}rem`,
  });
  useVars({
    varRef: ref,
    key: "--column",
    value: column,
  });
  useVars({
    varRef: ref,
    key: "--row",
    value: row,
  });

  return (
    <div ref={ref} className={clsx(_className, className)}>
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

export default withNoSSR(Barline);
