import { useRef } from 'react';
import clsx from 'clsx';

import useVars from '../../hooks/useVars';
import metadata from './../../public/fonts/bravura/bravura_metadata.json';

import styles from './Barline.module.css';
import { withNoSSR } from '../../hooks/withNoSSR';

function RegularBarline() {
  return <rect x={0} y={0} width={1} height={1} />;
}

function FinalBarline() {
  return (
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
  )
}

function Barline({ children, type = 'regular', column, row = '1 / -1', separation }) {
  const ref = useRef(null);
  const className = useVars({
    varRef: ref,
    defaultStyles: [styles.barline],
    conditionalStyles: [{ condition: separation, operator: "&&", style: styles.separation }],
    key: '--separation',
    value: `${metadata.engravingDefaults.barlineSeparation / 4}rem`,
  })
  useVars({
    varRef: ref,
    key: '--column',
    value: type === "final" ? 'me-bar / m-end' : column,
  })
  useVars({
    varRef: ref,
    key: '--row',
    value: row,
  })

  return (
    <svg
      ref={ref}
      viewBox={type === "final" ? `0 0 ${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4} 1`
        : `0 0 1 1`}
      width={type === "final" ? `${(metadata.engravingDefaults.thinBarlineThickness + metadata.engravingDefaults.barlineSeparation + metadata.engravingDefaults.thickBarlineThickness) / 4}rem`
        : `${metadata.engravingDefaults.thinBarlineThickness / 4}rem`}
      height="100%"
      preserveAspectRatio='none'
      overflow="visible"
      className={clsx(className)}
    >
      {children}
      {type === "final" ? <FinalBarline /> : <RegularBarline />}
    </svg>
  );
}

export default withNoSSR(Barline);