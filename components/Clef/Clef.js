import Item from "../Item";

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');
const range = require('./../../fixtures/pitch/range.json');

export default function Clef({ clef, column = 'm-cle' }) {
  const _clef = range.clefs[
    Object.values(range.clefs).find((v) => clef.sign === v.sign).type
  ];
  return (
    <Item
      pitch={_clef.staffPitch}
      column={column}
      padEnd={metadata.engravingDefaults.barlineSeparation}
    >
      {_clef.glyph}
    </Item>
  )
}