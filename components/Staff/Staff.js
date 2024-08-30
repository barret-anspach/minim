import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');
const range = require('../../fixtures/pitch/range.json');

const Container = styled.div`
  ${({ $number }) => css`
    grid-row: staff${$number} / span 1;
  `}
  display: grid;
  grid-template-columns: subgrid;
  // TODO: parser method for mapping pitch to staff lines
  // Should account for (custom) percussion maps, too, in addition to the usual clefs
  ${({ $rows }) => css`
    grid-template-rows: ${$rows};
  `}
  align-content: start;
  height: 1rem;
  ${({ $start, $end }) => css`
    grid-column: ${$start ?? 'm-start'} / ${$end ?? 'm-end'};
  `}
  ${({ $transformY }) => css`
    transform: translateY(${$transformY});
  `}
`
export const Line = styled.hr`
  align-self: start;
  width: 100%;
  height: 0;
  border-style: solid;
  border-top: ${metadata.engravingDefaults.staffLineThickness / 4}rem solid currentColor;
  border-bottom: none;
  margin: 0;
  transform: translateY(-50%);
  ${({ $pitch, $start, $end }) => css`
    grid-row: ${$pitch} / ${$pitch};
    grid-column: ${$start} / ${$end};
  `}
`

export default function Staff({
  number,
  clef,
  duration,
  lined = true,
  lines = { start: 'm-start', end: 'm-end' },
  start = 'm-start',
  end = 'm-end',
  children
}) {
  const style = useMemo(() => {
    const { upperBound, lowerBound } = clef
      ? {
        upperBound: range.clefs[clef].bounds.find(b => b.node === 'upperBound'),
        lowerBound: range.clefs[clef].bounds.find(b => b.node === 'lowerBound'),
      } : { upperBound: null, lowerBound: null }
    const steps = range.gamut.base.slice(range.gamut.base.findIndex(p => p.id === upperBound.base.id), range.gamut.base.findIndex(p => p.id === lowerBound.base.id));
    return {
      rows: steps.reduce((acc, curr, index) => index !== steps.length ? `${acc}[${curr.id}] 0.125rem ` : `${acc}[${curr.id}]`, ''),
      transformY: range.clefs[clef].transformY,
    };
  }, [clef])

  return (
    <Container
      $duration={duration}
      $number={number}
      $rows={style.rows}
      $start={start}
      $end={end}
      $transformY={style.transformY}>
      {lined && clef && range.clefs[clef] && range.clefs[clef].staffLinePitches.map((line, lineIndex) =>
        <Line
          key={`sta${number}_lin${lineIndex}`}
          $pitch={line.id}
          $start={lines.start ?? start}
          $end={lines.end ?? end}
        />
      )}
      {children}
    </Container>
  )
}