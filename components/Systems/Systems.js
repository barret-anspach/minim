import styles from './Systems.module.css';

export default function Systems({ children, ...rest }) {
  return (
    <article className={styles.systems} {...rest}>
      {children}
    </article>
  )
}