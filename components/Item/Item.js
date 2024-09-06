import { useRef } from 'react';
import clsx from 'clsx';

import useVars from '../../hooks/useVars';
import styles from './Item.module.css';

function Item({ children, column, padEnd, pitch, size, text = false, }) {
  const ref = useRef(null);
  useVars({
    varRef: ref,
    key: '--column',
    value: column,
  });
  useVars({
    varRef: ref,
    key: '--padEnd',
    value: `${padEnd}rem`,
  });
  useVars({
    varRef: ref,
    key: '--pitch',
    value: pitch,
  });
  useVars({
    varRef: ref,
    key: '--size',
    value: `${size}rem`,
  });

  return (
    <span
      ref={ref}
      className={clsx([styles.item, text && styles.text])}
    >
      {children}
    </span>
  )
}

export default Item
