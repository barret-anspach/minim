import React from 'react';
import { useGrid, useZoom } from '../../hooks';

export default function Event({ event }) {
  const { actions: { getTemplateColumn, getTemplateRow } } = useGrid();
  const { zoomInvariantFontSize } = useZoom();

  return (
    <span
      style={{
        fontSize: zoomInvariantFontSize, 
        gridColumn: getTemplateColumn(event), 
        gridRow: getTemplateRow(event)
      }}>
      {event.value}
    </span>
  )
}
