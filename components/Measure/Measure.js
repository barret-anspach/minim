import { useRef } from 'react';
import clsx from 'clsx';

import Barline from '../Barline';

import { usePosition } from '../../hooks/usePosition';
import useVars from '../../hooks/useVars';
import { withNoSSR } from '../../hooks/withNoSSR';

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');
import styles from './Measure.module.css';

function Measure({ children, final, handleResize, initial, index, measure, parts, ...rest }) {
  const ref = useRef(null);
  const { first, last } = usePosition(ref, index);

  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.measure],
    conditionalStyles: [
      { condition: first, operator: '&&', style: styles.first },
      { condition: last, operator: '&&', style: styles.last }
    ],
    key: '--duration',
    value: measure.duration,
  });
  useVars({
    varRef: ref,
    key: '--indent',
    value: index === 0 ? '3rem' : 'auto',
  })
  useVars({
    varRef: ref,
    key: '--staves',
    value: parts.length,
  })

  return (
    <section
      ref={ref}
      className={clsx(className)}
      {...rest}
    >
      {/** Bracket placeholder */}
      {first && (       
        <Barline type={"regular"} separation={true} row={'1 / -1'} column={'m-bracket / m-bracket'} height="100%">
          <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
        </Barline>
      )}
      <Barline type={"regular"} separation={true} row={'1 / -1'} column={'m-bar'}>
        <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
      </Barline>
      {children}
      {last && !final && (
        <Barline column={'me-bar'}>
          <rect x={0} y={0} width={1} height={1} />
        </Barline>
      )}
      {final && (
        <Barline type={"final"} />
      )}
    </section>
  )
}

export default withNoSSR(Measure);
