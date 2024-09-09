import React, { useMemo, useRef } from 'react';

import StaffLine from './StaffLine';

import useVars from '../../hooks/useVars';
import { withNoSSR } from '../../hooks/withNoSSR';

import styles from './Staff.module.css';
const range = require('../../fixtures/pitch/range.json');

function Staff({
  number,
  clef,
  id,
  lined = true,
  lines = { start: 'm-bar', end: 'm-end' },
  start = 'm-start',
  end = 'm-end',
  children
}) {
  const ref = useRef(null);
  const _clef = Object.values(range.clefs).find((v) => clef.clef.sign === v.sign);

  const style = useMemo(() => {
    const { upperBound, lowerBound } = _clef
      ? {
        upperBound: _clef.bounds.find(b => b.node === 'upperBound'),
        lowerBound: _clef.bounds.find(b => b.node === 'lowerBound'),
      } : {
        upperBound: null,
        lowerBound: null
      }
    const steps = range.gamut.base
      .slice(
        range.gamut.base.findIndex(p => p.id === upperBound.base.id),
        range.gamut.base.findIndex(p => p.id === lowerBound.base.id)
      );
    return {
      pitches: steps.reduce((acc, curr, index) =>
        index !== steps.length
          ? `${acc}[${curr.id}] 0.125rem `
          : `${acc}[${curr.id}]`,
        ''),
      translateY: _clef.translateY,
    };
  }, [_clef]);

  useVars({
    varRef: ref,
    key: '--number',
    value: number,
  })
  useVars({
    varRef: ref,
    key: '--pitches',
    value: style.pitches,
  })
  useVars({
    varRef: ref,
    key: '--start',
    value: start,
  })
  useVars({
    varRef: ref,
    key: '--end',
    value: end,
  })
  useVars({
    varRef: ref,
    key: '--translateY',
    value: style.translateY,
  })

  return (
    <div className={styles.staff} ref={ref}>
      {lined && clef && range.clefs[_clef.type] && range.clefs[_clef.type].staffLinePitches.map((line, lineIndex) =>
        <StaffLine
          key={`${id}_lin${lineIndex}`}
          pitch={line.id}
          start={lines.start ?? start}
          end={lines.end ?? end}
        />
      )}
      {children}
    </div>
  )
}

export default withNoSSR(Staff);