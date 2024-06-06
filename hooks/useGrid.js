import { useMemo } from 'react';

import { parseGridTemplate } from "../utils/parseGridTemplate";

const gridTemplate = require('../fixtures/gridTemplate.json');

export default function useGrid() {
  const actions = {
    getTemplateColumn(object) {
      const _systemOwner = object.belongsTo.find(ownerType => ownerType.hasOwnProperty("system"));
      const _systemMeasure = object.belongsTo.find(ownerType => ownerType.hasOwnProperty("measure"));
      if (_systemOwner) {
        const _system = gridTemplate.style.gridTemplateColumns.find(column => column.name === _systemOwner.system);

        switch (object.type) {
          case "key signature":
            break;
          case "time signature":
            break;
          case "duration":
            const _content = _system.children.find(child => child.type === "content");
            const columnName = _content.children.find(child => child.type === "measure" && child.name === _systemMeasure.measure).name;
            return `${columnName}_start / ${columnName}_end`;
        }
      }
    },
    getTemplateRow(object) {
      const _staffOwner = object.belongsTo.find(ownerType => ownerType.hasOwnProperty("staff"));
      if (_staffOwner) {
        const _system = gridTemplate.style.gridTemplateColumns.find(column => _staffOwner.staff.startsWith(column.name));
        const _systemRow = gridTemplate.style.gridTemplateRows.find(row => row.name.startsWith(_system.name));
        const _staff = _systemRow.children.find(child => child.name === _staffOwner.staff);

        switch (object.type) {
          case "key signature":
            break;
          case "time signature":
            break;
          case "duration":
            return `${_staff.name}_start / ${_staff.name}_end`;
        }
      }
    }
  }

  const grid = useMemo(() => ({
    style: {
      gridTemplateRows: parseGridTemplate(gridTemplate.style.gridTemplateRows),
      gridTemplateColumns: parseGridTemplate(gridTemplate.style.gridTemplateColumns),
    },
  }) , []);

  return { 
    actions, 
    grid
  };
}