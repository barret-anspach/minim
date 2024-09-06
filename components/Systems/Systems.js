import { useRef } from 'react';

import { useWidth } from '../../hooks/useWidth';
import styles from './Systems.module.css';

export default function Systems({ children, ...rest }) {
  const ref = useRef(null);
  useWidth(ref);
  return (
    <article ref={ref} className={styles.systems} {...rest}>
      {children}
    </article>
  )
}