import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Paper,
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
              const userGroupNames = await getUserGroupNames(classroom, userId);
              return {
                code,
                name: classroom.className,
                userGroup: userGroupNames,
              };
            })
          );

          setClassrooms(classroomDetails);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const getUserGroupNames = async (classroom, userId) => {
    if (!classroom || !classroom.groups) {
      return [];
    }

    const groupsArray = Object.values(classroom.groups);

    const userGroupNames = await Promise.all(
      groupsArray.map(async (group) => {
        const user = await getUser(group[0]);
        return `${user?.firstName || ""} ${user?.lastName || ""}`;
      })
    );

    return userGroupNames;
  };

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{
          margin: '20px', // Increased margin for more spacing around the title
          padding: '15px', // Increased padding for a softer appearance
          borderRadius: '10px', // Rounded corners
          fontSize: '40px', // Larger font size for headings
          color: 'transparent', // Transparent text color
          WebkitBackgroundClip: 'text', // Apply background to text
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundImage: 'linear-gradient(145deg, #6db3f2, #1e5799)',
          display: 'inline-block', // Display as inline block to control spacing
        }}
      >
        Your Classrooms
      </Typography>

      {classrooms.length === 0 ? (
        loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : (
          <Typography variant="body1">No classrooms found.</Typography>
        )
      ) : (
        <List>
          {classrooms.map(({ code, name, userGroup }) => (
            <ListItem key={code} disablePadding>
              <Button
                variant="contained"
                color="primary" // Change the color to primary for the blue theme
                fullWidth
                onClick={() => {
                  // Check the user type and navigate accordingly
                  const userType = localStorage.getItem("userType");
                  if (userType === "Student") {
                    navigate(`/student-view?roomId=${code}`);  // Path for the StudentView
                  } else {
                    navigate(`/classroom?roomId=${code}`);  // Existing path for professors
                  }
                }}
                onMouseEnter={(event) => {
                  event.target.style.transform = "scale(.95)";
                  event.target.style.backgroundColor = "#1e5799"; // Change background color on hover
                }}
                onMouseLeave={(event) => {
                  event.target.style.transform = "scale(1)";
                  event.target.style.backgroundColor = "#6db3f2"; // Restore default background color on hover out
                }}
                style={{
                  borderRadius: 5,
                  marginBottom: "1rem",
                  transition: "transform 0.3s, background-color 0.3s", // Add background-color transition
                  background: 'linear-gradient(145deg, #6db3f2, #1e5799)', // Apply gradient background
                  color: 'white', // Set text color to white
                }}
              >
                <ListItemText
                  primary={`Classroom: ${name ? name : "Unnamed"} @ ${code}`}
                  secondary={
                    userGroup.length > 0 && userType === "Student"
                      ? `Your Group: ${userGroup.join(", ")}`
                      : userType != "Student"
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
