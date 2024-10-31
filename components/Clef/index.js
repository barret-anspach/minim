import { useMemo } from "react";

import Item from "../item";

const metadata = require("../../public/fonts/bravura/bravura_metadata.json");
const range = require("../../fixtures/pitch/range.json");

export default function Clef({ clef, column = "m-cle", id }) {
  const _clef = useMemo(
    () =>
      range.clefs[
        Object.values(range.clefs).find((v) => clef.sign === v.sign).type
      ],
    [clef.sign],
  );

  return (
    <Item
      pitch={`${id ?? ""}${_clef.staffPitch}`}
      column={column}
      padEnd={metadata.engravingDefaults.barlineSeparation}
    >
      {_clef.glyph}
    </Item>
  );
}
