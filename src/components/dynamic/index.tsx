import Item from "./../../components/item/index.js";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";

export const dynamicMap = {
  key: [
    "dynamicPiano",
    "dynamicMezzo",
    "dynamicForte",
    "dynamicRinforzando",
    "dynamicSforzando",
    "dynamicZ",
    "dynamicNiente",
    "dynamicPPPPPP",
    "dynamicPPPPP",
    "dynamicPPPP",
    "dynamicPPP",
    "dynamicPP",
    "dynamicMP",
    "dynamicMF",
    "dynamicPF",
    "dynamicFF",
    "dynamicFFF",
    "dynamicFFFF",
    "dynamicFFFFF",
    "dynamicFFFFFF",
    "dynamicFortePiano",
    "dynamicForzando",
    "dynamicSforzando1",
    "dynamicSforzandoPiano",
    "dynamicSforzandoPianissimo",
    "dynamicSforzato",
    "dynamicSforzatoPiano",
    "dynamicSforzatoFF",
    "dynamicRinforzando1",
    "dynamicRinforzando2",
  ],
  shorthand: [
    "p",
    "m",
    "f",
    "r",
    "s",
    "z",
    "n",
    "pppppp",
    "ppppp",
    "pppp",
    "ppp",
    "pp",
    "mp",
    "mf",
    "pf",
    "ff",
    "fff",
    "ffff",
    "fffff",
    "ffffff",
    "fp",
    "fz",
    "sf",
    "sfp",
    "sfpp",
    "sfz",
    "sfzp",
    "sffz",
    "rf",
    "rfz",
  ] as const,
  value: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
};

// Do we consider a Dynamic a marking on a chord? There are conditions where a dynamic isn't related to an event ...

export default function Dynamic({
  dynamic,
}: {
  dynamic: {
    column: Minim.Grid.Column;
    row: Minim.Grid.Column;
    value: (typeof dynamicMap.shorthand)[number];
  };
}) {
  const glyph = dynamicMap.value[dynamicMap.shorthand.indexOf(dynamic.value)];
  return (
    <Item
      className={styles.dynamic}
      column={dynamic.column}
      pitch={dynamic.row}
    >
      {glyph}
    </Item>
  );
}
