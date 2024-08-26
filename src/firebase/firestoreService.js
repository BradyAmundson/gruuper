import { db } from "./firebase";
import {
  getDoc,
  setDoc,
  getFirestore,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { randomizeGroups } from "../components/GroupRandomizer.js";
import { optimizeGroups } from "../components/SmartMatch.js";
import { SmartMatch } from "../components/SmartMatch2.js";

export async function createClassroom(
  roomId,
  creatorId,
  courseNumber = "",
  gradeLevel = ""
) {
  try {
    const creatorDoc = await getDoc(doc(db, "users", creatorId));
    const creator = creatorDoc.data();
    const classroomName = `${creator.firstName} ${creator.lastName}'s Assignment`;

    const now = new Date();
    const defaultDeadline = new Date(now);
    defaultDeadline.setDate(now.getDate() + 7);
    defaultDeadline.setHours(12, 0, 0, 0);

    await setDoc(doc(db, "classrooms", roomId), {
      className: classroomName,
      instructor: `${creator.firstName} ${creator.lastName}`,
      instructorId: creatorId,
      members: [],
      ungroupedMembers: [],
      groupedMembers: [],
      groups: {},
      createdAt: now.toISOString(),
      groupingStartDeadline: defaultDeadline.toISOString().slice(0, 16),
      courseNumber: courseNumber,
      gradeLevel: gradeLevel,
    });

    const classroomCodes = creator.classroomCodes || [];
    await updateDoc(doc(db, "users", creatorId), {
      classroomCodes: [...classroomCodes, roomId],
    });
    return { roomId };
  } catch (error) {
    console.error("Error creating classroom: ", error);
    return null;
  }
}

export async function getDocument(collectionName, documentId) {
  const documentRef = doc(db, collectionName, documentId);
  const documentSnapshot = await getDoc(documentRef);

  if (documentSnapshot.exists()) {
    return { id: documentSnapshot.id, ...documentSnapshot.data() };
  } else {
    return null;
  }
}

export async function joinClassroom(roomId, userId, setError) {
  if (!roomId || !userId) {
    setError("Invalid classroom code!");
    return null;
  }
  try {
    const documentRef = doc(db, "classrooms", roomId);
    const documentSnapshot = await getDoc(documentRef);
    const usrDocumentRef = doc(db, "users", userId);
    const usrDocumentSnapshot = await getDoc(usrDocumentRef);

    if (documentSnapshot.exists() && usrDocumentSnapshot.exists()) {
      const classroomData = documentSnapshot.data();
      const members = classroomData.members;
      const instructorId = classroomData.instructorId;
      const currentCodes = usrDocumentSnapshot.data().classroomCodes || [];
      const instructorsWithAccess = usrDocumentSnapshot.data().instructorsWithAccess || [];

      if (currentCodes.includes(roomId)) {
        return roomId;
      }

      const updatedCodes = [...currentCodes, roomId];
      const updatedInstructorsWithAccess = [...new Set([...instructorsWithAccess, instructorId])];

      members.push(userId);
      await updateDoc(documentRef, { members: members });
      await updateDoc(usrDocumentRef, {
        classroomCodes: updatedCodes,
        instructorsWithAccess: updatedInstructorsWithAccess,
      });

      return roomId;
    } else {
      setError("Invalid classroom code!");
      return null;
    }
  } catch (error) {
    console.error("Error joining classroom: ", error);
    setError("Error joining classroom. Please try again.");
    return null;
  }
}

export async function saveGroups(
  roomId,
  newGroups,
  deletedGroups,
  className,
  groupedMembers,
  ungroupedMembers
) {
  const classroomRef = doc(db, "classrooms", roomId);
  const now = new Date().toISOString();

  try {
    const classroomSnapshot = await getDoc(classroomRef);
    const classroomData = classroomSnapshot.exists()
      ? classroomSnapshot.data()
      : {};
    const existingGroups = classroomData.groups || {};
    const existingDeletedGroups = classroomData.deletedGroups || {};

    const combinedDeletedGroups = { ...existingDeletedGroups };

    const findNextAvailableIndex = () => {
      const existingIndexes = Object.keys(combinedDeletedGroups)
        .map((key) => parseInt(key, 10))
        .filter(Number.isInteger);
      const maxIndex =
        existingIndexes.length > 0 ? Math.max(...existingIndexes) : -1;
      return (maxIndex + 1).toString();
    };

    Object.entries(deletedGroups).forEach(([key, group]) => {
      let index = key;
      if (newGroups[index] || combinedDeletedGroups[index]) {
        index = findNextAvailableIndex();
      }

      combinedDeletedGroups[index] = {
        ...group,
        deletedAt: now,
        logMessages: group.logMessages
          ? [...group.logMessages, `Group deleted at ${now}`]
          : [`Group deleted at ${now}`],
      };
    });

    const updatedGroups = Object.entries(newGroups).reduce(async (accPromise, [key, group]) => {
      const acc = await accPromise;

      const memberConsentStatuses = await Promise.all(
        group.members.map(async (memberId) => {
          const userRef = doc(db, "users", memberId);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            return userSnapshot.data().consent === true;
          }
          return false;
        })
      );

      const allMembersDataConsent = memberConsentStatuses.every(status => status === true);

      acc[key] = {
        members: group.members,
        creationMethod: group.creationMethod,
        createdAt: group.createdAt || now,
        updatedAt: now,
        locked: group.locked !== undefined ? group.locked : false,
        logMessages: group.logMessages || [],
        allMembersDataConsent,
      };

      for (const memberId of group.members) {
        const userRef = doc(db, "users", memberId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const updatedGroupIdInClassroom = {
            ...userData.groupIdInClassroom,
            [roomId]: {
              groupId: key,
              members: group.members
            }
          };
          await updateDoc(userRef, { groupIdInClassroom: updatedGroupIdInClassroom });
        }
      }

      return acc;
    },
      Promise.resolve({})
    );

    const safeUngroupedMembers = Array.isArray(ungroupedMembers)
      ? ungroupedMembers
      : [];

    if (safeUngroupedMembers.length > 0) {
      for (const memberId of safeUngroupedMembers) {
        const userRef = doc(db, "users", memberId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const updatedGroupIdInClassroom = { ...userData.groupIdInClassroom };
          delete updatedGroupIdInClassroom[roomId];
          await updateDoc(userRef, {
            groupIdInClassroom: updatedGroupIdInClassroom,
          });
        }
      }
    }

    await updateDoc(classroomRef, {
      groups: await updatedGroups,
      deletedGroups: combinedDeletedGroups,
      groupedMembers: groupedMembers,
      ungroupedMembers: safeUngroupedMembers,
      className,
      updatedAt: now,
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving groups:", error);
    return { success: false, error };
  }
}

export async function getGroups(
  roomId,
  setGroups,
  passedMembers,
  groupSize,
  lockedGroups,
  smartMatch = false
) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    const classroomSnapshot = await getDoc(classroomRef);
    if (classroomSnapshot.exists()) {
      const classroom = classroomSnapshot.data();
      console.log("Getting Groups... :");
      console.log("Set Groups:", setGroups);
      console.log("Locked groups:", lockedGroups);
      console.log("Passed members:", passedMembers);
      console.log("Group size:", groupSize);
      console.log("Smart match is... ", smartMatch);


      let shuffledGroups;
      let groupingData;  // To hold additional data returned by SmartMatch

      if (smartMatch) {
        const students = await Promise.all(
          passedMembers.map(async (memberId) => {
            const member = await getUser(memberId);
            return [
              memberId,
              member.description || "",
              member.idealGroup || "",
              member.availability || [],
            ];
          })
        );


        const smartMatchData = await SmartMatch(students, groupSize);
        groupingData = smartMatchData.result;
        shuffledGroups = {};
        groupingData.groupings.forEach((group, index) => {
          shuffledGroups[index] = {
            members: group,
            creationMethod: "SmartMatch",
            createdAt: new Date().toISOString(),
            logMessages: [`Group created with SmartMatch at ${new Date().toISOString()}`],
          };
        });

        console.log("Grouping data:", groupingData);
        console.log("Shuffled groups after smart match:", shuffledGroups);
      } else {
        shuffledGroups = await randomizeGroups(passedMembers, groupSize);
        console.log("Shuffled groups after randomization:", shuffledGroups);
      }

      const combinedGroups = { ...lockedGroups };

      let availableIndices = new Set([
        ...Array(
          Object.keys(shuffledGroups).length + Object.keys(lockedGroups).length
        ).keys(),
      ]);

      Object.keys(lockedGroups).forEach((index) => {
        availableIndices.delete(parseInt(index));
      });

      let availableIndexArray = Array.from(availableIndices).sort(
        (a, b) => a - b
      );

      Object.entries(shuffledGroups).forEach(([key, group]) => {
        if (group && availableIndexArray.length > 0) {
          const index = availableIndexArray.shift();
          combinedGroups[index] = group;
        }
      });

      const allMemberIds = classroom.members || [];
      const groupedMembers = Object.values(combinedGroups).flatMap(
        (group) => group.members
      );

      const ungroupedMembers = Array.isArray(allMemberIds)
        ? allMemberIds.filter((id) => !groupedMembers.includes(id))
        : [];

      const safeUngroupedMembers = Array.isArray(ungroupedMembers)
        ? ungroupedMembers
        : [];

      const deletedGroups = {};

      console.log("Combined groups:", combinedGroups);
      await saveGroups(
        roomId,
        combinedGroups,
        deletedGroups,
        classroom.className,
        groupedMembers,
        safeUngroupedMembers
      );

      setGroups(combinedGroups);

      if (smartMatch && groupingData) {
        await saveGroupingData(roomId, groupingData);
      }

      return shuffledGroups;
    } else {
      console.error("Classroom document does not exist");
      return null;
    }
  } catch (error) {
    console.error("Error getting groups:", error);
    return null;
  }
}

