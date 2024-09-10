import Item from "../Item";
import StaffDisplayItem from "../StaffDisplayItem";

const range = require('./../../fixtures/pitch/range.json');

const accidentalMap = {
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
  value: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]
};

// TODO: Refactor so that Staff has named rows for each anticipated keyAccidental index,
// And placing them is as easy as referencing `keyAccFlat1`, `keyAccFlat2`, etc
export default function Key({ fifths, clefType }) {
  const unsignedInteger = Math.abs(fifths);
  const sign = Math.sign(fifths);
  const accidentals = sign === 0
    ? []
    : range.clefs[clefType].keyAccidentals[sign === 1 ? 'sharp' : 'flat']
      .slice(0, unsignedInteger);
  return (
    <StaffDisplayItem type="key" start="m-key">
      {accidentals.length > 0 && accidentals.map((accidental, index) => (
        <Item key={`key_acc${index}`} pitch={accidental.toLowerCase()} column={index + 1}>
          {accidentalMap.value[accidentalMap.key.indexOf(sign === 1 ? 'accidentalSharp' : 'accidentalFlat')]}
        </Item>
      ))}
    </StaffDisplayItem>
  )
}