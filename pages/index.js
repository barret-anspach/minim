import { useEffect } from 'react';
import Score from '../components/Score';
import { useMeasuresContext } from '../contexts/MeasuresContext';

const score = require('../fixtures/scores/2024-09-17--test.json');

export default function Minim() {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    actions.setAllMeasures({ score })
  }, [score]);

  return <Score score={score} />;
}
