import React, { Fragment, useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import styled, { css } from 'styled-components';

import StavesProvider from '../contexts/useStavesContext';
import GridProvider from '../contexts/useGridContext';

import { parseGridTemplate } from '../utils/parseGridTemplate';
import { useStaves, useZoom } from '../hooks';

import Event from '../components/Event';

const gridTemplate = require('../fixtures/gridTemplate.json');
const score = require('../fixtures/scoreExample.json');

const Wrapper = styled.main`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  background: black;
  color: white;
  font-family: 'overpass mono', monospace;
  ${({ $getZoomInvariantValue }) => `
    padding: ${$getZoomInvariantValue(8)}mm ${$getZoomInvariantValue(5)}mm ${$getZoomInvariantValue(13)}mm ${$getZoomInvariantValue(3)}mm;
  `}
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

const StavesAndGrid = styled.article`
  position: relative;
  display: grid;
  place-items: center start;
  width: 100%;
  height: ${({ $height }) => $height}rem;
  ${({ $gridStyle }) => $gridStyle};
`;

// TODO: $width in SVG coords needs to be standardized ... ?
const System = styled.svg.attrs(({ $width, $height, $duration = $width, $getZoomInvariantValue, }) => ({
  viewBox: `0 0 ${$duration - $getZoomInvariantValue(8)} ${$height}`,
  preserveAspectRatio: 'none',
  width: '100%',
  height: $height,
}))`
  position: absolute;
  inset: 0;
  overflow: visible;
  grid-area: system_0_staves_start / system_0_content_start / system_0_staves_end / system_0_content_end;
`;

const lineStyle = css`
  stroke: white;
  stroke-linecap: square;
`;

const Line = styled.line`
  ${lineStyle}
`;

const Barline = styled.line`
  ${lineStyle}
  ${({ $strokeWidth }) => `
    stroke-width: ${$strokeWidth};
  `}
`;

const Readouts = styled.footer`
z-index: 2;
position: fixed;
bottom: 0;
${({ $offset }) => `
  padding: ${$offset}rem; 
`}
background: black;
transition: transform 0.32s ease-out;
&:hover {
  transform: translateY(0);
}
`;

const Readout = styled.p`
  margin: 0;
`;

const GridWrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: visible;
`;

const Grid = styled.section`
  display: contents;
`;

const GridItem = styled.article`
  position: relative;
  display: inline;
`;

const ZoomData = styled.aside`
  background: yellow;
  color: black;
  padding: 1mm;
  position: fixed;
  top: 1mm;
  left: 1mm;
`;

export default function Home() {
  const { getZoomInvariantValue, pixelRatio, strokeWidth, width, zoomInvariantFontSize } = useZoom();

  const { staves, createSVGStaff } = useStaves({ score });

  const grid = {
    style: {
      gridTemplateRows: parseGridTemplate(gridTemplate.style.gridTemplateRows),
      gridTemplateColumns: parseGridTemplate(gridTemplate.style.gridTemplateColumns),
    },
  };

  return (
    <StavesProvider value={staves}>
      <GridProvider value={grid}>
        <Head />
        <Wrapper $getZoomInvariantValue={getZoomInvariantValue}>
        {pixelRatio && strokeWidth && width ? (
              <ZoomData style={{fontSize: zoomInvariantFontSize}}>
                <pre>Pixel Ratio: {pixelRatio}</pre>
                <pre>Stroke Width: {strokeWidth}</pre>
                <pre>Width: {width}</pre>
              </ZoomData>
            ) : null}
          <StavesAndGrid $height={staves.height} $gridStyle={grid.style}>
            <System $width={width} $height={staves.height} $gridStyle={grid.style} $getZoomInvariantValue={getZoomInvariantValue}>
              {
                staves.items.map((staff, index) => (
                  <Fragment key={staff.id}>
                    {
                      createSVGStaff({ index, staff })
                        .map((line) => (
                          <Line key={line.id} x1={line.x1} x2={line.x2} y1={`${line.y}rem`} y2={`${line.y}rem`} strokeWidth={line.strokeWidth} />
                        ))
                    }
                  </Fragment>
                ))
              }
              <Barline x1={0} x2={0} y1={0} y2={`${staves.height}rem`} $strokeWidth={strokeWidth} />
              <Barline x1={'100%'} x2={'100%'} y1={0} y2={`${staves.height}rem`} $strokeWidth={strokeWidth} />
            </System>
            {
              score.eventData.map((event, eventIndex) => (
                <Event key={`event_${eventIndex}`} event={event} />
              ))
            }
          </StavesAndGrid>
        </Wrapper>
      </GridProvider>
    </StavesProvider>
  )
}
