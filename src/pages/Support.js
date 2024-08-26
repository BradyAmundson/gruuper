import React from "react";
import "./styles/SupportPage.css";
import { TextField, Button, Typography, Container, Box } from "@mui/material";

const SupportPage = () => {
  return (
    <Container maxWidth="md" className="support-page-container">
      <Typography variant="h4" gutterBottom className="support-title">
        Customer Support
      </Typography>

      <Box className="contact-info">
        <Typography variant="body1" gutterBottom>
          <strong>Support Email:</strong> support@gruuper.app
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Office Hours:</strong> Monday - Friday, 9 AM - 5 PM
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom className="section-title">
        Frequently Asked Questions
      </Typography>
      <Box className="faq-section">
        <Typography variant="subtitle1" gutterBottom>
          <strong>How do I join a classroom?</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          To join a classroom, you'll need a classroom code provided by your
          instructor. Enter the code on the Home page and follow the
          instructions.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>What should I do if I encounter an error?</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          If you encounter an error, try refreshing the page. If the problem
          persists, contact support using the information below.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>How can I reset my password?</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          To reset your password, click on "Reset Password" on the Profile page
          and follow the instructions sent to your email.
        </Typography>
      </Box>
    </Container>
  );
};

export default SupportPage;
