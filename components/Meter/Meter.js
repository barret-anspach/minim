import { usePitches } from "../../hooks/usePitches";
import Item from "../Item";
import StaffDisplayItem from "../StaffDisplayItem";

export default function Meter({
  type = "regular",
  clef,
  count,
  unit,
  start = "m-tim",
}) {
  const style = usePitches(clef);

  switch (type) {
    case "regular":
    default: {
      return (
        <StaffDisplayItem type="tim" start={start}>
          <Item text pitch={style.rangeClef.midline}>
            {count}
          </Item>
          <Item text pitch={style.staffBounds.lower.id}>
            {unit}
          </Item>
        </StaffDisplayItem>
      );
    }
  }
}