async function saveGroupingData(roomId, groupingData) {
  const groupingDataRef = doc(db, "grouping_data", roomId);
  const smartMatchId = generateUUID();
  const smartMatchRef = collection(groupingDataRef, smartMatchId);
  const now = new Date().toISOString();
  const timestamp = now.replace(/[:\-T.]/g, "");

  try {
    const smartMatchDoc = doc(smartMatchRef, timestamp);

    // Flatten the nested arrays in groupingData
    const flattenedGroupings = groupingData.groupings.reduce((acc, group, index) => {
      group.forEach((member, memberIndex) => {
        acc[`group_${index}_member_${memberIndex}`] = member;
      });
      return acc;
    }, {});

    const flattenedTeamworkCompatibilities = groupingData.teamwork_compatibilities.reduce((acc, compatibility, index) => {
      acc[`teamwork_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const flattenedIndividualTeamworkCompatibilities = groupingData.individual_teamwork_compatibilities.reduce((acc, compatibility, index) => {
      acc[`individual_teamwork_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const flattenedPersonalityCompatibilities = groupingData.personality_compatibilities.reduce((acc, compatibility, index) => {
      acc[`personality_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const flattenedIndividualPersonalityCompatibilities = groupingData.individual_personality_compatibilities.reduce((acc, compatibility, index) => {
      acc[`individual_personality_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const flattenedAvailabilityCompatibilities = groupingData.availability_compatibilities.reduce((acc, compatibility, index) => {
      acc[`availability_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const flattenedIndividualAvailabilityCompatibilities = groupingData.individual_availability_compatibilities.reduce((acc, compatibility, index) => {
      acc[`individual_availability_compatibility_${index}`] = compatibility;
      return acc;
    }, {});

    const dataToSave = {
      ...flattenedGroupings,
      ...flattenedTeamworkCompatibilities,
      ...flattenedIndividualTeamworkCompatibilities,
      ...flattenedPersonalityCompatibilities,
      ...flattenedIndividualPersonalityCompatibilities,
      ...flattenedAvailabilityCompatibilities,
      ...flattenedIndividualAvailabilityCompatibilities,
      group_compatibilities: groupingData.group_compatibilities,
      createdAt: now,
    };

    await setDoc(smartMatchDoc, dataToSave);

    console.log("Grouping data saved successfully");
  } catch (error) {
    console.error("Error saving grouping data:", error);
  }
}


function generateUUID() {
  let d = new Date().getTime();
  let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export async function saveClassname(roomId, className) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    await updateDoc(classroomRef, { className });
  } catch (error) {
    console.error("Error saving class name:", error);
  }
}

export async function createUser(firstName, lastName, userId, userType, email) {
  try {
    await setDoc(doc(db, "users", userId), {
      firstName,
      lastName,
      userType,
      email,
      age: "",
      gender: "",
      ethnicity: "",
      major: "",
      classYear: "",
      description: "",
      idealGroup: "",
      availability: [],
      classroomCodes: [],
      groupIdInClassroom: {},
      profileComplete: false,
      instructorsWithAccess: [],
    });
    return { id: userId, data: { firstName, lastName, userType } };
  } catch (error) {
    console.error("Error creating user: ", error);
    return null;
  }
}

export async function getUser(userId) {

  const userRef = doc(db, "users", userId);

  try {
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();

      const result = {
        id: userSnapshot.id,
        ...data,
        availability: Array.isArray(data.availability) ? data.availability : [],
      };

      return result;
    } else {
      console.log("User not found for userId:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data for userId:", userId, error);
    throw error;
  }
}


export async function updateUser(userId, data) {
  try {
    await updateDoc(doc(db, "users", userId), data);
    await checkProfileCompletion(userId);
  } catch (error) {
    console.error("Error updating user: ", error);
  }
}

export async function removeMemberFromClassroom(roomId, userId) {
  const classroomRef = doc(db, "classrooms", roomId);
  const userRef = doc(db, "users", userId);

  try {
    const classroomSnapshot = await getDoc(classroomRef);
    if (classroomSnapshot.exists()) {
      const classroomData = classroomSnapshot.data();
      const updatedMembers = classroomData.members.filter(
        (member) => member !== userId
      );
      const updatedGroupedMembers = classroomData.groupedMembers.filter(
        (member) => member !== userId
      );
      const updatedUngroupedMembers = classroomData.ungroupedMembers.filter(
        (member) => member !== userId
      );
      const updatedGroups = Object.fromEntries(
        Object.entries(classroomData.groups).map(([key, group]) => [
          key,
          {
            ...group,
            members: group.members.filter((member) => member !== userId),
          },
        ])
      );

      await updateDoc(classroomRef, {
        members: updatedMembers,
        groupedMembers: updatedGroupedMembers,
        ungroupedMembers: updatedUngroupedMembers,
        groups: updatedGroups,
      });

      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedClassroomCodes = userData.classroomCodes.filter(
          (code) => code !== roomId
        );
        const updatedGroupedInClassroom = { ...userData.groupedInClassroom };
        const updatedGroupIdInClassroom = { ...userData.groupIdInClassroom };
        delete updatedGroupedInClassroom[roomId];
        delete updatedGroupIdInClassroom[roomId];

        await updateDoc(userRef, {
          classroomCodes: updatedClassroomCodes,
          groupedInClassroom: updatedGroupedInClassroom,
          groupIdInClassroom: updatedGroupIdInClassroom,
        });
      }
    }
  } catch (error) {
    console.error("Error removing member from classroom: ", error);
  }
}

export async function updateClassroomState(roomId, newState) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    await updateDoc(classroomRef, { state: newState });
  } catch (error) {
    console.error("Error updating classroom state: ", error);
  }
}

export async function saveClassroomSettings(roomId, settings) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    console.log("Saving classroom settings: ", settings);
    await updateDoc(classroomRef, settings);
    return { success: true };
  } catch (error) {
    console.error("Error saving classroom settings: ", error);
    return { success: false, error };
  }
}


export const archiveClassroom = async (roomId) => {
  try {
    const db = getFirestore();
    const classroomRef = doc(db, "classrooms", roomId);
    const classroomSnapshot = await getDoc(classroomRef);

    if (classroomSnapshot.exists()) {
      const classroomData = classroomSnapshot.data();

      const archiveRef = doc(db, "classroomArchive", roomId);
      await setDoc(archiveRef, {
        ...classroomData,
        archivedAt: new Date().toISOString()
      });

      await deleteDoc(classroomRef);

      console.log("Classroom archived successfully");
    } else {
      console.error("Classroom does not exist.");
    }
  } catch (error) {
    console.error("Error archiving classroom: ", error);
    throw error;
  }
};

export async function checkProfileCompletion(userId) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();

    const isComplete =
      userData &&
      typeof userData.firstName === "string" &&
      userData.firstName.trim() !== "" &&
      typeof userData.lastName === "string" &&
      userData.lastName.trim() !== "" &&
      typeof userData.age === "string" &&
      userData.age.trim() !== "" &&
      typeof userData.gender === "string" &&
      userData.gender.trim() !== "" &&
      typeof userData.ethnicity === "string" &&
      userData.ethnicity.trim() !== "" &&
      typeof userData.major === "string" &&
      userData.major.trim() !== "" &&
      typeof userData.classYear === "string" &&
      userData.classYear.trim() !== "" &&
      typeof userData.description === "string" &&
      userData.description.trim() !== "" &&
      typeof userData.idealGroup === "string" &&
      userData.idealGroup.trim() !== "" &&
      Array.isArray(userData.availability) &&
      userData.availability.length > 0;

    if (isComplete !== userData.profileComplete) {
      await updateDoc(userRef, { profileComplete: isComplete });
    }

    return isComplete;
  } else {
    console.error("User does not exist");
    return false;
  }
}


export async function getArchivedClassroomsForInstructor(instructorId) {
  try {
    const archiveCollectionRef = collection(db, "classroomArchive");
    const querySnapshot = await getDocs(archiveCollectionRef);
    const archivedClassrooms = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.instructorId === instructorId) {
        archivedClassrooms.push({ id: doc.id, ...data });
      }
    });

    return archivedClassrooms;
  } catch (error) {
    console.error("Error fetching archived classrooms for instructor: ", error);
    return [];
  }
}