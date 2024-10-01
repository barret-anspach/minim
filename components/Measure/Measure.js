import { useRef } from "react";
import clsx from "clsx";

import Barline from "../Barline";

import { usePosition } from "../../hooks/usePosition";
import useVars from "../../hooks/useVars";
import { withNoSSR } from "../../hooks/withNoSSR";

import styles from "./Measure.module.css";

function Measure({
  children,
  final,
  handleResize,
  initial,
  index,
  measure,
  parts,
  ...rest
}) {
  const ref = useRef(null);
  const { first, last } = usePosition(ref, index);

  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.measure],
    conditionalStyles: [
      { condition: first, operator: "&&", style: styles.first },
      { condition: last, operator: "&&", style: styles.last },
    ],
    key: "--duration",
    value: measure.duration,
  });
  useVars({
    varRef: ref,
    key: "--indent",
    value: index === 0 ? "3rem" : "auto",
  });
  useVars({
    varRef: ref,
    key: "--staves",
    value: parts.reduce((acc, p) => acc + p.global.staves, 0),
  });

  return (
    <section ref={ref} className={clsx(className)} {...rest}>
      {/** Bracket placeholder */}
      {/** TODO: Interpret layout groups */}
      {first && (
        <Barline
          type={"regular"}
          separation={true}
          row={"1 / -1"}
          column={"m-bracket / m-bracket"}
          height="100%"
        />
      )}
      <Barline
        type={"regular"}
        separation={true}
        row={"1 / -1"}
        column={"m-bar / m-cle"}
      />
      {children}
      {last && !final && <Barline column={"me-bar"} />}
      {final && <Barline type={"final"} />}
    </section>
  );
}

export default withNoSSR(Measure);
