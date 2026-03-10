import { useMemo } from "react";

import Item from "./../../components/item/index.js";

import metadata from "./../../../public/fonts/bravura/bravura_metadata.json";
import range from "./../../fixtures/pitch/range.json";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";

type ClefProps = {
  clef: Minim.Component.Clef;
  column: Minim.Grid.Column;
  id: MNX.Defs.ID;
};

export default function Clef({ clef, column = "m-cle", id }: ClefProps) {
  const _clef: Minim.Range.Clef = useMemo(
    () =>
      range.clefs[
        Object.values(range.clefs).find((v) => clef.sign === v.sign)!
          .type as Minim.Range.ClefType
      ] as Minim.Range.Clef,
    [clef.sign],
  );

  return (
    <Item
      data-clef
      pitch={`${id ?? ""}${_clef.staffPitch}`}
      column={column}
      padEnd={metadata.engravingDefaults.barlineSeparation}
    >
      {_clef.glyph}
    </Item>
  );
}
