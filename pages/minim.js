import { useEffect } from "react";
import MinimScore from "../components/Score/MinimScore";
import { useMeasuresContext } from "../contexts/MeasuresContext";

const composition = require("../fixtures/scores/minim-score-test.json");

export default function Minim() {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    composition.scores.map((score) =>
      score.flows.map((flow) => {
        actions.setFlow({ flow });
      }),
    );
  }, [composition]);

  return <MinimScore composition={composition} />;
}
