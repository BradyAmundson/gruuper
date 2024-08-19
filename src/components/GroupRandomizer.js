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
      creationMethod: "Randomizer", // Set creation method to "Randomizer"
      createdAt: new Date().toISOString(), // Add a timestamp for creation
      logMessages: [`Group created with Randomizer at ${new Date().toISOString()}`], // Log the creation
    };
  }

  // console.log(groups);
  return groups;

};
