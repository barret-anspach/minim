import React, { useEffect, useState } from "react";

export default function Editor() {
  const [input, setInput] = useState("");

  function parseInput(string) {
    return null;
  }

  useEffect(() => {
    parseInput(input);
  }, [input]);

  return (
    <React.Fragment>
      <input
        size="20"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <pre>{JSON.stringify(input, null, 2)}</pre>
    </React.Fragment>
  );
}
