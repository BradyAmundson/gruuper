import React, { useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { createClassroom, joinClassroom, getUser } from "../firebase/firestoreService";
import PhotoBanner from "../components/PhotoBanner";

import "./styles/Home.css";

function Home() {
  const [error, setError] = React.useState(null);
  const [profileIncomplete, setProfileIncomplete] = React.useState(false); // Track if the profile is incomplete
  const navigate = useNavigate();
  const hasCalledAPI = useRef(false);

  const createClass = () => {
    const newRoomId = nanoid(5);
    const creator = localStorage.getItem("userId");
    createClassroom(newRoomId, creator);
    navigate(`/classroom?roomId=${newRoomId}`);
  };

  const joinClass = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");

    // Fetch user data to check if the profile is complete
    const userData = await getUser(userId);
    if (!userData.profileComplete) {
      setError("Complete your profile in order to join a class!");
      setProfileIncomplete(true); // Set profileIncomplete to true if the profile is not complete
      return;
    }

    const roomId = document.getElementById("roomId").value;
    const response = await joinClassroom(roomId, userId, setError);
    if (!response) {
      setProfileIncomplete(false); // Set profileIncomplete to false for any other errors
      return;
    }
    navigate(`/classroom?roomId=${roomId}`);
  };

  const handleRedirectToProfile = () => {
    navigate("/edit-profile");
  };

  useEffect(() => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const testSmartMatch = async () => {
      try {
        console.log("Starting SmartMatch 2.0 Grouping Test...");
        // const result = await SmartMatch();
        // console.log("SmartMatch 2.0 Grouping Result: SMARTMATRCG", result);
      } catch (error) {
        console.error("Error in SmartMatch 2.0:", error);
      }
    };

    testSmartMatch();
  }, []);

  return (
    <div>
      <PhotoBanner />

      <div className="form-container">
        {localStorage.getItem("userType") === "Professor" ? (
          <Typography className="title-header" variant="h4">
            Join or Create a Class
          </Typography>
        ) : (
          <Typography className="title-header" variant="h4">
            Join a Class
          </Typography>
        )}
        <Typography className="error-text" variant="body1">
          {error}
        </Typography>
        <form onSubmit={joinClass} className="join-class-form">
          <TextField
            id="roomId"
            label="Class Code"
            type="search"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button
            className="join-class-button"
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
          >
            Join a Class
          </Button>
        </form>
        {profileIncomplete && ( // Only show the button if the profile is incomplete
          <Button
            className="create-class-button"
            variant="contained"
            color="primary"
            onClick={handleRedirectToProfile}
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Complete Profile
          </Button>
        )}
        {localStorage.getItem("userType") === "Professor" ? (
          <>
            <Typography variant="h6" className="separator-text">
              or
            </Typography>
            <Button
              className="create-class-button"
              variant="contained"
              color="primary"
              onClick={createClass}
              fullWidth
            >
              Create a Class
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Home;
