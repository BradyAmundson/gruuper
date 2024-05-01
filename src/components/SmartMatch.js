// Import Firestore
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getUser } from "../firebase/firestoreService";

// Initialize Firestore
const db = getFirestore();

async function fetchStudentData(studentId) {
  const docRef = doc(db, "students", studentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.error("No such document!");
    return null;
  }
}

async function calculateMatchScore(student1Id, student2Id) {
  const student1 = await getUser(student1Id);
  const student2 = await getUser(student2Id);
  let score = 0;

  if (student1.major === student2.major) {
    score += 1;
  }
  if (student1.classYear === student2.classYear) {
    score += 1;
  } else {
  }

  if (student1.nightOrMorning === student2.nightOrMorning) {
    score += 1;
  } else if (student1.socialPreference === student2.socialPreference) {
    score += 1;
  }

  if (student1.deadlineBehavior === student2.deadlineBehavior) {
    score += 1;
  } else return score;
}

// New function to optimize groups based on match scores
export async function optimizeGroups(members, groupSize) {
  const scores = {};

  // Calculate all pairwise scores
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const score = await calculateMatchScore(members[i], members[j]);
      scores[`${members[i]}-${members[j]}`] = score;
      scores[`${members[j]}-${members[i]}`] = score; // Symmetric
    }
  }

  // Sort pairs by score in descending order for optimal group formation
  const sortedPairs = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const groups = new Map();
  const memberToGroup = new Map();

  // Greedily form groups based on highest scores
  for (const [pair, score] of sortedPairs) {
    const [member1, member2] = pair.split("-");
    if (!memberToGroup.has(member1) && !memberToGroup.has(member2)) {
      if (groups.size < Math.ceil(members.length / groupSize)) {
        const groupId = groups.size;
        groups.set(groupId, [member1, member2]);
        memberToGroup.set(member1, groupId);
        memberToGroup.set(member2, groupId);
      }
    } else if (memberToGroup.has(member1) && !memberToGroup.has(member2)) {
      const groupId = memberToGroup.get(member1);
      if (groups.get(groupId).length < groupSize) {
        groups.get(groupId).push(member2);
        memberToGroup.set(member2, groupId);
      }
    } else if (!memberToGroup.has(member1) && memberToGroup.has(member2)) {
      const groupId = memberToGroup.get(member2);
      if (groups.get(groupId).length < groupSize) {
        groups.get(groupId).push(member1);
        memberToGroup.set(member1, groupId);
      }
    }
  }

  // Handle remaining members who are not yet assigned to any group
  members.forEach((member) => {
    if (!memberToGroup.has(member)) {
      let placed = false;
      for (let [groupId, groupMembers] of groups) {
        if (groupMembers.length < groupSize) {
          groupMembers.push(member);
          memberToGroup.set(member, groupId);
          placed = true;
          break;
        }
      }
      if (!placed) {
        const newGroupId = groups.size;
        groups.set(newGroupId, [member]);
        memberToGroup.set(member, newGroupId);
      }
    }
  });

  // Final output of group divisions
  const groupEntries = Object.fromEntries(groups);
  return groupEntries;
}
