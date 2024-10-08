import { useEffect } from "react";
import Score from "../components/Score/Score";
import { useMeasuresContext } from "../contexts/MeasuresContext";

const composition = require("../fixtures/scores/minim-score-test.json");

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
