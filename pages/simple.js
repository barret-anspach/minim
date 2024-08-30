import React, { useLayoutEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import Staff from '../components/Staff';

const metadata = require('../public/fonts/bravura/bravura_metadata.json');

const helloWorld = require('../fixtures/example_mxn_hello-world.json');

const Systems = styled.article`
  container: systems;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 2rem;
  width: 100%;
  height: 100%;
  min-height: fit-content;
  padding: 2rem;
`
/**
 * IDEA: Use `flex-basis` on individual measures to adjust system breaks/how many measures are displayed per system.
 * IDEA: use resize observer to apply .last or .first to a measure if last/first in system; can help with conditionally displaying a final barline etc.
 */
const Measure = styled.section`
  display: grid;
  grid-template-rows: [staff1] auto [staff2] auto;
  row-gap: 1rem;
  ${({ $duration }) => $duration ? css`
    grid-template-columns: [m-tex] auto [m-bra] auto [m-start m-bar] auto [m-cle] auto [m-key] auto [m-tim] auto [m-con] repeat(${$duration}, [e] auto) [me-cle] auto [me-key] auto [me-bar] auto [me-tim] auto [m-end];
    flex: ${$duration} 0 auto;
  ` : css`
    grid-template-columns: repeat(1024, auto);
    flex: 1024 0 auto;
  `}
`
const Barline = styled.svg.attrs(({ $final }) => ({
  viewBox: $final
    ? `0 0 ${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4} 1`
    : `0 0 1 1`,
  preserveAspectRatio: 'none',
  width: $final
    ? `${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4}rem`
    : `${metadata.engravingDefaults.thinBarlineThickness / 4}rem`,
  height: `100%`,
  overflow: 'visible',
}))`
  justify-self: end;
  height: 100%;
  ${({ $separation }) => $separation && css`
    margin-right: ${metadata.engravingDefaults.barlineSeparation / 4}rem;
  `}
  ${({ $column }) => $column ? css`
    grid-column: ${$column};
  ` : css`
    grid-column: m-bar;
  `}
  ${({ $row }) => $row ? css`
    grid-row: ${$row};
  ` : css`
    grid-row: 1 / -1;
  `}
`
const Event = styled.div`
  font-family: Bravura, sans-serif;
  height: 0;
  line-height: 0;
  ${({ $beat, $pitch }) => $beat && $pitch && css`
    grid-column-start: e ${$beat};
    grid-row: ${$pitch} / ${$pitch};
  `}
`
const Item = styled.span`
  align-self: start;
  display: flex;
  align-items: center;
  height: 0;
  font-family: Bravura, sans-serif;
  line-height: 0;
  ${({ $pitch }) => $pitch && css`
    grid-row: ${$pitch};
  `}
  ${({ $start }) => $start && css`
    grid-column: ${$start};
  `}
  ${({ $padEnd }) => $padEnd && css`
    padding-right: ${$padEnd / 4}rem;
  `}
  ${({ $text }) => $text && css`
    font-size: 0.7rem;
    justify-self: center;
  `}
  ${({ $size }) => $size && css`
    font-size: ${$size / 4}rem;
    justify-self: end;
  `}
`
const Key = styled.span`
  justify-self: start;
  grid-row: 1 / -1;
  ${({ $start }) => $start ? css`
    grid-column-start: ${$start};
  ` : css`
    grid-column-start: m-key;
  `}
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-template-rows: subgrid;
  margin-right: 0.1rem;
`
const Tim = styled.span`
  justify-self: start;
  grid-row: 1 / -1;
  ${({ $start }) => $start ? css`
    grid-column-start: ${$start};
  ` : css`
    grid-column-start: m-tim;
  `}
  display: inline-grid;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  grid-template-rows: subgrid;
  margin-right: 0.1rem;
`

export default function Simple() {

  const measures = [
    { duration: 2048 }, { duration: 1024 },{ duration: 1024 },{ duration: 1024 },{ duration: 1024 }, { duration: 2048 }, { duration: 512 }, { duration: 4096 }, { duration: 1024 }, { duration: 768 }
  ];

  return (
    <>
      <Systems id="systems">
        {/* Metadata */}
        <Measure>
          <Staff number={1} clef={'treble'} lined={false}>
            <Item $size={2} $pitch={'g4'} $padEnd={1}>Vln.1</Item>
          </Staff>
          <Staff number={2} clef={'treble'} lined={false}>
            <Item $size={2} $pitch={'g4'} $padEnd={1}>Vln.2</Item>
          </Staff>
        </Measure>
        {/* Sequence content */}
        {measures.map((measure, index) => (
          <Measure
          key={`measure_${index}`}
          $duration={measure.duration}
          >
            { /* TODO: first measure in system should show bracket, if any */}
            {index === 0 && (          
              <Barline $separation $row={'1 / -1'} $column={'m-bra / m-bra'} height="100%">
                <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
              </Barline>
            )}
            <Barline $separation $row={'1 / -1'}>
              <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
            </Barline>

            <Staff number={1} clef={'treble'} duration={measure.duration}>
              {/* TODO: check previous measure for whether clef or key is different from current */}
              {index === 0 && (
                <>
                  <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                  <Key>
                    <Item $pitch="b4" $start={1}></Item>
                    <Item $pitch="e5" $start={2}></Item>
                  </Key>
                </>
              )}
              <Tim>
                <Item $text $pitch="b4">{measure.duration / 512}</Item>
                <Item $text $pitch="e4">8</Item>
              </Tim>
              <Event $beat={1} $pitch={'g4'}></Event>
              <Event $beat={170} $pitch={'b4'}></Event>
              <Barline $separation $row={'d5 / g4'} $column={'e 256'}>
                <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
              </Barline>
              <Event $beat={341} $pitch={'d5'}></Event>
            </Staff>

            <Staff number={2} clef={'treble'} duration={measure.duration}>
              {/* TODO: check previous measure for whether clef or key is different from current */}
              {index === 0 && (
                <>
                  <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                  <Key>
                    <Item $pitch="b4" $start={1}></Item>
                    <Item $pitch="e5" $start={2}></Item>
                    <Item $pitch="a4" $start={3}></Item>
                    <Item $pitch="d5" $start={4}></Item>
                  </Key>
                </>
              )}
              <Tim>
                <Item $text $pitch="b4">{measure.duration / 512}</Item>
                <Item $text $pitch="e4">8</Item>
              </Tim>
              <Event $beat={1} $pitch={'c5'}></Event>
              <Barline $separation $row={'d5 / g4'} $column={'e 256'}>
                <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
              </Barline>
              <Event $beat={256} $pitch={'a4'}></Event>
            </Staff>

            {index + 1 === measures.length && (
              <Barline $final $column={'me-bar / m-end'}>
                <rect x={0} y={0} width={metadata.engravingDefaults.thinBarlineThickness / 4} height={1} />
                <rect x={(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation) / 4} y={0} width={metadata.engravingDefaults.thickBarlineThickness / 4} height={1} />
              </Barline>
            
            /*
              // TODO: Show this for a staff's last measure in the system
              <Barline $column={'me-bar / m-end'}>
                <rect x={0} y={0} width={1} height={1} />
              </Barline>
            */
            )}
          </Measure>
        ))}
      </Systems>
    </>
  )
}