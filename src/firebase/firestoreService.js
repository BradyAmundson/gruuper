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
import { randomizeGroups } from "../components/GroupRandomizer.js"

export async function createClassroom(roomId) {
  console.log(roomId);
  await setDoc(doc(db, "classrooms", roomId), { members: [] })
    .then(() => {
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

export async function joinClassroom(roomId, name) {
  const documentRef = doc(db, "classrooms", roomId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    const members = documentSnapshot.data().members;
    members.push(name);
    await updateDoc(documentRef, { members: members });
  } else {
    return null;
  }
}

export async function getGroups(roomId, setGroups) {
  const documentRef = doc(db, "classrooms", roomId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    const classroom = documentSnapshot.data();
    const randomGroups = randomizeGroups(classroom.members, 2)
    await updateDoc(documentRef, {groups: randomGroups});
    setGroups(randomGroups)
  } else {
    return null;
  }
}
