import React, { useEffect } from "react";
import PhotoBanner from "../components/PhotoBanner";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { createClassroom, joinClassroom } from "../firebase/firestoreService";
import { smartMatchGroups } from "../components/SmartMatch2.js";

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
      s
      return;
    }
    navigate(`/classroom?roomId=${roomId}`);
  };

  useEffect(() => {
    const testStudents = [
      {
        id: "student1",
        description: "I love web development and enjoy building responsive applications.",
        idealGroup: "I prefer working with a backend developer and a designer.",
        availability: [
          { day: "Monday", startTime: "09:00", endTime: "12:00" },
          { day: "Wednesday", startTime: "10:00", endTime: "13:00" },
        ],
      },
      {
        id: "student2",
        description: "I'm focused on backend development, particularly in API design.",
        idealGroup: "I want to work with a frontend developer and a data scientist.",
        availability: [
          { day: "Monday", startTime: "09:00", endTime: "11:00" },
          { day: "Tuesday", startTime: "14:00", endTime: "17:00" },
        ],
      },
      {
        id: "student3",
        description: "My passion lies in data science and machine learning.",
        idealGroup: "I'd like to team up with a backend developer and a data engineer.",
        availability: [
          { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
          { day: "Thursday", startTime: "09:00", endTime: "12:00" },
        ],
      },
      {
        id: "student4",
        description: "I have a strong background in UI/UX design and frontend development.",
        idealGroup: "I prefer working with a backend developer and a project manager.",
        availability: [
          { day: "Monday", startTime: "13:00", endTime: "16:00" },
          { day: "Friday", startTime: "08:00", endTime: "11:00" },
        ],
      },
      {
        id: "student5",
        description: "I'm interested in AI and machine learning.",
        idealGroup: "I'd like to work with a data scientist and a backend developer.",
        availability: [
          { day: "Tuesday", startTime: "09:00", endTime: "12:00" },
          { day: "Friday", startTime: "10:00", endTime: "13:00" },
        ],
      },
    ];

    const groupSize = 2;
    console.log("Test Students Data:", JSON.stringify(testStudents, null, 2));

    const testSmartMatch = async () => {
      try {
        console.log("Starting SmartMatch 2.0 Grouping Test...");
        const result = await smartMatchGroups(testStudents, groupSize);
        console.log("SmartMatch 2.0 Grouping Result:", result);
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
