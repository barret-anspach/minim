import Item from "../Item"
import StaffDisplayItem from "../StaffDisplayItem"

export default function Meter({ type = "regular", count, unit, start = "m-tim" }) {
  switch (type) {
    case "regular":
    default: {
      return (
        <StaffDisplayItem type="tim" start={start}>
          <Item text pitch="b4">{count}</Item>
          <Item text pitch="e4">{unit}</Item>
        </StaffDisplayItem>
      )
    }
  }
}