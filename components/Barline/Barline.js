import { useRef } from 'react';
import clsx from 'clsx';

import useVars from '../../hooks/useVars';
import metadata from './../../public/fonts/bravura/bravura_metadata.json';

import styles from './Barline.module.css';
import { withNoSSR } from '../../hooks/withNoSSR';

function Barline({ children, final = false, column, row = '1 / -1', separation }) {
  const barlineRef = useRef(null);
  const className = useVars({
    varRef: barlineRef,
    defaultStyles: [styles.barline],
    conditionalStyles: [{ condition: separation, operator: "&&", style: styles.separation }],
    key: '--separation',
    value: `${metadata.engravingDefaults.barlineSeparation / 4}rem`,
  })
  useVars({
    varRef: barlineRef,
    key: '--column',
    value: final ? 'me-bar / m-end' : column,
  })
  useVars({
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
      className={clsx(className)}
    >
      {children}
      {final ? (
        <>
          <rect
            x={0}
            y={0}
            width={metadata.engravingDefaults.thinBarlineThickness / 4}
            height={1}
          />
          <rect
            x={
              (
                metadata.engravingDefaults.thinBarlineThickness
                + metadata.engravingDefaults.barlineSeparation
              ) / 4
            }
            y={0}
            width={metadata.engravingDefaults.thickBarlineThickness / 4}
            height={1}
          />
        </>
      ) : (
        <rect x={0} y={0} width={1} height={1} />
       )}
    </svg>
  );
}

export default withNoSSR(Barline);