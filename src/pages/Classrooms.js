import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUser, getDocument } from "../firebase/firestoreService";

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
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
          setLoading(false);
        }
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
      // Check if group.members is an array, otherwise convert or handle accordingly
      const members = Array.isArray(group?.members) ? group.members : Object.values(group?.members || {});
      return members.includes(userId);
    });

    return userGroup ? userGroup.members.map((memberId) => memberId) : [];
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
        <Typography variant="body1">Error: No classrooms found.</Typography>
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
                    userGroup.length > 0 && userType === "Student"
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
    </div>
  );
};

export default Classrooms;



