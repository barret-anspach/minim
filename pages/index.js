import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styled from 'styled-components';
import StavesProvider from '../contexts/useStaves';
import GridProvider from '../contexts/useGrid';
import { sizes } from '../constants/sizes';
import { createGridStaff, createSVGStaff } from '../utils/createStaff';
import { parseGridTemplate } from '../utils/parseGridTemplate';

const gridTemplate = require('../fixtures/gridTemplate.json');

const Wrapper = styled.main`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  background: black;
  color: white;
  font-family: 'overpass mono', monospace;
  padding: 8rem 5rem 13rem 3rem;
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

const Staves = styled.svg.attrs(({ $height }) => ({
  viewBox: `0 0 100 ${$height}`,
  preserveAspectRatio: 'none',
  width: '100%',
  height: `${$height}rem`,
}))`
  position: absolute;
  inset: 0;
  overflow: visible;
  grid-area: system_0_staves_start / system_0_content_start / system_0_staves_end / system_0_content_end;
`;

const Staff = styled.g``;

const Line = styled.line`
  stroke: white;
`;

const GridLine = styled.div`
  width: 100%;
  height: 100%;
  background: white;
`;

const Readouts = styled.footer`
z-index: 2;
position: fixed;
bottom: 0;
transform: translateY(calc(100% - 32px));
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

const GridItem = styled.article``;

export default function Home() {
  const staves = {
    items: [
      {
        id: 0,
        lineCount: 5,
        get spaceCount() {
          return this.lineCount - 1 >= 0 ? this.lineCount - 1 : 0;
        }
      },
      {
        id: 1,
        lineCount: 5,
        get spaceCount() {
          return this.lineCount - 1 >= 0 ? this.lineCount - 1 : 0;
        }
      },
      {
        id: 2,
        lineCount: 5,
        get spaceCount() {
          return this.lineCount - 1 >= 0 ? this.lineCount - 1 : 0;
        }
      },
      {
        id: 3,
        lineCount: 5,
        get spaceCount() {
          return this.lineCount - 1 >= 0 ? this.lineCount - 1 : 0;
        }
      },
    ],
    get lineCount() {
      return this.items.reduce((a, s) => a + s.lineCount, 0);
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

  const pixelRatio = useRef(2);
  const [zoom, setZoom] = useState(18);
  const [scale, setScale] = useState(36);
  const zoomInvariantFontSize = `calc(${sizes.SPACE * 4}mm * (2 / ${pixelRatio.current}))`;

  useEffect(() => {
    let _zoom = (1 / (((window.outerWidth - 10) / window.innerWidth) * 100)) * window.outerWidth;
    pixelRatio.current = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    setZoom(_zoom);
    setScale(_zoom * pixelRatio.current);
  }, []);

  // Calculate values for maintaining invariant stroke/fontSize/whatever size
  // on window resizing and zoom events
  useEffect(() => {
    function getPixelRatio() {
      return window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    }

    function setZoomValue(e) {
      if (pixelRatio.current !== getPixelRatio()) {
        // "zoom" resize event
        pixelRatio.current = getPixelRatio();
        setZoom(getZoomValue());
      } else {
        // normal resize event
        setScale(getZoomValue() * pixelRatio.current);
        pixelRatio.current = scale / getZoomValue();
      }
    }

    function getZoomValue() {
      return (1 / (((window.outerWidth - 10) / window.innerWidth) * 100)) * window.outerWidth;
    }

    window.addEventListener("resize", setZoomValue, false);

    return () => {
      window.removeEventListener("resize", setZoomValue, false);
    }    
  }, [scale, zoom]);

  const grid = {
    style: {
      gridTemplateRows: parseGridTemplate(gridTemplate.style.gridTemplateRows),
      gridTemplateColumns: parseGridTemplate(gridTemplate.style.gridTemplateColumns),
    },
  };

  return (
    <StavesProvider value={staves}>
      <GridProvider value={grid}>
        <Head/>
        <Wrapper>
          <StavesAndGrid $height={staves.height} $gridStyle={grid.style}>
            <Staves $height={staves.height}>
              {
                staves.items.map((staff, staffIndex) => (
                  <Staff key={staff.id}>
                    {createSVGStaff(staffIndex, staff.lineCount, staves, pixelRatio).map((line) => (
                      <Line key={line.id} x1={line.x1} x2={line.x2} y1={line.y} y2={line.y} strokeWidth={line.strokeWidth} />
                    ))}
                  </Staff>
                ))
              }
            </Staves>
            <Grid>
              <GridItem style={{gridArea: 'system_0_staff_0_start / names_start / system_0_staff_0_end / names_end', justifySelf: 'end'}}>Vln.I</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_1_start / names_start / system_0_staff_1_end / names_end', justifySelf: 'end'}}>Vln.II</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_2_start / names_start / system_0_staff_2_end / names_end', justifySelf: 'end'}}>Vla.</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_3_start / names_start / system_0_staff_3_end / names_end', justifySelf: 'end'}}>Vc.</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_1_space_2_start / measure_0_start / system_0_staff_1_space_3_end / measure_0_end'}}>hi</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_0_space_3_start / measure_0_start / system_0_staff_0_space_3_end / measure_0_end', justifySelf: 'center'}}>hello</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_2_space_0_start / measure_0_start / system_0_staff_2_space_0_end / measure_0_end', justifySelf: 'end'}}>how are you?</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_3_space_1_start / measure_0_start / system_0_staff_3_space_2_end / measure_0_end', justifySelf: 'center'}}>Heyo</GridItem>
            </Grid>
          </StavesAndGrid>

          <Readouts $offset={sizes.SPACE_BETWEEN_STAFF_GROUPS}>
            <Readout style={{ fontSize: zoomInvariantFontSize }}>Rows: {grid.style.gridTemplateRows}</Readout>
            <Readout style={{ fontSize: zoomInvariantFontSize }}>Cols: {grid.style.gridTemplateColumns}</Readout>
          </Readouts>
        </Wrapper>
      </GridProvider>
    </StavesProvider>
  )
}
