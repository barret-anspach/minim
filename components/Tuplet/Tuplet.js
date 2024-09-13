import { useRef } from 'react';
import clsx from 'clsx';

import Chord from "../Chord";

import useVars from '../../hooks/useVars';
import { toDuration, toDurationFromArray } from "../../utils/methods";
import styles from './Tuplet.module.css';

const metadata = require('./../../public/fonts/bravura/bravura_metadata.json');

const tupletMap = {
  key: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
  ],
  value: [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]
}

export default function Tuplet({ clef, event, events, eventIndex, id }) {
  const bracketRef = useRef(null);
  const tuplet = {
    start: toDurationFromArray(eventIndex, events),
    outer: toDuration(event.outer) * event.outer.multiple,
    inner: toDuration(event.inner) * event.inner.multiple,
  };
  const scalar = tuplet.outer / tuplet.inner;
  // TODO: Bracket row should be set to either top of Staff or uppermost bounds of TupletEvents (whichever higher), plus default padding
  const bracketPosition = {
    start: {
      column: `e ${tuplet.start + 1}`,
      row: 'c6',
    },
    end: {
      column: `e ${tuplet.start + Math.ceil(tuplet.outer * scalar) + 1}`,
      row: 'c6',
    }
  }
  useVars({ varRef: bracketRef, key: '--column', value: `${bracketPosition.start.column}/${bracketPosition.end.column}` });
  useVars({ varRef: bracketRef, key: '--row', value: `${bracketPosition.start.row}/${bracketPosition.end.row}` });

  if (event.type !== 'tuplet') return;  
  return (
    <>
      {event.content.map((tupletEvent, tupletEventIndex, tupletEvents) => tupletEvent.notes.map((note, noteIndex) => (
        <Chord
          key={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
          id={`${id}_tup${tupletEventIndex}_not${noteIndex}`}
          clef={clef}
          column={`e ${tuplet.start + Math.floor(toDurationFromArray(tupletEventIndex, tupletEvents) * scalar) + 1}`}
          event={tupletEvent}
          eventIndex={tupletEventIndex}
          events={tupletEvents}
          note={note}
          noteIndex={noteIndex}
        />
      )))}
      {/** WIP: Bracket, ratio, etc */}
      {/** TODO: Bracket should be able to skew … somehow */}
      {/** TODO: Ratio display will break when multiple exceeds 9 (e.g. "12:8") */}
      <div className={styles.tuplet} ref={bracketRef}>
        <svg className={clsx(styles.bracket, styles.bracketLeft)} viewBox="0 0 1 1" preserveAspectRatio='none'>
          <polyline points="0,1 0,0 1,0" fill="none" stroke="black" strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}rem`} vectorEffect={'non-scaling-stroke'} />
        </svg>
        <span className={styles.ratio}>{tupletMap.value[event.inner.multiple]}{tupletMap.value[event.outer.multiple]}</span>
        <svg className={clsx(styles.bracket, styles.bracketRight)} viewBox="0 0 1 1" preserveAspectRatio='none'>
          <polyline points="0,0 1,0 1,1" fill="none" stroke="black" strokeWidth={`${metadata.engravingDefaults.tupletBracketThickness / 4}rem`} vectorEffect={'non-scaling-stroke'} />
        </svg>
      </div>
    </>
  )
}