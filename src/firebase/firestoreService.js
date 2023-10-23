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
} from "firebase/firestore";

export async function createClassroom(classId) {
  console.log(classId);
  await setDoc(doc(db, "classrooms", classId), { members: [] })
    .then(() => {
      return { classId };
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

export async function joinClassroom(classId, name) {
  const documentRef = doc(db, "classrooms", classId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    const members = documentSnapshot.data().members;
    members.push(name);
    await setDoc(documentRef, { members: members });
  } else {
    return null;
  }
}
