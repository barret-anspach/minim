import { useRef } from 'react';
import clsx from 'clsx';

import useVars from '../../hooks/useVars';
import styles from './Item.module.css';

function Item({ children, className, column, padEnd, pitch, size, text = false, }) {
  const ref = useRef(null);
  useVars({
    varRef: ref,
    key: '--column',
    value: column ?? 'e 1',
  });
  useVars({
    varRef: ref,
    key: '--padEnd',
    value: padEnd ? `${padEnd}rem` : '0.1rem',
  });
  useVars({
    varRef: ref,
    key: '--pitch',
    value: pitch,
  });
  useVars({
    varRef: ref,
    key: '--size',
    value: size ? `${size}rem` : '4rem',
  });

  return (
    <span
      ref={ref}
      className={clsx([styles.item, text && styles.text, className])}
    >
      {children}
    </span>
  )
}

export default Item
