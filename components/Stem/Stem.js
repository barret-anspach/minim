import { useRef } from 'react';
import clsx from "clsx";

import Item from '../Item';

import useVars from '../../hooks/useVars';
import styles from './Stem.module.css';
import { toDuration, getStem } from '../../utils/methods';

const metadata = require('./../../public/fonts/bravura/bravura_metadata.json');
const range = require('./../../fixtures/pitch/range.json');

const flagMap = {
  key: [
    'eighth',
    '16th',
    '32nd',
    '64th',
  ], value: [
    {down: '', up: ''},
    {down: '', up: ''},
    {down: '', up: ''},
    {down: '', up: ''},
  ],
}

/** 
 * An unbeamed Stem should roughly span an octave.
 * If a stem is on or below the Staff's midline, stem should be pointed down.
 * A beamed Stem's direction should be away from the beamed note farthest from the midline.
 */
export default function Stem({ clef, column, event, notes }) {
  const stemRef = useRef(null);
  const _clef = 
    Object.values(range.clefs).find((v) => clef.sign === v.sign);
  const stem = getStem(notes, _clef.staffLinePitches[2].id);
  const duration = toDuration(event);

  useVars({
    varRef: stemRef,
    key: '--column',
    value: column,
  })
  useVars({
    varRef: stemRef,
    key: '--pitch',
    value: stem.row,
  })

  return (
    <>
      <svg
        ref={stemRef}
        viewBox={`0 0 1 1`}
        width={`${metadata.engravingDefaults.stemThickness / 4}rem`}
        height="100%"
        preserveAspectRatio='none'
        overflow="visible"
        className={clsx([styles.stem, stem.direction === 'up' ? styles.up : styles.down])}
      >
        <rect x={0} y={0} width={1} height={1} />
      </svg>
      {/** Flag, if not part of a beam group */}
      {/** Flag, if less than quarter */}
      {duration < 512 && (
        <Item
          className={clsx(styles.flag, stem.direction === 'up' ? styles.up : styles.down)}
          column={column}
          pitch={stem.row}
        >
          {flagMap.value[flagMap.key.findIndex(k => k === event.duration.base)][stem.direction]}
        </Item>
      )}
    </>
  )
}