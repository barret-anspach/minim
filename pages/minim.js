import MinimScore from "../components/Score/MinimScore";

const composition = require("../fixtures/scores/minim-score-test.json");

export default function Minim() {
  return <MinimScore composition={composition} />;
}
