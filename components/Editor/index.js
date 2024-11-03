import { useEffect, useState } from "react";
import Score from "../score";
import { useMeasuresContext } from "../../contexts/MeasuresContext";
import styles from "./styles.module.css";

const composition = require("../../fixtures/scores/minim-score-test.json");
// const composition = require("../../fixtures/scores/minim-score-test 2024 10 20.json");

const VIEW = ["block", "inline"];

export default function Editor() {
  const { actions } = useMeasuresContext();
  const [view, setView] = useState(VIEW[0]);
  const [input, setInput] = useState("");

  function parseInput(string) {
    return null;
  }

  useEffect(() => {
    parseInput(input);
  }, [input]);

  useEffect(() => {
    composition.scores.forEach((score) => {
      score.flows.forEach((flow) => {
        actions.setFlow({ flow });
      });
      actions.setPeriods();
    });
  }, [actions]);

  return (
    <div className={styles.editor}>
      <div className={styles.score}>
        <Score composition={composition} view={view} />
      </div>
      <footer className={styles.footer}>
        <pre>{view}</pre>
        <button onClick={() => setView(view === "block" ? VIEW[1] : VIEW[0])}>
          Toggle
        </button>
      </footer>
    </div>
  );
}
