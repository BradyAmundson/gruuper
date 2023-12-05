import React from "react";
import GroupRandomizer from "../components/GroupRandomizer";
import PhotoBanner from "../components/PhotoBanner";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { createClassroom, joinClassroom } from "../firebase/firestoreService";

import "./styles/Home.css";

function Home() {
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const createClass = () => {
    const newRoomId = nanoid(5);
    createClassroom(newRoomId);
    navigate(`/classroom?roomId=${newRoomId}`);
  };

  const joinClass = async (event) => {
    event.preventDefault();
    const roomId = document.getElementById("roomId").value;
    const userId = localStorage.getItem("userId");
    const response = await joinClassroom(roomId, userId, setError);
    if (!response) {
      return;
    }
    navigate(`/classroom?roomId=${roomId}`);
  };

  return (
    <div>
      <PhotoBanner />
      <div className="banner-text-container">
        <Typography className="welcome-text" variant="h2">
          Welcome to Gruuper!
        </Typography>
      </div>

      <div className="form-container">
        <Typography variant="h4">Join or Create a Class</Typography>
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
        <Typography variant="h6" className="separator-text">
          or
        </Typography>
        <Button
          className="create-class-button"
          variant="contained"
          color="lightBlue"
          onClick={createClass}
          fullWidth
        >
          Create a Class
        </Button>
      </div>
    </div>
  );
}

export default Home;
