import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import Barline from '../components/Barline/Barline';
import Measure from '../components/Measure';
import Staff from '../components/Staff';
import StaffDisplayItem from '../components/StaffDisplayItem';
import Systems from '../components/Systems';
import { setRefElemFromArrayByIndex } from '../hooks/useVars';

const metadata = require('../public/fonts/bravura/bravura_metadata.json');

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

const initialMeasures = [
  { duration: 2048, first: false, last: false, },
  { duration: 1024, first: false, last: false, },
  { duration: 1024, first: false, last: false, },
  { duration: 1024, first: false, last: false, },
  { duration: 1024, first: false, last: false, },
  { duration: 2048, first: false, last: false, },
  { duration: 512, first: false, last: false, },
  { duration: 4096, first: false, last: false, },
  { duration: 1024, first: false, last: false, },
  { duration: 768, first: false, last: false, }
];

export default function Simple() {
  const [measures, setMeasures] = useState(initialMeasures);
  const measuresRef = useRef(new Array(initialMeasures.length).fill(null));

  // TODO: perhaps the issue with inconsistent results from the onResize method
  // is to do with the fact that conditionally rendered items aren't taken into
  // account PRIOR to its having been called.
  // OR —————— Measure should have all its incipit and explicit matter within
  // the component itself, not as a child that then needs to be accounted for by
  // way of the forwardRef ... ??
  const onResize = useCallback(() => {
    const _mm = measuresRef.current.reduce((acc, m, mi) => {
      const _m = {
        ...initialMeasures[mi],
        first: !measuresRef.current[mi - 1]
          || measuresRef.current[mi].offsetTop !== measuresRef.current[mi - 1].offsetTop,
        last: !measuresRef.current[mi + 1]
          || measuresRef.current[mi].offsetTop !== measuresRef.current[mi + 1].offsetTop,
      };
      return [...acc, _m];
    }, []);
    setMeasures(_mm);
  }, []);

  useLayoutEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [onResize]);
  
  return (
    <>
      <Systems id="systems">
        {measures.map((measure, index) => (
          <Measure
            key={`measure_${index}`}
            measure={measure}
            ref={(element) => setRefElemFromArrayByIndex({ element, refArray: measuresRef, index })}
          >
            <Staff number={1} clef={'treble'} duration={measure.duration}>
              {index === 0 && (
                <Item $size={2} $pitch={'g4'} $start={'m-text'} $padEnd={1}>Violin 1</Item>
              )}
              {index !== 0 && measure.first && (
                <Item $size={2} $pitch={'g4'} $start={'m-text'} $padEnd={1}>Vln.1</Item>
              )}
              {/* TODO: check previous measure for whether clef or key is different from current */}
              {measure.first && (
                <>
                  <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                  <StaffDisplayItem direction="row" start="m-key">
                    <Item $pitch="b4" $start={1}></Item>
                    <Item $pitch="e5" $start={2}></Item>
                  </StaffDisplayItem>
                </>
              )}
              <StaffDisplayItem direction="column" start="m-tim">
                <Item $text $pitch="b4">{measure.duration / 512}</Item>
                <Item $text $pitch="e4">8</Item>
              </StaffDisplayItem>
              <Event $beat={1} $pitch={'g4'}></Event>
              <Event $beat={170} $pitch={'b4'}></Event>
              <Event $beat={341} $pitch={'d5'}></Event>
            </Staff>

            <Staff number={2} clef={'treble'} duration={measure.duration}>
              {index === 0 && (
                <Item $size={2} $pitch={'g4'} $start={'m-text / m-bracket'} $padEnd={1}>Violin 2</Item>
              )}
              {index !== 0 && measure.first && (
                <Item $size={2} $pitch={'g4'} $start={'m-text'} $padEnd={1}>Vln.2</Item>
              )}
              {/* TODO: check previous measure for whether clef or key is different from current */}
              {measure.first && (
                <>
                  <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                  <StaffDisplayItem direction="row" start="m-key">
                    <Item $pitch="b4" $start={1}></Item>
                    <Item $pitch="e5" $start={2}></Item>
                    <Item $pitch="a4" $start={3}></Item>
                    <Item $pitch="d5" $start={4}></Item>
                  </StaffDisplayItem>
                </>
              )}
              <StaffDisplayItem direction="column" start="m-tim">
                <Item $text $pitch="b4">{measure.duration / 512}</Item>
                <Item $text $pitch="e4">8</Item>
              </StaffDisplayItem>
              <Event $beat={1} $pitch={'c5'}></Event>
              <Event $beat={256} $pitch={'a4'}></Event>
            </Staff>

            {index + 1 === measures.length && (
              <Barline final={true} column={'me-bar / m-end'}>
                <rect x={0} y={0} width={metadata.engravingDefaults.thinBarlineThickness / 4} height={1} />
                <rect x={(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation) / 4} y={0} width={metadata.engravingDefaults.thickBarlineThickness / 4} height={1} />
              </Barline>
            )}
            {measure.last && (index + 1 !== measures.length) && (
              <Barline column={'me-bar / m-end'}>
                <rect x={0} y={0} width={1} height={1} />
              </Barline>
            )}
          </Measure>
        ))}
      </Systems>
    </>
  )
}