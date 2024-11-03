import { useMemo } from "react";

import Item from "../item";

import { getRestGlyph } from "../../utils/methods";
import AugmentationDots from "../chord/augmentationDots";

export default function Rest({ event, id }) {
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
  return event.rest && event.display !== "none" ? (
    <>
      <Item key={key} column={column} pitch={pitch}>
        {getRestGlyph(event.duration.base)}
      </Item>
      <AugmentationDots event={event} prefix={key} pitch={pitch} />
    </>
  ) : null;
}
