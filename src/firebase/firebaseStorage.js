import { db, storage } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Function to upload image and update user document
export async function uploadProfileImage(file, userId) {
  const storageRef = ref(storage, `profileImages/${userId}`);

  try {
    // Upload the file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update user document with the URL
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      profileImageUrl: downloadURL,
    });

    return downloadURL; // Return the URL to update the local state or UI
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}
