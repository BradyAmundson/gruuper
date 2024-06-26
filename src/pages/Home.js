import React from "react";
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
    const creator = localStorage.getItem("userId");
    createClassroom(newRoomId, creator);
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
