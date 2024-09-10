import ExplicitScoreExample from '../components/Score/ExplicitScore.example';

const score = require('../fixtures/2024-08-29--test.json');

export default function Minim() {
  return <ExplicitScoreExample score={score} />;
}
