import { db } from "./firebase";
import {
  collection,
  query,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { randomizeGroups } from "../components/GroupRandomizer.js";

export async function createClassroom(roomId, creatorId) {
  console.log(roomId);
  await setDoc(doc(db, "classrooms", roomId), {
    members: [],
    instructor: creatorId,
  })
    .then(async () => {
      const userDoc = await getDoc(doc(db, "users", creatorId));
      const user = userDoc.data();
      const classroomCodes = user.classroomCodes || [];
      await updateDoc(doc(db, "users", creatorId), {
        classroomCodes: [...classroomCodes, roomId],
      });
      return { roomId };
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
      return null;
    });
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
}

// export async function getGroups(roomId, setGroups, passedMembers, groupSize) {
//   const documentRef = doc(db, "classrooms", roomId);
//   const documentSnapshot = await getDoc(documentRef);
//   if (documentSnapshot.exists()) {
//     const classroom = documentSnapshot.data();
//     const members = classroom.members;
//     // const randomGroups = randomizeGroups(members, groupSize);
//     const randomGroups = randomizeGroups(passedMembers, groupSize);
//     await updateDoc(documentRef, { groups: randomGroups });
//     setGroups(randomGroups);
//   } else {
//     return null;
//   }
// }


// export async function saveGroups(roomId, groups, className) {
//   const documentRef = doc(db, "classrooms", roomId);
//   await updateDoc(documentRef, { groups: groups, className: className });
// }

export async function saveGroups(roomId, groups, className) {
  const documentRef = doc(db, "classrooms", roomId);
  try {
    await updateDoc(documentRef, { groups: groups, className: className });
    return { success: true };
  } catch (error) {
    console.error("Error saving groups:", error);
    return { success: false, error };
  }
}

export async function getGroups(roomId, setGroups, passedMembers, groupSize, lockedGroups) {
  const documentRef = doc(db, "classrooms", roomId);
  try {
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const classroom = documentSnapshot.data();
      const members = classroom.members;
      const randomGroups = randomizeGroups(passedMembers, groupSize);
      console.log("getGroups passedLocked Groups", lockedGroups);
      console.log("getGroups Random Groups", randomGroups);

      const combinedGroups = { ...lockedGroups };
      console.log("getGroups Locked Groups", combinedGroups);

      let availableIndices = new Set([...Array(Object.keys(randomGroups).length + Object.keys(lockedGroups).length).keys()]);
      Object.keys(lockedGroups).forEach(index => availableIndices.delete(parseInt(index)));
      let availableIndexArray = Array.from(availableIndices).sort((a, b) => a - b);

      // Place random groups in the first available indices not occupied by locked groups
      Object.entries(randomGroups).forEach(([key, group]) => {
        if (group && group.length > 0 && availableIndexArray.length > 0) {
          combinedGroups[availableIndexArray.shift()] = group;
        }
      });

      // Save the new groups structure to the database
      await saveGroups(roomId, combinedGroups, classroom.className);
      // Update the groups state in the UI
      setGroups(combinedGroups);
      return randomGroups;
    } else {
      console.error("Classroom document does not exist");
      return null;
    }
  } catch (error) {
    console.error("Error getting groups:", error);
    return null;
  }
}


export async function saveClassname(roomId, className) {
  const documentRef = doc(db, "classrooms", roomId);
  await updateDoc(documentRef, { className: className });
}

export async function createUser(firstName, lastName, userId, userType) {
  await setDoc(doc(db, "users", userId), {
    firstName: firstName,
    lastName: lastName,
    userType: userType,
    mayor: '',
    classYear: '',
    nightOrMorning: '',
    socialPreference: '',
    deadlineBehavior: '',
    unavailableTimes: [],
    classroomCodes: [],
  })
    .then(() => {
      return { id: userId, data: { firstName, lastName, userType } };
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
      return null;
    });
}

export async function getUser(userId) {
  const documentRef = doc(db, "users", userId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    return { id: documentSnapshot.id, ...documentSnapshot.data() };
  } else {
    return null;
  }
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, "users", userId), data);
}

export async function removeMemberFromClassroom(roomId, userId) {
  const documentRef = doc(db, "classrooms", roomId);
  const userRef = doc(db, "users", userId);

  try {
    // Get current classroom data
    const classroomSnapshot = await getDoc(documentRef);
    if (classroomSnapshot.exists()) {
      const classroomData = classroomSnapshot.data();
      const updatedMembers = classroomData.members.filter(member => member !== userId);
      await updateDoc(documentRef, { members: updatedMembers });

      // Optionally update user's classroom codes
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedClassroomCodes = userData.classroomCodes.filter(code => code !== roomId);
        await updateDoc(userRef, { classroomCodes: updatedClassroomCodes });
      }

      console.log("Member removed from classroom.");
    }
  } catch (error) {
    console.error("Error removing member: ", error);
  }
}
