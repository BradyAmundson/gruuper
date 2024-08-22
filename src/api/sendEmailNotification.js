/**
 * Sends bulk emails using the Flask API.
 * @param {Array<string>} recipients - An array of recipient email addresses.
 * @param {string} subject - The subject of the email.
 * @param {string} content - The HTML content of the email.
 * @returns {Promise} - A promise that resolves when the emails are sent.
 */
import { getDocument, getUser } from "../firebase/firestoreService";
export const sendBulkEmails = async (roomId, subject, content) => {
  const recipients = [];
  const classroom = await getDocument("classrooms", roomId);
  console.log("classroom", classroom);
  const members = classroom.members;
  for (const user of members) {
    const userData = await getUser(user);
    const email = userData?.email;
    recipients.push(email);
  }

  try {
    const response = await fetch(
      "https://smartmatch-vmlt.onrender.com/api/send-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    console.log("Emails sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};
