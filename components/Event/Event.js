import React from 'react';
import { useGrid, useZoom } from '../../hooks';

import Glyph from '../Glyph/Glyph';

export default function Event({ event }) {
  const { actions: { getTemplateColumn, getTemplateRow } } = useGrid();
  const { zoomInvariantFontSize } = useZoom();

  return (
    <span
      style={{
        fontFamily: 'Bravura, sans-serif',
        fontSize: '4rem', 
        gridColumn: getTemplateColumn(event), 
        gridRow: getTemplateRow(event)
      }}>
      {event.value}
    </span>
  )
}
