export const randomizeGroups = (members, groupSize) => {
  const numGroups = Math.ceil(members.length / groupSize);

  const nameArray = members
    .map((name) => name.trim())
    .filter((name) => name !== "");

  const shuffledArray = nameArray.sort(() => Math.random() - 0.5);

  const dividedGroups = new Map();

  // With this logic, it will do as many groups as it can with the group size.
  // However, it will try to balance the odd groups so that one person isn't alone.
  // For example, 7 members with a group size of 3 will result in groups of 3, 2, and 2.
  // Even with 4 members and a group size of 3, it will result in groups of 2 and 2.
  for (let i = 0; i < numGroups; i++) {
    const groupMembers = shuffledArray.filter(
      (_, index) => index % numGroups === i
    );
    dividedGroups.set(i, groupMembers);
  }

  const groupEntries = Object.fromEntries(dividedGroups);

  return groupEntries;
};
