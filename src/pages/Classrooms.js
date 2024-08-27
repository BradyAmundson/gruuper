import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUser, getDocument, getArchivedClassroomsForInstructor } from "../firebase/firestoreService";

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [archivedClassrooms, setArchivedClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const user = await getUser(userId);
        setLoading(true);

        if (user && user.classroomCodes) {
          const classroomDetails = await Promise.all(
            user.classroomCodes.map(async (code) => {
              const classroom = await getDocument("classrooms", code);
              if (classroom) {
                const userGroup = getUserGroup(classroom, userId);
                return {
                  code,
                  name: classroom?.className || "Unnamed",
                  userGroup,
                };
              }
              return null;
            })
          );

          setClassrooms(classroomDetails.filter(Boolean));
        }

        if (userType === "Professor") {
          const archivedClassroomDetails = await getArchivedClassroomsForInstructor(userId);
          const formattedArchivedClassrooms = archivedClassroomDetails.map((classroom) => ({
            code: classroom.id,
            name: classroom.className || "Unnamed",
          }));
          setArchivedClassrooms(formattedArchivedClassrooms);
        } else if (user && user.classroomCodes) {
          const archivedClassroomDetails = await Promise.all(
            user.classroomCodes.map(async (code) => {
              const archivedClassroom = await getDocument("classroomArchive", code);
              if (archivedClassroom) {
                const userGroup = getUserGroup(archivedClassroom, userId);
                return {
                  code,
                  name: archivedClassroom?.className || "Unnamed",
                  userGroup,
                };
              }
              return null;
            })
          );

          setArchivedClassrooms(archivedClassroomDetails.filter(Boolean));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserGroup = (classroom, userId) => {
    if (!classroom || !classroom.groups) {
      return [];
    }

    const userGroup = Object.values(classroom.groups).find((group) => {
      const members = Array.isArray(group?.members) ? group.members : Object.values(group?.members || {});
      return members.some((member) => member.id === userId);
    });

    return userGroup
      ? userGroup.members.map(
        (member) =>
          `${member.firstName} ${member.lastName}`
      )
      : [];
  };

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{
          margin: "20px",
          padding: "15px",
          borderRadius: "10px",
          fontSize: "40px",
          fontWeight: "bold",
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage: "linear-gradient(145deg, #6db3f2, #1e5799)",
          display: "inline-block",
        }}
      >
        Your Classrooms
      </Typography>

      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : classrooms.length === 0 ? (
        <Typography variant="body1">No classrooms found.</Typography>
      ) : (
        <List>
          {classrooms.map(({ code, name, userGroup }) => (
            <ListItem key={code} disablePadding>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  if (userType === "Student") {
                    navigate(`/student-view?roomId=${code}`);
                  } else {
                    navigate(`/classroom?roomId=${code}`);
                  }
                }}
                onMouseEnter={(event) => {
                  event.target.style.transform = "scale(.95)";
                  event.target.style.backgroundColor = "#1e5799";
                }}
                onMouseLeave={(event) => {
                  event.target.style.transform = "scale(1)";
                  event.target.style.backgroundColor = "#6db3f2";
                }}
                style={{
                  borderRadius: 20,
                  marginBottom: "1rem",
                  transition: "transform 0.3s, background-color 0.3s",
                  background: "linear-gradient(145deg, #6db3f2, #1e5799)",
                  color: "white",
                }}
              >
                <ListItemText
                  primary={`Classroom: ${name ? name : "Unnamed"} @ ${code}`}
                  secondary={
                    userType === "Student" && userGroup.length > 0
                      ? `Your Group: ${userGroup.join(", ")}`
                      : userType !== "Student"
                        ? "Click to view classroom"
                        : "No group assigned"
                  }
                />
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      <Typography
        variant="h5"
        gutterBottom
        style={{
          margin: "20px",
          padding: "15px",
          borderRadius: "10px",
          fontSize: "30px",
          fontWeight: "bold",
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage: "linear-gradient(145deg, #d3d3d3, #999)",
          display: "inline-block",
        }}
      >
        Archived Classrooms
      </Typography>

      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : archivedClassrooms.length === 0 ? (
        <Typography variant="body1">No archived classrooms found.</Typography>
      ) : (
        <List>
          {archivedClassrooms.map(({ code, name }) => (
            <ListItem key={code} disablePadding>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled
                style={{
                  borderRadius: 20,
                  marginBottom: "1rem",
                  transition: "transform 0.3s, background-color 0.3s",
                  background: "linear-gradient(145deg, #d3d3d3, #999)",
                  color: "white",
                  cursor: "not-allowed",
                }}
              >
                <ListItemText
                  primary={`Archived Classroom: ${name ? name : "Unnamed"} @ ${code}`}
                />
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default Classrooms;
