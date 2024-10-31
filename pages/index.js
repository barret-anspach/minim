import { useEffect } from "react";
import Score from "../components/score";
import { useMeasuresContext } from "../contexts/MeasuresContext";

const composition = require("../fixtures/scores/minim-score-test.json");
// const composition = require("../fixtures/scores/minim-score-test 2024 10 20.json");

export default function Minim() {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    composition.scores.forEach((score) => {
      score.flows.forEach((flow) => {
        actions.setFlow({ flow });
      });
      actions.setPeriods();
    });
  }, [composition]);

  return <Score composition={composition} />;
}
