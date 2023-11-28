export const randomizeGroups = (members, groupSize) => {
  console.log("GROUPSIZE: ", groupSize)
  const numGroups = Math.ceil(members.length/groupSize);
  console.log("NUMGROUPS: ", numGroups)
  const nameArray = members
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const shuffledArray = nameArray.sort(() => Math.random() - 0.5);

  const dividedGroups = new Map();

  for (let i = 0; i < numGroups; i++) {
    dividedGroups.set(i, shuffledArray.filter((_, index) => index % numGroups === i)); 
  }
  return Object.fromEntries(dividedGroups);
};