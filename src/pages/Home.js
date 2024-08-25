import React, { useEffect, useRef } from "react";
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
  const hasCalledAPI = useRef(false);

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

  useEffect(() => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const testStudents = [
      {
        id: 200,
        description:
          "I love web development and enjoy building responsive applications.",
        idealGroup: "I prefer working with a backend developer and a designer.",
        availability: [
          { day: "Monday", startTime: "09:00", endTime: "12:00" },
          { day: "Wednesday", startTime: "10:00", endTime: "13:00" },
        ],
      },
      {
        id: 201,
        description:
          "I'm focused on backend development, particularly in API design.",
        idealGroup:
          "I want to work with a frontend developer and a data scientist.",
        availability: [
          { day: "Monday", startTime: "09:00", endTime: "11:00" },
          { day: "Tuesday", startTime: "14:00", endTime: "17:00" },
        ],
      },
      {
        id: 202,
        description: "My passion lies in data science and machine learning.",
        idealGroup:
          "I'd like to team up with a backend developer and a data engineer.",
        availability: [
          { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
          { day: "Thursday", startTime: "09:00", endTime: "12:00" },
        ],
      },
      {
        id: 203,
        description:
          "I have a strong background in UI/UX design and frontend development.",
        idealGroup:
          "I prefer working with a backend developer and a project manager.",
        availability: [
          { day: "Monday", startTime: "13:00", endTime: "16:00" },
          { day: "Friday", startTime: "08:00", endTime: "11:00" },
        ],
      },
      {
        id: 204,
        description: "I'm interested in AI and machine learning.",
        idealGroup:
          "I'd like to work with a data scientist and a backend developer.",
        availability: [
          { day: "Tuesday", startTime: "09:00", endTime: "12:00" },
          { day: "Friday", startTime: "10:00", endTime: "13:00" },
        ],
      },
    ];

    const all_students = [
      [
        200,
        "I focus on backend development, working with databases, APIs, and server-side logic to build scalable applications.",
        "I’m looking for a frontend developer to create user interfaces and a DevOps specialist to manage deployment and scalability.",
        [
          { day: "Monday", startTime: "09:00", endTime: "12:00" },
          { day: "Thursday", startTime: "13:00", endTime: "16:00" },
          { day: "Friday", startTime: "10:00", endTime: "14:00" },
        ],
      ],
      [
        201,
        "I love web development, especially working with JavaScript and React. I enjoy building interactive and responsive web applications.",
        "I prefer working with a backend developer to manage server-side tasks and a creative designer to ensure a polished user interface.",
        [
          { day: "Monday", startTime: "13:00", endTime: "16:00" },
          { day: "Tuesday", startTime: "09:00", endTime: "11:30" },
          { day: "Thursday", startTime: "14:00", endTime: "18:00" },
        ],
      ],
      [
        202,
        "Cybersecurity fascinates me. I'm always looking into the latest vulnerabilities and security protocols to protect data.",
        "I’m looking to pair with a backend developer to secure the server-side and someone in AI/ML to work on security algorithms.",
        [
          { day: "Monday", startTime: "08:00", endTime: "12:00" },
          { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
          { day: "Friday", startTime: "15:00", endTime: "19:00" },
        ],
      ],
      [
        203,
        "I have a strong interest in data science and big data analytics. I enjoy working with large datasets and extracting meaningful insights.",
        "I’d like to team up with an AI/ML specialist for model development and a software engineer for implementing our findings.",
        [
          { day: "Tuesday", startTime: "13:00", endTime: "17:00" },
          { day: "Thursday", startTime: "08:30", endTime: "11:30" },
          { day: "Friday", startTime: "09:00", endTime: "12:00" },
        ],
      ],
      [
        204,
        "I'm really into software engineering, particularly in agile methodologies and version control systems like Git.",
        "I work well with a frontend developer for user interfaces and a DevOps specialist to ensure smooth deployment.",
        [
          { day: "Monday", startTime: "11:00", endTime: "13:00" },
          { day: "Wednesday", startTime: "14:00", endTime: "17:00" },
          { day: "Thursday", startTime: "09:00", endTime: "12:00" },
        ],
      ],
      [
        205,
        "Game development is my passion. I love designing and coding games, especially using Unity and Unreal Engine.",
        "I’d love to work with a creative designer for visuals and a backend developer to manage game mechanics.",
        [
          { day: "Tuesday", startTime: "10:00", endTime: "14:00" },
          { day: "Wednesday", startTime: "12:00", endTime: "16:00" },
          { day: "Friday", startTime: "08:00", endTime: "11:00" },
        ],
      ],
      [
        206,
        "I'm passionate about artificial intelligence and machine learning. I spend a lot of time working on neural networks and deep learning models.",
        "I want to lead the group and collaborate with a data scientist who can handle data analysis and a backend developer who can integrate our models into the system.",
        [
          { day: "Monday", startTime: "10:00", endTime: "14:00" },
          { day: "Wednesday", startTime: "09:00", endTime: "12:00" },
          { day: "Friday", startTime: "13:00", endTime: "17:00" },
        ],
      ],
    ];

    console.log("Test Students Data before format:", testStudents);

    const formattedStudents = testStudents.map((student) => [
      student.id,
      student.description,
      student.idealGroup,
      student.availability,
    ]);

    console.log("Test Students Data after format:", formattedStudents);
    console.log("all_students:", all_students);

    const groupSize = 2;
    // console.log("Test Students Data JSON.Stringify:", JSON.stringify(all_students, null, 2));

    const testSmartMatch = async () => {
      try {
        console.log("Starting SmartMatch 2.0 Grouping Test...");
        console.log("Test Students Data:", JSON.stringify({ students: testStudents, groupSize: groupSize }));
        const result = await smartMatchGroups(testStudents, groupSize, null, 2);
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
