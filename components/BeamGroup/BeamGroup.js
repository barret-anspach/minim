import clsx from "clsx";

import Item from "../Item";

import { getBeamGroupStem } from "../../utils/methods";
import styles from "./BeamGroup.module.css";

export function BeamGroup({ beamGroup, prefix }) {
  const { direction, row } = getBeamGroupStem(beamGroup, prefix);
  const column =
    direction === "up"
      ? `e${beamGroup[0].position.start}-ste-up / e${beamGroup.at(-1).position.start}-ste-up`
      : `e${beamGroup[0].position.start}-not / e${beamGroup.at(-1).position.start}-not`;
  return (
    <Item
      className={clsx(styles.beam, {
        [`${styles.below}`]: direction === "down",
      })}
      column={column}
      pitch={row}
    />
  );
}

// return (
//   <polyline
//     points="0,0 0,1"
//     stroke="currentColor"
//     strokeWidth={`${metadata.engravingDefaults.thinBarlineThickness / 4}rem`}
//     vectorEffect={'non-scaling-stroke'}
//   />
// );
