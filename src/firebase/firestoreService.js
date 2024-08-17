// import { db } from "./firebase";
// import {
//   getDoc,
//   setDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { randomizeGroups } from "../components/GroupRandomizer.js";
// import { optimizeGroups } from "../components/SmartMatch.js";

// export async function createClassroom(roomId, creatorId) {
//   await setDoc(doc(db, "classrooms", roomId), {
//     members: [],
//     instructor: creatorId,
//   })
//     .then(async () => {
//       const userDoc = await getDoc(doc(db, "users", creatorId));
//       const user = userDoc.data();
//       const classroomCodes = user.classroomCodes || [];
//       await updateDoc(doc(db, "users", creatorId), {
//         classroomCodes: [...classroomCodes, roomId],
//       });
//       return { roomId };
//     })
//     .catch((error) => {
//       console.error("Error writing document: ", error);
//       return null;
//     });
// }

// export async function getDocument(collectionName, documentId) {
//   const documentRef = doc(db, collectionName, documentId);
//   const documentSnapshot = await getDoc(documentRef);
//   if (documentSnapshot.exists()) {
//     return { id: documentSnapshot.id, ...documentSnapshot.data() };
//   } else {
//     return null;
//   }
// }

// export async function joinClassroom(roomId, userId, setError) {
//   if (!roomId || !userId) {
//     setError("Invalid classroom code!");
//     return null;
//   }
//   const documentRef = doc(db, "classrooms", roomId);
//   const documentSnapshot = await getDoc(documentRef);
//   const usrDocumentRef = doc(db, "users", userId);
//   const usrDocumentSnapshot = await getDoc(usrDocumentRef);
//   if (documentSnapshot.exists() && usrDocumentSnapshot.exists()) {
//     const members = documentSnapshot.data().members;
//     const currentCodes = usrDocumentSnapshot.data().classroomCodes || [];
//     if (currentCodes.includes(roomId)) {
//       return roomId;
//     }
//     const updatedCodes = [...currentCodes, roomId];
//     members.push(userId);
//     await updateDoc(documentRef, { members: members });
//     await updateDoc(usrDocumentRef, {
//       classroomCodes: updatedCodes,
//     });
//     return roomId;
//   } else {
//     setError("Invalid classroom code!");
//     return null;
//   }
// }

// export async function saveGroups(roomId, groups, className) {
//   const documentRef = doc(db, "classrooms", roomId);
//   try {
//     await updateDoc(documentRef, { groups: groups, className: className });
//     return { success: true };
//   } catch (error) {
//     console.error("Error saving groups:", error);
//     return { success: false, error };
//   }
// }

// export async function getGroups(
//   roomId,
//   setGroups,
//   passedMembers,
//   groupSize,
//   lockedGroups,
//   smartMatch = false
// ) {
//   const documentRef = doc(db, "classrooms", roomId);
//   try {
//     const documentSnapshot = await getDoc(documentRef);
//     if (documentSnapshot.exists()) {
//       const classroom = documentSnapshot.data();

//       let shuffledGroups = await randomizeGroups(passedMembers, groupSize);
//       if (smartMatch) {
//         shuffledGroups = await optimizeGroups(passedMembers, groupSize);
//       }

//       const combinedGroups = { ...lockedGroups };

//       let availableIndices = new Set([
//         ...Array(
//           Object.keys(shuffledGroups).length + Object.keys(lockedGroups).length
//         ).keys(),
//       ]);
//       Object.keys(lockedGroups).forEach((index) =>
//         availableIndices.delete(parseInt(index))
//       );
//       let availableIndexArray = Array.from(availableIndices).sort(
//         (a, b) => a - b
//       );

//       // Place random groups in the first available indices not occupied by locked groups
//       Object.entries(shuffledGroups).forEach(([key, group]) => {
//         if (group && group.length > 0 && availableIndexArray.length > 0) {
//           const index = availableIndexArray.shift();
//           combinedGroups[index] = group;
//         }
//       });

