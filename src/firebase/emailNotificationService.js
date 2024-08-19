import nodemailer from "nodemailer";

// Create a Nodemailer transport object using Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER, // Gmail address from environment variables
    pass: process.env.GMAIL_PASS, // Gmail password or App Password from environment variables
  },
});

// Email options
const mailOptions = {
  from: process.env.GMAIL_USER, // Sender address from environment variables
  to: "bamunds2@lion.lmu.edu", // List of recipients
  subject: "Subject of the email",
  text: "Hello, this is a test email!",
};

// Send an email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
