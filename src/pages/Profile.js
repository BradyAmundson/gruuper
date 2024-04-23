import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { ResetPassword } from "../firebase/authService";
import { getUser } from "../firebase/firestoreService";
import { SignOut } from "../firebase/authService";

import {
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/LockReset";

function Profile() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = localStorage.getItem("userId");
        const userDataFromFirebase = await getUser(currentUser);
        setUserData(userDataFromFirebase);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const paperStyle = {
    padding: "2rem",
    margin: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  };

  const avatarContainerStyle = {
    position: "relative",
  };

  const editIconStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    transform: "translate(50%, -50%)",
    background: "#fff",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 1,
  };

  const editButtonStyle = {
    marginTop: "1rem",
    transition: "transform 0.2s",
    background: "linear-gradient(145deg, #6db3f2, #1e5799)",
    color: "white",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    padding: "12px 36px",
    margin: "10px",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalStyle = {
    content: {
      maxWidth: "25rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
      borderRadius: "10px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  return (
    <Container maxWidth="md">
      <Grid container sx={{ marginTop: "0rem" }}>
        <Grid item xs={12} sx={{ marginBottom: "-2rem" }}>
          <Paper elevation={3} style={paperStyle}>
            <div style={avatarContainerStyle}>
              <Avatar
                alt="Profile Picture"
                src={profileImage ? URL.createObjectURL(profileImage) : ""}
                style={{
                  width: "100px",
                  height: "100px",
                  marginBottom: "1rem",
                }}
                onClick={() => {}}
              />
              <label htmlFor="profile-image-input" style={editIconStyle}>
                <EditIcon />
                <input
                  type="file"
                  accept="image/*"
                  id="profile-image-input"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <Typography
              variant="h4"
              gutterBottom
              style={{
                margin: "10px",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "28px",
                color: "transparent",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundImage: "linear-gradient(145deg, #6db3f2, #1e5799)",
                display: "inline",
              }}
            >
              Hello, {localStorage.getItem("firstName")}{" "}
              {localStorage.getItem("lastName")}!
            </Typography>
            <Typography variant="body1" paragraph>
              You are currently registered as a{" "}
              {localStorage.getItem("userType")}.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              style={editButtonStyle}
              onClick={openModal}
              startIcon={<LockIcon />}
            >
              Reset Password
            </Button>
            <SignOut />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} style={paperStyle}>
            {userData ? (
              <>
                <Divider style={{ margin: "1rem 0" }} />
                <Typography
                  variant="h4"
                  gutterBottom
                  style={{
                    margin: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "28px",
                    color: "transparent",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundImage:
                      "linear-gradient(145deg, #6db3f2, #1e5799)",
                    display: "inline",
                  }}
                >
                  Profile Details:
                </Typography>
                <Typography variant="body1" paragraph>
                  Major: {userData.major || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Class Year: {userData.classYear || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Time Preference: {userData.nightOrMorning || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Social Preference:{" "}
                  {userData.socialPreference || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Deadline Behavior:{" "}
                  {userData.deadlineBehavior || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Unavailable Times:{" "}
                  {userData.unavailableTimes?.join(", ") || "None"}
                </Typography>
                <Divider style={{ margin: "1rem 0" }} />
              </>
            ) : (
              <Typography variant="body1" paragraph>
                Loading...
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              style={editButtonStyle}
              onClick={() => navigate("/edit-profile")}
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
        </Grid>
      </Grid>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={modalStyle}
      >
        <ResetPassword />
      </Modal>
    </Container>
  );
}

export default Profile;
