import React, { useState } from "react";
import Tags from "./MultipleSelector.js";

const GroupRandomizer = () => {
  const [names, setNames] = useState("");
  const [groups, setGroups] = useState([]);
  const [numGroups, setNumGroups] = useState(1);

  const handleNameChange = (event) => {
    setNames(event.target.value);
  };

  const handleGroupNumberChange = (event) => {
    setNumGroups(event.target.value);
  };

  const randomizeGroups = () => {
    const nameArray = names
      .map((name) => name.trim())
      .filter((name) => name !== "");
    const shuffledArray = nameArray.sort(() => Math.random() - 0.5);

    const dividedGroups = [];
    for (let i = 0; i < numGroups; i++) {
      dividedGroups.push(
        shuffledArray.filter((_, index) => index % numGroups === i)
      );
    }

    setGroups(dividedGroups);
  };

  return (
    <div>
      <h2>Group Randomizer</h2>
      <div>
        <label>Enter Names:</label>
        <Tags setNames={setNames} />
      </div>
      <div>
        <label>Number of Groups:</label>
        <input
          type="number"
          value={numGroups}
          onChange={handleGroupNumberChange}
        />
      </div>
      <button onClick={randomizeGroups}>Randomize into Groups</button>
      {groups.map((group, index) => (
        <div key={index}>
          <h3>Group {index + 1}</h3>
          <ul>
            {group.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default GroupRandomizer;
