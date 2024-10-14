import clsx from "clsx";

import Item from "../Item";

import { getBeamGroupStem } from "../../utils/methods";
import styles from "./BeamGroup.module.css";

export function BeamGroup({ beamGroup, prefix }) {
  const { direction, row } = getBeamGroupStem(beamGroup, prefix);
  let column;
  switch (beamGroup[0].beam.clip) {
    case "both": {
      column = `${beamGroup[0].beam.start} / ${beamGroup[0].beam.end}`;
      break;
    }
    case "start": {
      column =
        direction === "up"
          ? `${beamGroup[0].beam.start} / e${beamGroup.at(-1).position.start}-ste-up`
          : `${beamGroup[0].beam.start} / e${beamGroup.at(-1).position.start}-not`;
      break;
    }
    case "end": {
      column =
        direction === "up"
          ? `e${beamGroup[0].position.start}-ste-up / ${beamGroup.at(-1).beam.end}`
          : `e${beamGroup[0].position.start}-not / ${beamGroup.at(-1).beam.end}`;
      break;
    }
    case "none":
    default: {
      column =
        direction === "up"
          ? `e${beamGroup[0].position.start}-ste-up / e${beamGroup.at(-1).position.start}-ste-up`
          : `e${beamGroup[0].position.start}-not / e${beamGroup.at(-1).position.start}-not`;
    }
  }
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
