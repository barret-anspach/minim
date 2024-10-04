import { useMemo, useRef } from "react";
import clsx from "clsx";

import useVars from "../../hooks/useVars";
import metadata from "./../../public/fonts/bravura/bravura_metadata.json";

import styles from "./Barline.module.css";
import { withNoSSR } from "../../hooks/withNoSSR";

function RegularBarline() {
  return <div className={clsx(styles.line, styles.thinLine)} />;
  // return (
  //   <polyline
  //     points="0,0 0,1"
  //     stroke="currentColor"
  //     strokeWidth={`${metadata.engravingDefaults.thinBarlineThickness / 4}rem`}
  //     vectorEffect={'non-scaling-stroke'}
  //   />
  // );
  // return <rect x={0} y={0} width={1} height={1} />;
}

function FinalBarline() {
  return (
    <>
      <div className={clsx(styles.line, styles.thinLine, styles.separation)} />
      <div className={clsx(styles.line, styles.thickLine)} />
    </>
  );
  // return (
  //   <>
  //     <rect
  //       x={0}
  //       y={0}
  //       width={metadata.engravingDefaults.thinBarlineThickness / 4}
  //       height={1}
  //     />
  //     <rect
  //       x={
  //         (metadata.engravingDefaults.thinBarlineThickness +
  //           metadata.engravingDefaults.barlineSeparation) /
  //         4
  //       }
  //       y={0}
  //       width={metadata.engravingDefaults.thickBarlineThickness / 4}
  //       height={1}
  //     />
  //   </>
  // );
}

function Barline({
  children,
  column,
  row = "1 / -1",
  separation,
  type = "regular",
}) {
  const ref = useRef(null);
  const className = useVars({
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
  const width = useMemo(
    () =>
      type === "final"
        ? `${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4}rem`
        : `${metadata.engravingDefaults.thinBarlineThickness / 4}rem`,
    [type],
  );

  return (
    <div ref={ref} className={clsx(className)}>
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

export default withNoSSR(Barline);
