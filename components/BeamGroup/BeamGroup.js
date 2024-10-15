import { useMemo } from "react";
import clsx from "clsx";

import Item from "../Item";

import { getBeamGroupStem } from "../../utils/methods";
import styles from "./BeamGroup.module.css";

export function BeamGroup({ beamGroup, prefix }) {
  const { direction, row } = useMemo(
    () => getBeamGroupStem(beamGroup, prefix),
    [beamGroup, prefix],
  );
  const column = useMemo(() => {
    switch (beamGroup[0].beam.clip) {
      case "both": {
        return `${beamGroup[0].beam.start} / ${beamGroup[0].beam.end}`;
      }
      case "start": {
        return direction === "up"
          ? `${beamGroup[0].beam.start} / e${beamGroup.at(-1).position.start}-ste-up`
          : `${beamGroup[0].beam.start} / e${beamGroup.at(-1).position.start}-not`;
      }
      case "end": {
        return direction === "up"
          ? `e${beamGroup[0].position.start}-ste-up / ${beamGroup.at(-1).beam.end}`
          : `e${beamGroup[0].position.start}-not / ${beamGroup.at(-1).beam.end}`;
      }
      case "none":
      default: {
        return direction === "up"
          ? `e${beamGroup[0].position.start}-ste-up / e${beamGroup.at(-1).position.start}-ste-up`
          : `e${beamGroup[0].position.start}-not / e${beamGroup.at(-1).position.start}-not`;
      }
    }
  }, [beamGroup, direction]);

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
