/**
 * Sends bulk emails using the Flask API.
 * @param {Array<string>} recipients - An array of recipient email addresses.
 * @param {string} subject - The subject of the email.
 * @param {string} content - The HTML content of the email.
 * @returns {Promise} - A promise that resolves when the emails are sent.
 */
import { getDocument, getUser } from "../firebase/firestoreService";
import { generateToken } from "./tokenFetch";

export const sendBulkEmails = async (roomId, subject, content) => {
  const recipients = [];
  const classroom = await getDocument("classrooms", roomId);
  const members = classroom.members;
  for (const user of members) {
    const userData = await getUser(user);
    const email = userData?.email;
    if (email) recipients.push(email);
  }

  try {
    const token = await generateToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const response = await fetch(
      "https://smartmatch-zj2w.onrender.com/send-emails",
      {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          recipients,
          subject,
          content,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};
