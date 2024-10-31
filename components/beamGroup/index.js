import { useMemo } from "react";
import clsx from "clsx";

import Item from "../item";

import {
  getBeamGroupStem,
  getSubBeamCountFromBeamEvent,
} from "../../utils/methods";
import styles from "./styles.module.css";

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

  const subBeamCount = (beamEvent) =>
    beamEvent ? getSubBeamCountFromBeamEvent(beamEvent) : 0;

  return (
    <>
      <Item
        className={clsx(styles.beam, {
          [`${styles.below}`]: direction === "down",
        })}
        column={column}
        pitch={row}
      />
      {beamGroup.map(
        (beamEvent) =>
          subBeamCount(beamEvent) > 0 &&
          Array.from({ length: subBeamCount(beamEvent) }, (_, i) => i + 1).map(
            (subBeam) => (
              <Item
                key={`${prefix}_sub${subBeam}`}
                className={styles.beam}
                column={beamEvent.beam.column}
                pitch={getDiatonicTransposition(
                  stem.pitch.start,
                  stem.direction === "up" ? 2 * subBeam : -2 * subBeam,
                )}
              />
            ),
          ),
      )}
    </>
  );
}
