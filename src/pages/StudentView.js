import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, getUser } from "../firebase/firestoreService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import "./styles/studentView.css";

const calculateCloudParts = (name, cloudWidth) => {
  const nameLength = name.length;
  const baseWidthFactor = 0.15;
  const baseHeightFactor = 0.1;
  const incrementWidthFactor = 0.01;

  const beforeWidth = Math.max(
    20,
    cloudWidth * (baseWidthFactor + nameLength * incrementWidthFactor)
  );
  const beforeHeight = Math.max(10, cloudWidth * baseHeightFactor);
  const afterWidth = Math.max(
    30,
    cloudWidth * (baseWidthFactor + nameLength * incrementWidthFactor * 1.5)
  );
  const afterHeight = Math.max(15, cloudWidth * (baseHeightFactor * 1.5));

  return {
    beforeWidth,
    beforeHeight,
    afterWidth,
    afterHeight,
  };
};

const StudentView = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const userId = localStorage.getItem("userId");
  const [classroom, setClassroom] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloudWidth, setCloudWidth] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const cloudRef = useRef(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    if (cloudRef.current) {
      setCloudWidth(cloudRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "classrooms", roomId),
      async (doc) => {
        if (doc.exists()) {
          const fetchedClassroom = doc.data();
          setClassroom(fetchedClassroom);
          await organizeMembers(fetchedClassroom);
        } else {
          console.error("No classroom data found for roomId:", roomId);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (classroom?.state === "Lobby" && classroom?.deadline) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const distance = new Date(classroom.deadline) - now;

        if (distance <= 0) {
          clearInterval(intervalId);
          setTimeLeft(null);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [classroom]);

  useEffect(() => {
    const alertShown = localStorage.getItem("profileAlertShown");

    if (!alertShown) {
      alert(
        "Don't forget to stop by your profile settings to make sure your information is up to date!"
      );
      localStorage.setItem("profileAlertShown", "true");
    }
  }, []);

  const organizeMembers = async (classroom) => {
    if (!classroom.members) {
      console.error("Invalid classroom data structure:", classroom);
      return;
    }

    try {
      // Fetch the current user's data, including groupIdInClassroom
      const currentUserDoc = await getDocument("users", userId);
      const currentUserName = `${currentUserDoc.firstName} ${currentUserDoc.lastName} (You)`;

      // Generate the list of all members
      const allMembersList = classroom.members.map((memberId) => {
        if (memberId === userId) {
          return currentUserName;
        } else {
          const memberData = classroom.groupIdInClassroom?.[
            roomId
          ]?.members.find((member) => member.id === memberId);
          return memberData
            ? `${memberData.firstName} ${memberData.lastName}`
            : "Anonymous";
        }
      });

      setAllMembers(allMembersList);

      // Find the user's group members using groupIdInClassroom
      const userGroup = currentUserDoc.groupIdInClassroom?.[roomId]?.members;
      if (!userGroup) {
        setGroupMembers([]);
        return;
      }

      const userGroupMembers = userGroup.map((member) => {
        return {
          name:
            member.id === userId
              ? currentUserName
              : `${member.firstName} ${member.lastName}`,
          email: member.email,
        };
      });
      setGroupMembers(userGroupMembers);
    } catch (error) {
      console.error("Error organizing members:", error);
    }
  };

  if (loading) {
    return <div className="student-view-container">Loading...</div>;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="classroom-header">
        {classroom?.className || "Classroom Name"}
        <span className="instructor-name">
          {classroom?.instructor ? `${classroom.instructor}` : ""}
        </span>
      </h1>
      {classroom.state === "Lobby" && (
        <div className="lobby-state">
          <div className="lobby-message">
            <p>
              Group formation will start when the countdown ends. If you want to
              pick your own group, please notify your professor before the
              countdown ends.
            </p>
            {timeLeft ? (
              <p className="countdown-timer">
                Time left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}
                m {timeLeft.seconds}s
              </p>
            ) : (
              <p className="countdown-timer">
                The countdown has ended. Group formation is starting.
              </p>
            )}
            <p>If you haven't already, be sure to complete your profile!</p>
            <div className="edit-profile-button-container">
              <button
                className="edit-profile-button"
                onClick={() => navigate("/edit-profile")}
              >
                Edit Your Profile
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="student-view-container">
        {classroom.state !== "Lobby" && (
          <div className="group-box">
            <h2 className="group-title">Your Group:</h2>
            <ul className="group-member-list">
              {groupMembers.length ? (
                groupMembers.map((groupMember, index) => {
                  const cloudWidth = 200;
                  const { beforeWidth, beforeHeight, afterWidth, afterHeight } =
                    calculateCloudParts(groupMember.name, cloudWidth);

                  return (
                    <li
                      key={index}
                      className="member-item-group"
                      style={{ animationDuration: `${Math.random() * 3 + 1}s` }}
                    >
                      <div
                        ref={cloudRef}
                        className="cloud"
                        style={{
                          "--beforeWidth": `${beforeWidth}px`,
                          "--beforeHeight": `${beforeHeight}px`,
                          "--afterWidth": `${afterWidth}px`,
                          "--afterHeight": `${afterHeight}px`,
                        }}
                      >
                        <span className="member-name">{groupMember.name}</span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="member-item">
                  You are not assigned to any group yet!
                </li>
              )}
            </ul>
            <div className="contact-group-button-container">
              <button className="btn contact-group-button" onClick={handleOpenModal}>
                Contact Group
              </button>
            </div>

          </div>
        )}
        <div className="classroom-box">
          <h2>Classroom Roster ({allMembers.length})</h2>
          <ul className="member-list">
            {allMembers.map((name, index) => (
              <li
                key={index}
                className={`member-item ${name.includes(userId) ? "highlighted-member" : ""
                  }`}
              >
                <span className="member-name">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="contact-message">
        Please contact your professor for any group updates and inquiries.
      </p>

      <Dialog open={isModalOpen} onClose={handleCloseModal} className="modal-backdrop">
        <div className="modal-container">
          <DialogTitle className="modal-title">Contact Group</DialogTitle>
          <DialogContent className="modal-content">
            <List>
              {groupMembers.map((groupMember, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={groupMember.name}
                    secondary={
                      <a href={`mailto:${groupMember.email}`} className="email-link">
                        {groupMember.email}
                      </a>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions className="modal-footer">
            <Button onClick={handleCloseModal} className="btn btn-cancel">
              Close
            </Button>
          </DialogActions>
        </div>
      </Dialog>


    </div>
  );
};

export default StudentView;