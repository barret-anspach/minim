import clsx from "clsx";
import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import {
  getBeamGroupStem,
  getDiatonicTransposition,
  getSubBeamCountFromBeamEvent,
} from "./../../utils/methods.js";
import { Minim } from "./../../types/minim/index.js";

import styles from "./styles.module.css";

type BeamGroupProps = {
  beamGroup: Minim.Event.BeamGroup;
  prefix?: string;
};

export function BeamGroup({ beamGroup, prefix }: BeamGroupProps) {
  const { direction, pitch, row } = useMemo(
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
          ? `${beamGroup[0].beam.start} / e${(beamGroup.at(-1)!.position as Minim.Bounds).start}-ste-up`
          : `${beamGroup[0].beam.start} / e${(beamGroup.at(-1)!.position as Minim.Bounds).start}-not`;
      }
      case "end": {
        return direction === "up"
          ? `e${(beamGroup[0].position as Minim.Bounds).start}-ste-up / ${beamGroup.at(-1)!.beam.end}`
          : `e${(beamGroup[0].position as Minim.Bounds).start}-not / ${beamGroup.at(-1)!.beam.end}`;
      }
      case "none":
      default: {
        return direction === "up"
          ? `e${(beamGroup[0].position as Minim.Bounds).start}-ste-up / e${(beamGroup.at(-1)!.position as Minim.Bounds).start}-ste-up`
          : `e${(beamGroup[0].position as Minim.Bounds).start}-not / e${(beamGroup.at(-1)!.position as Minim.Bounds).start}-not`;
      }
    }
  }, [beamGroup, direction]);

  const subBeamCount = (beamEvent: Minim.Event.BeamedEventItem) =>
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
                column={column}
                pitch={getDiatonicTransposition(
                  pitch,
                  direction === "up" ? -2 * subBeam : 2 * subBeam,
                )}
              />
            ),
          ),
      )}
    </>
  );
}
