export const accidentalMap = {
  key: [
    "accidentalFlat",
    "accidentalNatural",
    "accidentalSharp",
    "accidentalDoubleSharp",
    "accidentalDoubleFlat",
    "accidentalNaturalSharp",
    "accidentalNaturalFlat",
    "accidentalParensLeft",
    "accidentalParensRight",
  ],
  value: ["", "", "", "", "", "", "", "", ""],
} as const;

export type AlterationValue = -2 | -1 | 0 | 1 | 2;

const alterationValue = {
  [-2]: "accidentalDoubleFlat",
  [-1]: "accidentalFlat",
  [0]: "accidentalNatural",
  [1]: "accidentalSharp",
  [2]: "accidentalDoubleSharp",
};

export const getAccidentalGlyph = (alter: AlterationValue) => {
  return accidentalMap.value[
    accidentalMap.key.indexOf(
      alterationValue[alter] as (typeof accidentalMap.key)[number],
    )
  ];
};
