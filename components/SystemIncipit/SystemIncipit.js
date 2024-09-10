import Clef from "../Clef"
import Key from "../Key"

const range = require('./../../fixtures/pitch/range.json');

export default function SystemIncipit({ globalMeasure, part, index, staffIndex }) {
  const clef = Object.values(range.clefs).find((v) => part.measures[index].clefs[staffIndex].clef.sign === v.sign);
  return (
    <>
      <Clef clef={clef} />
      {globalMeasure.key && (
        <Key
          clefType={clef.type}
          fifths={globalMeasure.key.fifths}
        />
      )}
    </>
  )
}