//       // Save the new groups structure to the database
//       await saveGroups(roomId, combinedGroups, classroom.className);
//       // Update the groups state in the UI
//       setGroups(combinedGroups);

//       return shuffledGroups;
//     } else {
//       console.error("Classroom document does not exist");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting groups:", error);
//     return null;
//   }
// }

// export async function saveClassname(roomId, className) {
//   const documentRef = doc(db, "classrooms", roomId);
//   await updateDoc(documentRef, { className: className });
// }

// export async function createUser(firstName, lastName, userId, userType) {
//   await setDoc(doc(db, "users", userId), {
//     firstName: firstName,
//     lastName: lastName,
//     userType: userType,
//     mayor: "",
//     classYear: "",
//     nightOrMorning: "",
//     socialPreference: "",
//     deadlineBehavior: "",
//     unavailableTimes: [],
//     classroomCodes: [],
//   })
//     .then(() => {
//       return { id: userId, data: { firstName, lastName, userType } };
//     })
//     .catch((error) => {
//       console.error("Error writing document: ", error);
//       return null;
//     });
// }

// export async function getUser(userId) {
//   const documentRef = doc(db, "users", userId);
//   const documentSnapshot = await getDoc(documentRef);
//   if (documentSnapshot.exists()) {
//     return { id: documentSnapshot.id, ...documentSnapshot.data() };
//   // } else {/
//     return null;
//   }
// }

// export async function updateUser(userId, data) {
//   await updateDoc(doc(db, "users", userId), data);
// }

// export async function removeMemberFromClassroom(roomId, userId) {
//   const documentRef = doc(db, "classrooms", roomId);
//   const userRef = doc(db, "users", userId);

//   try {
//     // Get current classroom data
//     const classroomSnapshot = await getDoc(documentRef);
//     if (classroomSnapshot.exists()) {
//       const classroomData = classroomSnapshot.data();
//       const updatedMembers = classroomData.members.filter(
//         (member) => member !== userId
//       );
//       await updateDoc(documentRef, { members: updatedMembers });

//       // Optionally update user's classroom codes
//       const userSnapshot = await getDoc(userRef);
//       if (userSnapshot.exists()) {
//         const userData = userSnapshot.data();
//         const updatedClassroomCodes = userData.classroomCodes.filter(
//           (code) => code !== roomId
//         );
//         await updateDoc(userRef, { classroomCodes: updatedClassroomCodes });
//       }
//     }
//   } catch (error) {
//     console.error("Error removing member: ", error);
//   }
// }


import { db } from "./firebase";
import {
  getDoc,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { randomizeGroups } from "../components/GroupRandomizer.js";
import { optimizeGroups } from "../components/SmartMatch.js";

// Create a new classroom
export async function createClassroom(roomId, creatorId) {
  try {
    await setDoc(doc(db, "classrooms", roomId), {
      members: [],
      instructor: creatorId,
    });

    const userDoc = await getDoc(doc(db, "users", creatorId));
    const user = userDoc.data();
    const classroomCodes = user.classroomCodes || [];
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
    const classroomRef = doc(db, "classrooms", roomId);
    const classroomSnapshot = await getDoc(classroomRef);
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (classroomSnapshot.exists() && userSnapshot.exists()) {
      const members = classroomSnapshot.data().members;
      const currentCodes = userSnapshot.data().classroomCodes || [];
      if (currentCodes.includes(roomId)) {
        return roomId;
      }
      members.push(userId);
      await updateDoc(classroomRef, { members });
      await updateDoc(userRef, { classroomCodes: [...currentCodes, roomId] });
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

// Save groups to the classroom
export async function saveGroups(roomId, groups, className) {
  const classroomRef = doc(db, "classrooms", roomId);
  try {
    await updateDoc(classroomRef, { groups, className });
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
      await updateDoc(classroomRef, { members: updatedMembers });

      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedClassroomCodes = userData.classroomCodes.filter(
          (code) => code !== roomId
        );
        await updateDoc(userRef, { classroomCodes: updatedClassroomCodes });
      }
    }
  } catch (error) {
    console.error("Error removing member from classroom: ", error);
  }
}
