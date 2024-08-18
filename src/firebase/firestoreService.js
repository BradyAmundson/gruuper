


import { db } from "./firebase";
import {
  getDoc,
  setDoc,
  getFirestore,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { randomizeGroups } from "../components/GroupRandomizer.js";
import { optimizeGroups } from "../components/SmartMatch.js";

export async function createClassroom(roomId, creatorId, courseNumber = "", gradeLevel = "") {
  try {
    const creatorDoc = await getDoc(doc(db, "users", creatorId));
    const creator = creatorDoc.data();
    const classroomName = `${creator.firstName} ${creator.lastName}'s Class`;

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
      groupingStartDeadline: defaultDeadline.toISOString().slice(0, 16), // Set default deadline
      courseNumber: courseNumber,   // Added courseNumber
      gradeLevel: gradeLevel,       // Added gradeLevel
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



// Get a document from a specific collection
export async function getDocument(collectionName, documentId) {
  const documentRef = doc(db, collectionName, documentId);
  const documentSnapshot = await getDoc(documentRef);

  if (documentSnapshot.exists()) {
    return { id: documentSnapshot.id, ...documentSnapshot.data() };
  } else {
    return null;
  }
}

// Join a classroom
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
      const members = documentSnapshot.data().members;
      const currentCodes = usrDocumentSnapshot.data().classroomCodes || [];
      if (currentCodes.includes(roomId)) {
        return roomId;
      }
      const updatedCodes = [...currentCodes, roomId];
      members.push(userId);
      await updateDoc(documentRef, { members: members });
      await updateDoc(usrDocumentRef, {
        classroomCodes: updatedCodes,
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


export async function saveGroups(roomId, newGroups, deletedGroups, className, groupedMembers, ungroupedMembers) {
  const classroomRef = doc(db, "classrooms", roomId);
  const now = new Date().toISOString();

  try {
    const classroomSnapshot = await getDoc(classroomRef);
    const classroomData = classroomSnapshot.exists() ? classroomSnapshot.data() : {};
    const existingGroups = classroomData.groups || {};
    const existingDeletedGroups = classroomData.deletedGroups || {};

    // Combine existing deleted groups with the new ones
    const combinedDeletedGroups = { ...existingDeletedGroups };

    // Helper function to find the next available index in combinedDeletedGroups
    const findNextAvailableIndex = () => {
      const existingIndexes = Object.keys(combinedDeletedGroups).map(key => parseInt(key, 10)).filter(Number.isInteger);
      const maxIndex = existingIndexes.length > 0 ? Math.max(...existingIndexes) : -1;
      return (maxIndex + 1).toString();
    };

    // Handle indexing for deleted groups
    Object.entries(deletedGroups).forEach(([key, group]) => {
      let index = key;

      // If the index already exists in newGroups or combinedDeletedGroups, find a new index
      if (newGroups[index] || combinedDeletedGroups[index]) {
        index = findNextAvailableIndex();
      }

      combinedDeletedGroups[index] = {
        ...group,
        deletedAt: now,
        logMessages: group.logMessages ? [...group.logMessages, `Group deleted at ${now}`] : [`Group deleted at ${now}`],
      };
    });

    // Prepare the updated groups and update groupIdInClassroom for each user
    const updatedGroups = Object.entries(newGroups).reduce(async (accPromise, [key, group]) => {
      const acc = await accPromise;
      acc[key] = {
        members: group.members,
        creationMethod: group.creationMethod,
        createdAt: group.createdAt || now,
        updatedAt: now,
        logMessages: group.logMessages || [],
      };

      // Update groupIdInClassroom for each member of this group
      for (const memberId of group.members) {
        const userRef = doc(db, "users", memberId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const updatedGroupIdInClassroom = { ...userData.groupIdInClassroom, [roomId]: key };
          await updateDoc(userRef, { groupIdInClassroom: updatedGroupIdInClassroom });
        }
      }

      return acc;
    }, Promise.resolve({}));

    // Update ungrouped members' groupIdInClassroom
    for (const memberId of ungroupedMembers) {
      const userRef = doc(db, "users", memberId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedGroupIdInClassroom = { ...userData.groupIdInClassroom };
        delete updatedGroupIdInClassroom[roomId];
        await updateDoc(userRef, { groupIdInClassroom: updatedGroupIdInClassroom });
      }
    }

    await updateDoc(classroomRef, {
      groups: await updatedGroups,
      deletedGroups: combinedDeletedGroups,
      groupedMembers: groupedMembers,
      ungroupedMembers: ungroupedMembers,
      className,
      updatedAt: now,
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving groups:", error);
    return { success: false, error };
  }
}


// Get and possibly create groups
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

      let shuffledGroups = await randomizeGroups(passedMembers, groupSize);
      if (smartMatch) {
        shuffledGroups = await optimizeGroups(passedMembers, groupSize);
      }

      const combinedGroups = { ...lockedGroups };

      let availableIndices = new Set([
        ...Array(
          Object.keys(shuffledGroups).length + Object.keys(lockedGroups).length
        ).keys(),
      ]);
      Object.keys(lockedGroups).forEach((index) =>
        availableIndices.delete(parseInt(index))
      );
      let availableIndexArray = Array.from(availableIndices).sort(
        (a, b) => a - b
      );

      // Place random groups in the first available indices not occupied by locked groups
      Object.entries(shuffledGroups).forEach(([key, group]) => {
        if (group && group.length > 0 && availableIndexArray.length > 0) {
          const index = availableIndexArray.shift();
          combinedGroups[index] = group;
        }
      });

      // Save the new groups structure to the database
      await saveGroups(roomId, combinedGroups, classroom.className);
      // Update the groups state in the UI
      setGroups(combinedGroups);

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


// Save class name
export async function saveClassname(roomId, className) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    await updateDoc(classroomRef, { className });
  } catch (error) {
    console.error("Error saving class name:", error);
  }
}

// Create a new user with demographic and availability data
export async function createUser(firstName, lastName, userId, userType) {
  try {
    await setDoc(doc(db, "users", userId), {
      firstName,
      lastName,
      userType,
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
    });
    return { id: userId, data: { firstName, lastName, userType } };
  } catch (error) {
    console.error("Error creating user: ", error);
    return null;
  }
}

// Get a user document by userId
export async function getUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);
  if (userSnapshot.exists()) {
    const data = userSnapshot.data();
    return {
      id: userSnapshot.id,
      ...data,
      availability: Array.isArray(data.availability) ? data.availability : [], // Ensure it's an array
    };
  } else {
    return null;
  }
}

// Update user data
export async function updateUser(userId, data) {
  try {
    await updateDoc(doc(db, "users", userId), data);
    await checkProfileCompletion(userId); // Check if the profile is complete after updating
  } catch (error) {
    console.error("Error updating user: ", error);
  }
}

// Remove a member from a classroom
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



export const deleteClassroom = async (roomId) => {
  try {
    const db = getFirestore();
    const classroomRef = doc(db, "classrooms", roomId); // Get the document reference
    await deleteDoc(classroomRef); // Delete the document
    console.log("Classroom deleted successfully");
  } catch (error) {
    console.error("Error deleting classroom: ", error);
    throw error;
  }
};


export async function checkProfileCompletion(userId) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();

    const isComplete = userData &&
      typeof userData.firstName === 'string' && userData.firstName.trim() !== '' &&
      typeof userData.lastName === 'string' && userData.lastName.trim() !== '' &&
      typeof userData.age === 'string' && userData.age.trim() !== '' &&
      typeof userData.gender === 'string' && userData.gender.trim() !== '' &&
      typeof userData.ethnicity === 'string' && userData.ethnicity.trim() !== '' &&
      typeof userData.major === 'string' && userData.major.trim() !== '' &&
      typeof userData.classYear === 'string' && userData.classYear.trim() !== '' &&
      typeof userData.description === 'string' && userData.description.trim() !== '' &&
      typeof userData.idealGroup === 'string' && userData.idealGroup.trim() !== '' &&
      Array.isArray(userData.availability) && userData.availability.length > 0;


    if (isComplete !== userData.profileComplete) {
      await updateDoc(userRef, { profileComplete: isComplete });
    }

    return isComplete;
  } else {
    console.error("User does not exist");
    return false;
  }
}
