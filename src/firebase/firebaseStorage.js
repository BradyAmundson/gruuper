import { db, storage } from './firebase';
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Function to upload image and update user document
export async function uploadProfileImage(file, userId) {
    const storageRef = ref(storage, `profileImages/${userId}`);
    console.log("Uploading profile image for user ID:", userId);

    try {
        // Upload the file
        console.log("Starting upload...");
        await uploadBytes(storageRef, file);
        console.log("Upload successful.");

        // Get download URL
        console.log("Retrieving download URL...");
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL retrieved:", downloadURL);

        // Update user document with the URL
        console.log("Updating user document with new image URL...");
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            profileImageUrl: downloadURL,
        });
        console.log("User document updated successfully.");

        return downloadURL; // Return the URL to update the local state or UI
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
}