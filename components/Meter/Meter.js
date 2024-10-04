import { getPitches } from "../../utils/getPitches";
import Item from "../Item";
import StaffDisplayItem from "../StaffDisplayItem";

export default function Meter({
  type = "regular",
  clef,
  count,
  id,
  unit,
  start = "m-tim",
}) {
  const style = getPitches(clef);

  switch (type) {
    case "regular":
    default: {
      return (
        <StaffDisplayItem type="tim" start={start}>
          <Item text pitch={`${id}${style.rangeClef.midline}`}>
            {count}
          </Item>
          <Item text pitch={`${id}${style.staffBounds.lower.id}`}>
            {unit}
          </Item>
        </StaffDisplayItem>
      );
    }
  }
}
