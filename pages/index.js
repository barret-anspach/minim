import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styled from 'styled-components';
import StavesProvider from '../contexts/useStaves';
import GridProvider from '../contexts/useGrid';
const gridTemplate = require('../fixtures/gridTemplate.json');

// size enums
const sizes = {
  SPACE: 1,
  SPACE_BETWEEN_STAVES: 3 / 2,
  SPACE_BETWEEN_STAFF_GROUPS: 16 / 5,
  STAFF_LINE_STROKE_WIDTH: 0.1,
};

const Wrapper = styled.main`
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
  viewBox: `0 0 1 ${$height}`,
  preserveAspectRatio: 'none',
  width: '100%',
  height: `${$height}rem`,
}))`
  inset: 0;
  overflow: visible;
  grid-area: system_0_staves_start / system_0_content_start / system_0_staves_end / system_0_content_end;
`;

const Staff = styled.g``;

const Line = styled.line`
  stroke: white;
`;

const Readouts = styled.footer`
  margin-top: ${({ $offset }) => $offset}rem;
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
  position: relative;
  display: contents;
`;

const GridItem = styled.article``;

const parseGridTemplate = (input) => {
  let output = "[";
  const fn = (arr) => {
    return arr.map((object) => {
      if (object.children) {
        return ` ${object.name}_start ${fn(object.children)} ${object.name}_end `;
      } else {
        return ` ${object.name}_start] ${object.value} [${object.name}_end `;
      }
    }).join("").trim()
  }
  output += fn(input);
  output += "]";
  return output;
}

// Staff type definition
const createStaff = (staffIndex, lineCount, staves, pixelRatio) => {
  // How many staff lines (and spaces) previous to this staff do we need to account for?
  const offset = staves.items.reduce((a, s, i) => {
    if (staffIndex - 1 >= 0 && i <= (staffIndex - 1)) {
      return a + ((s.lineCount - 1) * sizes.SPACE) + staves.spacing[staffIndex] + (s.lineCount * sizes.STAFF_LINE_STROKE_WIDTH)
    } else {
      return a
    }
  }, 0);
  return Array(lineCount).fill().map((_, index) => (
    {
      id: `staff_${staffIndex}_line_${index}`,
      y: (offset + index + (sizes.STAFF_LINE_STROKE_WIDTH * (index + 1)) - (sizes.STAFF_LINE_STROKE_WIDTH / 2)).toFixed(2),
      x1: 0,
      x2: '100%',
      strokeWidth: sizes.STAFF_LINE_STROKE_WIDTH * (2 / pixelRatio.current),
    }
  ));
};

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
    get lineStrokeWidthTotal() {
      return this.items.reduce((a, s) => a + (s.lineCount * sizes.STAFF_LINE_STROKE_WIDTH * (2 / pixelRatio.current)), 0);
    },
    get spacing() {
      return this.items.map((_, i) => i > 0 ? sizes.SPACE_BETWEEN_STAFF_GROUPS : 0);
    },
    get height() {
      return (
        (sizes.SPACE * this.spaceCount) + this.spacing.reduce((a, c) => a + c, 0) + this.lineStrokeWidthTotal
      ).toFixed(2);
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
      // This only works for one system; we'll need StaffSystemContext to tell us about systems
      //
      // TODO: Maybe replace with a walker for JSON input?
      //
      // gridTemplateRows: `[${staves.items.map((item, itemIndex) => `${itemIndex === 0 ? `staves_start staff_${item.id}_start ` : ''}${Array(item.spaceCount).fill().map((_, space) => {
      //   const staffSpaceString = `staff_${item.id}_space_${space}_start] ${sizes.SPACE}fr [staff_${item.id}_space_${space}_end`;
      //   const betweenStavesString = `staff_${item.id}_end${staves.items.length > itemIndex + 1 ? `] ${staves.spacing[itemIndex + 1]}fr [staff_${staves.items[itemIndex + 1].id}_start` : null}`;
      //   return item.spaceCount - 1 === space && itemIndex !== staves.items.length - 1 ? `${staffSpaceString} ${betweenStavesString}` : staffSpaceString;
      // }).join(' ')}${itemIndex === staves.items.length - 1 ? ` staff_${item.id}_end staves_end` : ''}`
      // ).join(' ')}]`,
      // gridTemplateColumns: `[system_0_start names_start] auto [names_end brackets_start] auto [brackets_end incipit_start cautionary_key_start] auto [cautionary_key_end clef_start] auto [clef_end key_signature_start] auto [key_signature_end time_signature_start] auto [time_signature_end incipit_end measures_start measure_0_start] 1fr [measure_0_end measures_end system_0_end]`,
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
              {staves.items.map((staff, staffIndex) => (
                <Staff key={staff.id}>
                  {createStaff(staffIndex, staff.lineCount, staves, pixelRatio).map((line) => (
                    <Line key={line.id} vectorEffect="non_scaling-stroke" strokeWidth={line.strokeWidth} x1={line.x1} x2={line.x2} y1={line.y} y2={line.y} />
                  ))}
                </Staff>
              ))}
            </Staves>
            <Grid>
              <GridItem style={{gridArea: 'system_0_staff_0_start / names_start / system_0_staff_0_end / names_end', justifySelf: 'end'}}>Vln.I</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_1_start / names_start / system_0_staff_1_end / names_end', justifySelf: 'end'}}>Vln.II</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_2_start / names_start / system_0_staff_2_end / names_end', justifySelf: 'end'}}>Vla.</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_3_start / names_start / system_0_staff_3_end / names_end', justifySelf: 'end'}}>Vc.</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_1_space_2_start / measure_0_start / system_0_staff_1_space_3_end / measure_0_end'}}>hi</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_0_space_3_start / measure_0_start / system_0_staff_0_space_3_end / measure_0_end', justifySelf: 'center'}}>hello</GridItem>
              <GridItem style={{gridArea: 'system_0_staff_0_start / names_start / system_0_staff_2_space_0_start / measure_0_start / system_0_staff_2_space_0_end / measure_0_end', justifySelf: 'end'}}>how are you?</GridItem>
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
