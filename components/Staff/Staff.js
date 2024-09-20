import React, { useMemo, useRef } from 'react';

import StaffLine from './StaffLine';

import { usePitches } from '../../hooks/usePitches';
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
  const style = usePitches(clef.clef);

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
      {lined && clef && range.clefs[style.rangeClef.type] && range.clefs[style.rangeClef.type].staffLinePitches.map((line, lineIndex) =>
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