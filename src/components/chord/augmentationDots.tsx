import { JSX, useMemo } from "react";

import Item from "./../../components/item/index.js";

import styles from "./styles.module.css";
import { Minim } from "./../../types/minim/index.js";
import { cx } from "./../../utils/classNames";

type AugmentationDotsProps = {
  className?: string;
  event: Minim.Event.DecoratedDefaultEvent;
  prefix: string;
  pitch: Minim.Grid.Row;
};

const AugmentationDotGlyph = "";

export default function AugmentationDots({
  className,
  event,
  prefix,
  pitch,
}: AugmentationDotsProps): JSX.Element {
  const dotArray = useMemo(
    () => Array.from({ length: event.duration!.dots || 0 }, (_, i) => i),
    [event.duration],
  );
  const column = useMemo(
    () => `e${(event.position as Minim.Bounds).start}-ste-up`,
    [event.position],
  );

  return event.duration !== undefined &&
    event.duration.dots !== undefined &&
    event.duration.dots > 0 ? (
    <>
      {dotArray.map((dotIndex) => (
        <Item
          data-augmentation-dot
          key={`${prefix}_dot${dotIndex}`}
          className={cx(styles.dot, className)}
          column={column}
          pitch={pitch}
        >
          {AugmentationDotGlyph}
        </Item>
      ))}
    </>
  ) : (
    <></>
  );
}
