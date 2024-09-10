import { useEffect } from 'react';
import Score from '../components/Score';
import { useMeasuresContext } from '../contexts/MeasuresContext';

const score = require('../fixtures/2024-09-08--test.json');

export default function Minim() {
  const { actions } = useMeasuresContext();

  useEffect(() => {
    actions.setAllMeasures({ score })
  }, [])

  return <Score score={score} />;
}
