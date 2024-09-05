import { useRef } from 'react';
import clsx from 'clsx';
import styles from './StaffDisplayItem.module.css';
import useVars from '../../hooks/useVars';

export default function StaffDisplayItem({ children, direction, start }) {
  const varRef = useRef(null);
  const className = useVars({
    defaultStyles: [styles.staffDisplayItem],
    conditionalStyles: [
      { condition: direction === 'row', operator: '&&', style: styles.row },
      { condition: direction === 'column', operator: '&&', style: styles.column },
    ],
    key: '--main-axis',
    value: '1fr',
  });

  useVars({
    varRef,
    key: '--start',
    value: start,
  })

  return (
    <span ref={varRef} className={clsx(className)}>
      {children}
    </span>
  )
}