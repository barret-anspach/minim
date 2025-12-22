import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import { getRestGlyph } from "./../../utils/methods.js";
import AugmentationDots from "./../../components/chord/augmentationDots.js";

import { Minim } from "./../../types/minim/index.js";
// import Duration from "../duration/index.js";

type Props = {
  event: Omit<Minim.Event.DecoratedDefaultEvent, "position"> & {
    position: Minim.Bounds;
  };
  id: string;
};

export default function Rest({ event, id }: Props) {
  const key = useMemo(() => `${id}_res`, [id]);
  const column = useMemo(
    () => `e${event.position.start}-not`,
    [event.position.start],
  );
  // TODO: Calculate Rest position
  const pitch = useMemo(
    () => `${event.flowId}s${event.staff}b4`,
    [event.flowId, event.staff],
  );
  return event.rest && event.display !== "none" && event.duration ? (
    <>
      {/* <Duration
        data-rest-duration
        column={column}
        event={event}
        id={`${id}_dur`}
        noteIndex={event.position.start}
        pitchPrefix={pitch}
      /> */}
      <Item data-rest key={key} column={column} pitch={pitch}>
        {getRestGlyph(event.duration.base)}
      </Item>
      <AugmentationDots event={event} prefix={key} pitch={pitch} />
    </>
  ) : null;
}
