import { useMemo } from 'react';

import { useZoom } from './../hooks';
import { sizes } from '../constants/sizes';

export default function useStaves({ score }) {
  const { pixelRatio, strokeWidth } = useZoom();

  return useMemo(() => {
    const staves = {
      items: score.displayData
        .filter(displayItem => displayItem.type === 'staff')
        .map(staff => ({
          ...staff,
          spaceCount: staff.attributes.lineCount - 1 >= 0 ? staff.attributes.lineCount - 1 : 0,
        })),
      get lineCount() {
        return this.items.reduce((a, s) => a + s.attributes.lineCount, 0);
      },
      get spaceCount() {
        return this.items.reduce((a, s) => a + s.spaceCount, 0);
      },
      get spacing() {
        return this.items.map((_, i) => i > 0 ? sizes.SPACE_BETWEEN_STAFF_GROUPS : 0);
      },
      get height() {
        return (
          (sizes.SPACE * this.spaceCount) + this.spacing.reduce((a, c) => a + c, 0)
        ).toFixed(1);
      },
    };

    const createSVGStaff = function ({ index = 0, staff = { attributes: { lineCount: 0 } } }) {
      // How many staff lines (and spaces) previous to this staff do we need to account for?
      const offset = staves.items.reduce((a, s, i) => {
        if (index - 1 >= 0 && i <= (index - 1)) {
          return a + ((s.lineCount - 1) * sizes.SPACE) + staves.spacing[index]
        } else {
          return a
        }
      }, 0);
      return Array(staff.attributes.lineCount).fill().map((_, lineIndex) => (
        {
          id: `staff_${index}_line_${lineIndex}`,
          y: (offset + lineIndex).toFixed(1),
          x1: 0,
          x2: '100%',
          strokeWidth: strokeWidth,
        }
      ));
    };
    
    return {
      staves,
      createSVGStaff,
    };
  }, [score.displayData, pixelRatio]);
}