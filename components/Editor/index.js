import styles from "./styles.module.css";

export default function Editor({ view, setView }) {
  return (
    <footer className={styles.footer}>
      <pre>{view}</pre>
      <button onClick={setView}>Toggle</button>
    </footer>
  );
}
