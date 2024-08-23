export const randomizeGroups = (members, groupSize) => {
  const numGroups = Math.ceil(members.length / groupSize);
  const nameArray = members
    .map((name) => name.trim())
    .filter((name) => name !== "");

  const shuffledArray = nameArray.sort(() => Math.random() - 0.5);

  const groups = {};

  for (let i = 0; i < numGroups; i++) {
    groups[i] = {
      members: shuffledArray.filter((_, index) => index % numGroups === i),
      creationMethod: "Randomizer",
      createdAt: new Date().toISOString(),
      logMessages: [`Group created with Randomizer at ${new Date().toISOString()}`], // Log the creation
    };
  }

  return groups;

};
