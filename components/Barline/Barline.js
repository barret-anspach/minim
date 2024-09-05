import { useRef } from 'react';
import clsx from 'clsx';

import useVars from '../../hooks/useVars';
import metadata from './../../public/fonts/bravura/bravura_metadata.json';

import styles from './Barline.module.css';

export default function Barline({ children, final, column, row = '1 / -1', separation }) {
  const barlineRef = useRef(null);
  const className = useVars({
    varRef: barlineRef,
    defaultStyles: [styles.barline],
    conditionalStyles: [{ condition: separation, operator: "&&", style: styles.separation }],
    key: '--separation',
    value: `${metadata.engravingDefaults.barlineSeparation / 4}rem`,
  })
  const columnClass = useVars({
    varRef: barlineRef,
    key: '--column',
    value: column,
  })
  const rowClass = useVars({
    varRef: barlineRef,
    key: '--row',
    value: row,
  })

  return (
    <svg
      ref={barlineRef}
      viewBox={final ? `0 0 ${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4} 1`
        : `0 0 1 1`}
      width={final ? `${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4}rem`
        : `${metadata.engravingDefaults.thinBarlineThickness / 4}rem`}
      height="100%"
      preserveAspectRatio='none'
      overflow="visible"
      className={clsx([...className, ...columnClass, ...rowClass])}
    >
      {children}
    </svg>
  );
}
