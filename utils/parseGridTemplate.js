export const parseGridTemplate = (input) => {
  let output = "[";
  const fn = (arr) => {
    return arr.map((object) => {
      if (object.children) {
        return ` ${object.name}_start ${fn(object.children)} ${object.name}_end `;
      } else {
        return ` ${object.name}_start] ${object.value} [${object.name}_end `;
      }
    }).join("").trim()
  }
  output += fn(input);
  output += "]";
  return output;
}
