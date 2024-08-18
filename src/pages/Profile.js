import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { ResetPassword, SignOut } from "../firebase/authService";
import { getUser } from "../firebase/firestoreService";
import { uploadProfileImage } from "../firebase/firebaseStorage";
import {
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/LockReset";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";

function Profile() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = localStorage.getItem("userId");
        if (currentUser) {
          const userDataFromFirebase = await getUser(currentUser);
          setUserData(userDataFromFirebase);
          if (userDataFromFirebase && userDataFromFirebase.profileImageUrl) {
            setProfileImage(userDataFromFirebase.profileImageUrl);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = async (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (file) {
      const userId = localStorage.getItem("userId");
      const downloadURL = await uploadProfileImage(file, userId);
      if (downloadURL) {
        setProfileImage(downloadURL);
      }
    }
    setIsLoading(false);
  };

  const renderAvailability = (availability) => {
    if (!availability || availability.length === 0) return "None";

    return availability.map((slot, index) => {
      if (slot.start && slot.start.seconds && slot.end && slot.end.seconds) {
        // Handle Firebase Timestamp format
        const startDate = new Date(slot.start.seconds * 1000);
        const endDate = new Date(slot.end.seconds * 1000);

        const dayOptions = { weekday: "long" };
        const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };

        const day = startDate.toLocaleDateString(undefined, dayOptions);
        const startTime = startDate.toLocaleTimeString(undefined, timeOptions);
        const endTime = endDate.toLocaleTimeString(undefined, timeOptions);

        return (
          <Typography key={index} variant="body1">
            <strong>{day}:</strong> {startTime} - {endTime}
          </Typography>
        );
      } else if (slot.startTime && slot.endTime && slot.day) {
        // Handle string format
        const formattedDay = slot.day; // Day is already a string like 'Sunday'
        const formattedStartTime = moment(slot.startTime, "HH:mm").format("h:mm A");
        const formattedEndTime = moment(slot.endTime, "HH:mm").format("h:mm A");

        return (
          <Typography key={index} variant="body1">
            <strong>{formattedDay}:</strong> {formattedStartTime} - {formattedEndTime}
          </Typography>
        );
      } else {
        // Handle invalid slot data
        console.warn("Invalid slot data", slot);
        return null;
      }
    }).filter(slot => slot !== null); // Filter out any null slots
  };



  return (
    <Container maxWidth="md">
      <Grid container sx={{ marginTop: "0rem" }}>
        <Grid item xs={12} sx={{ marginBottom: "-2rem" }}>
          <Paper elevation={3} style={paperStyle}>
            <div style={avatarContainerStyle}>
              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <CircularProgress color="primary" />
                </div>
              )}
              <Avatar
                alt="Profile Picture"
                src={profileImage || ""}
                style={{
                  width: "100px",
                  height: "100px",
                  marginBottom: "1rem",
                  opacity: isLoading ? 0 : 1, // Hide the Avatar if loading
                }}
              />
              <label htmlFor="profile-image-input" style={editIconStyle}>
                <EditIcon />
                <input
                  type="file"
                  accept="image/*"
                  id="profile-image-input"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
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
              Hello, {userData?.firstName || "User"}{" "}
              {userData?.lastName || "Name"}!
            </Typography>
            <Typography variant="body1" paragraph>
              You are currently registered as a{" "}
              {userData?.userType || "user type"}.
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
                  Age: {userData.age || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Gender: {userData.gender || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Ethnicity: {userData.ethnicity || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Major: {userData.major || "Not specified"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Class Year: {userData.classYear || "Not specified"}
                </Typography>
                <Typography variant="body1">
                  Availability:
                </Typography>
                {userData && userData.availability ? renderAvailability(userData.availability) : (
                  <Typography variant="body1">None</Typography>
                )}
                <Typography variant="body1" style={{ marginTop: '1rem' }} paragraph>
                  Description: {userData.description || "Not provided"}
                </Typography>
                <Typography variant="body1" paragraph>
                  Ideal Group: {userData.idealGroup || "Not provided"}
                </Typography>
                <Divider style={{ margin: "1rem 0" }} />
              </>
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <CircularProgress color="primary" />
              </div>
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


