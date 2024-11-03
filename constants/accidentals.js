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
};

const alterationValue = {
  ["-2"]: "accidentalDoubleFlat",
  ["-1"]: "accidentalFlat",
  ["0"]: "accidentalNatural",
  ["1"]: "accidentalSharp",
  ["2"]: "accidentalDoubleSharp",
};

export const getAccidentalGlyph = (alter) => {
  return accidentalMap.value[accidentalMap.key.indexOf(alterationValue[alter])];
};
