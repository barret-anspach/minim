import { useRef } from 'react';
import clsx from 'clsx';

import Barline from '../Barline';
import { usePosition } from '../../hooks/usePosition';
import useVars from '../../hooks/useVars';
import { withNoSSR } from '../../hooks/withNoSSR';

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');
import styles from './Measure.module.css';

function Measure({ children, handleResize, index, measure, ...rest }) {
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

  return (
    <section
      ref={ref}
      className={clsx(className)}
      {...rest}
    >
      {first && (          
        <Barline separation={true} row={'1 / -1'} column={'m-bracket / m-bracket'} height="100%">
          <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
        </Barline>
      )}
      <Barline separation={true} row={'1 / -1'} column={'m-bar'}>
        <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
      </Barline>
      {children}
    </section>
  )
}

export default withNoSSR(Measure);
