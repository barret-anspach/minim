import Score from '../components/Score';

const score = require('../fixtures/2024-08-29--test.json');

export default function Minim() {
  return <Score score={score} />;
}
