import { forwardRef } from 'react';
import clsx from 'clsx';

import Barline from '../Barline/Barline';

import useVars from '../../hooks/useVars';
const metadata = require('../../public/fonts/bravura/bravura_metadata.json');
import styles from './Measure.module.css';

/**
 * IDEA: Use `flex-basis` on individual measures to adjust system breaks/how many measures are displayed per system.
 * IDEA: use resize observer to apply .last or .first to a measure if last/first in system; can help with conditionally displaying a final barline etc.
 */
export default forwardRef(function Measure({ children, measure, ...rest }, ref) {
  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.measure],
    conditionalStyles: [
      { condition: measure.first, operator: '&&', style: styles.first },
      { condition: measure.last, operator: '&&', style: styles.last }
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
      {measure.first && (          
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
})
