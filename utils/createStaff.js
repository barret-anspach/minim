import { sizes } from "../constants/sizes";

export const createSVGStaff = (staffIndex, lineCount, staves, pixelRatio) => {
  // How many staff lines (and spaces) previous to this staff do we need to account for?
  const offset = staves.items.reduce((a, s, i) => {
    if (staffIndex - 1 >= 0 && i <= staffIndex - 1) {
      return a + (s.lineCount - 1) * sizes.SPACE + staves.spacing[staffIndex];
    } else {
      return a;
    }
  }, 0);
  return Array(lineCount)
    .fill()
    .map((_, index) => ({
      id: `staff_${staffIndex}_line_${index}`,
      y: (offset + index).toFixed(1),
      x1: 0,
      x2: "100%",
      strokeWidth: sizes.STAFF_LINE_STROKE_WIDTH * (2 / pixelRatio.current),
    }));
};
