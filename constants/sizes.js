const metadata = require('../public/fonts/bravura/bravura_metadata.json');

const sizes = {
  FONT: 7, // unit in mm
  BASE_HEIGHT: 0,
  SPACE: 1,
  SPACE_BETWEEN_STAVES: 3 / 2,
  SPACE_BETWEEN_STAFF_GROUPS: 32 / 5,
  STAFF_HEIGHT: 4,
  STAFF_LINE_STROKE_WIDTH: metadata.engravingDefaults.staffLineThickness,
  BARLINE_THICKNESS: {
    THIN: metadata.engravingDefaults.thinBarlineThickness,
    THICK: metadata.engravingDefaults.thickBarlineThickness, 
  }
}

sizes.BASE_HEIGHT = sizes.SPACE * 4

export { sizes }