import React from "react";
import { Container, Typography, Paper, Avatar, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";

function Profile() {
  const paperStyle = {
    padding: "2rem",
    margin: "2rem", // Add a margin of 2rem to the paper
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  };

  const avatarStyle = {
    backgroundColor: "#4caf50",
    width: "100px",
    height: "100px",
    marginBottom: "1rem",
  };

  const editButtonStyle = {
    marginTop: "1rem",
    transition: "transform 0.2s", // Add a transition effect to the button
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={paperStyle}>
        <Avatar style={avatarStyle}>
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Hello, {localStorage.getItem("firstName")}{" "}
          {localStorage.getItem("lastName")}!
        </Typography>
        <Typography variant="body1" paragraph>
          You are currently registered as a {localStorage.getItem("userType")}.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          style={editButtonStyle}
          onMouseEnter={(event) => {
            event.target.style.transform = "scale(.95)";
          }}
          onMouseLeave={(event) => {
            event.target.style.transform = "scale(1)";
          }}
        >
          Edit Profile
        </Button>
      </Paper>
    </Container>
  );
}

export default Profile;
