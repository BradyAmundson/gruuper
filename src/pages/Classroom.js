import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  getDocument,
  getGroups,
  getUser,
  saveGroups,
  saveClassname,
  removeMemberFromClassroom,
  updateClassroomState,
  saveClassroomSettings,
  archiveClassroom,
} from "../firebase/firestoreService";
import { sendBulkEmails } from "../api/sendEmailNotification";
import SettingsModal from "../components/SettingsModal";
import "./styles/classroom.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";

import { IconButton, TextField } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import SaveIcon from "@mui/icons-material/Save";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SmartMatchIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from "@mui/material";

const ItemTypes = {
  MEMBER: "member",
};

const DraggableMember = ({
  name,
  index,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
  isProfessor,
}) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.MEMBER,
    canDrag: isProfessor,
    item: { name, index },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging) {
        setCurrentlyDragging(index);
      } else if (currentlyDragging === index) {
        setCurrentlyDragging(null);
      }
      return {
        isDragging: isDragging,
      };
    },
    end: (item, monitor) => {
      setCurrentlyDragging(null);
    },
  }));
  const isCurrentlyBeingDragged = currentlyDragging === index;
  let className = `draggable-item-professor ${
    isCurrentlyBeingDragged ? "dragging-item" : ""
  }`;
  if (!isProfessor) {
    className = "draggable-item-student";
  }
  return (
    <li ref={drag} className={className}>
      {name}
    </li>
  );
};

const DroppableGroup = ({
  group,
  index,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
  memberNames,
  isProfessor,
  toggleLockGroup,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => moveMember(item.index, index),
  }));

  return (
    <div ref={drop} id="Groups" className="group-container">
      <h3>Group {index + 1}</h3>
      <ul>
        {group.members.map((user, idx) => (
          <DraggableMember
            key={idx}
            name={memberNames.find((member) => member.id === user)?.name}
            index={{ groupIndex: index, memberIndex: idx }}
            moveMember={moveMember}
            setCurrentlyDragging={setCurrentlyDragging}
            currentlyDragging={currentlyDragging}
            isProfessor={isProfessor}
          />
        ))}
      </ul>
      <IconButton
        onClick={() => toggleLockGroup(index)}
        className={`lock-button ${group.locked ? 'locked' : 'unlocked'}`}
        style={{ position: 'absolute', top: '10px', right: '5px' }}>
        {group.locked ? <LockIcon /> : <LockOpenIcon />}
      </IconButton>
    </div>
  );
};


const NewGroupArea = ({ createNewGroup }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => {
      createNewGroup(item.index);
    },
  }));

  return (
    <div ref={drop} className="new-group-area">
      <p className="new-group-plus">
        <AddIcon fontSize="large" />
      </p>
      <p className="new-group-caption">Drop here to create a new group</p>
    </div>
  );
};

const UnmatchedMembersArea = ({
  unmatchedMembers,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
  isProfessor,
  removeMemberFromGroup,
  memberNames,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => {
      moveMember(item.index, -1);
    },
  }));

  const style = {
    filter: unmatchedMembers.length === 0 ? "grayscale(1)" : "none",
  };

  return (
    <div ref={drop} id="UnmatchedGroups" style={style}>
      <h3>Ungrouped Members</h3>
      {unmatchedMembers.length === 0 ? (
        <p>Drop student here</p>
      ) : (
        <ul>
          {unmatchedMembers.map((member, index) => (
            <DraggableMember
              key={index}
              name={memberNames.find((mem) => mem.id === member)?.name}
              index={{ groupIndex: -1, memberIndex: index }}
              moveMember={moveMember}
              setCurrentlyDragging={setCurrentlyDragging}
              currentlyDragging={currentlyDragging}
              isProfessor={isProfessor}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const Classroom = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState(null);
  const [groups, setGroups] = useState({});
  const [memberNames, setMemberNames] = useState([]);
  const [groupSize, setGroupSize] = useState(1);
  const [currentlyDragging, setCurrentlyDragging] = useState(null);
  const [className, setClassName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const navigate = useNavigate();

  const [lockedGroups, setLockedGroups] = useState({});
  const [showMembers, setShowMembers] = useState(false);
  const [unmatchedMembers, setUnmatchedMembers] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useState();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNotifyClick = () => {
    setDialogOpen(true);
  };

  const handleNotifyConfirm = () => {
    sendBulkEmails(
      roomId,
      "Your groups are ready!",
      `<!DOCTYPE html>
      <html>
        <body>
          <p>Hi there,</p>
          <p>Your new group has been successfully formed!</p>
          <p>Click the link below to check it out:</p>
          <p><a href="https://your-link-here.com" target="_blank">Go to your new group</a></p>
          <p>Best regards,<br>Your Team</p>
        </body>
      </html>
      `
    );
  };

  const handleNotifyClose = () => {
    setDialogOpen(false);
  };

  const defaultDeadline = () => {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + 7);
    deadline.setHours(12, 0, 0, 0);
    return deadline.toISOString().slice(0, 16);
  };

  const [deadline, setDeadline] = useState(defaultDeadline());
  const [isLiveGrouping, setIsLiveGrouping] = useState(false);
  const [minGroupSize, setMinGroupSize] = useState(2);
  const [showSaveReminder, setShowSaveReminder] = useState(false);


  const showReminder = () => {
    setShowSaveReminder(true);
  };

  const saveDeadlineToFirestore = async (newDeadline) => {
    try {
      await saveClassroomSettings(roomId, { deadline: newDeadline });
      setDeadline(newDeadline);
    } catch (error) {
      console.error("Failed to save deadline:", error);
    }
  };

  const handleSettingsOpen = () => {
    setIsSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsModalOpen(false);
  };

  const handleSaveSettings = async (settings) => {
    try {
      await saveClassroomSettings(roomId, { ...settings, deadline });
      const updatedClassroom = await getDocument("classrooms", roomId);
      setClassroom(updatedClassroom);
      setClassName(updatedClassroom.className);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleClassroomDeleted = async () => {
    try {
      await archiveClassroom(roomId);
      navigate("/classrooms");
    } catch (error) {
      console.error("Failed to archive classroom:", error);
    }
  };

  // Show/Hide Members button position
  const buttonRightPosition = showMembers ? "400px" : "50px";
  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  const toggleLockGroup = (index) => {
    setClassroom((prevClassroom) => {
      const newGroups = { ...prevClassroom.groups };
      newGroups[index].locked = !newGroups[index].locked; // Toggle the locked state
      saveGroups(roomId, newGroups, {}, className, Object.values(newGroups).flatMap(group => group.members), unmatchedMembers);
      return { ...prevClassroom, groups: newGroups };
    });
  };


  const moveMember = useCallback((fromIndexes, toGroupIndex) => {
    setClassroom((prevClassroom) => {
      const newGroups = { ...prevClassroom.groups };
      let member;
      let action; // "added" or "removed"

      if (fromIndexes.groupIndex === toGroupIndex && fromIndexes.groupIndex === -1) {
        // No need to update anything if they are dropped back into the same ungrouped area
        return prevClassroom;
      }

      // Handle removal from current group or unmatched area
      if (fromIndexes.groupIndex === -1) {
        setUnmatchedMembers((prevUnmatched) => {
          const updatedUnmatched = [...prevUnmatched];
          member = updatedUnmatched.splice(fromIndexes.memberIndex, 1)[0];
          return updatedUnmatched;
        });
        action = "added";
      } else {
        member = newGroups[fromIndexes.groupIndex].members.splice(
          fromIndexes.memberIndex,
          1
        )[0];
        action = "removed";

        // Log the removal action
        newGroups[fromIndexes.groupIndex].logMessages.push(
          `Member ID: ${member} was removed at ${new Date().toISOString()}`
        );

        // If the creation method changes to "Hand-Picked"
        if (
          newGroups[fromIndexes.groupIndex].creationMethod !== "Hand-Picked"
        ) {
          newGroups[fromIndexes.groupIndex].logMessages.push(
            `Group creation method changed from ${
              newGroups[fromIndexes.groupIndex].creationMethod
            } to Hand-Picked at ${new Date().toISOString()}`
          );
          newGroups[fromIndexes.groupIndex].creationMethod = "Hand-Picked";
        }
      }

      // Handle addition to the new group or unmatched area
      if (toGroupIndex !== -1) {
        newGroups[toGroupIndex] = newGroups[toGroupIndex] || {
          members: [],
          logMessages: [],
          creationMethod: "Hand-Picked",
        };
        newGroups[toGroupIndex].members.push(member);

        // Log the addition action
        newGroups[toGroupIndex].logMessages.push(
          `Member ${member} (ID: ${
            member.id
          }) was added at ${new Date().toISOString()}`
        );

        // If the creation method changes to "Hand-Picked"
        if (newGroups[toGroupIndex].creationMethod !== "Hand-Picked") {
          newGroups[toGroupIndex].logMessages.push(
            `Group creation method changed from ${
              newGroups[toGroupIndex].creationMethod
            } to Hand-Picked at ${new Date().toISOString()}`
          );
          newGroups[toGroupIndex].creationMethod = "Hand-Picked";
        }

        showReminder();

        // Move from ungrouped to grouped
        setUnmatchedMembers((prevUnmatched) =>
          prevUnmatched.filter((m) => m !== member)
        );
      } else {
        setUnmatchedMembers((prevUnmatched) => [...prevUnmatched, member]);

        newGroups[fromIndexes.groupIndex].logMessages.push(
          `Member ${member.name} (ID: ${
            member.id
          }) was added to Ungrouped Members at ${new Date().toISOString()}`
        );
        showReminder();
      }

      return { ...prevClassroom, groups: newGroups };
    });
  }, []);

  const updateUnmatchedMembers = (allMembers, groups) => {
    const groupedMembers = new Set();
    Object.values(groups).forEach((group) => {
      group.members.forEach((member) => {
        groupedMembers.add(member);
      });
    });

    const unmatched = allMembers.filter(
      (member) => !groupedMembers.has(member)
    );
    setUnmatchedMembers(unmatched);
  };

  const removeMemberFromGroup = (fromIndexes) => {
    setClassroom((prevClassroom) => {
      const { groupIndex, memberIndex } = fromIndexes;
      if (groupIndex === -1) {
        console.error("Invalid groupIndex for removal from group:", groupIndex);
        return prevClassroom;
      }

      const newGroups = { ...prevClassroom.groups };
      const member = newGroups[groupIndex].members.splice(memberIndex, 1)[0];

      setUnmatchedMembers((prevUnmatched) => [...prevUnmatched, member]);
      return { ...prevClassroom, groups: newGroups };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const user = await getUser(userId);
        if (user && user.classroomCodes) {
          setIsProfessor(
            localStorage.getItem("userType") === "Professor" &&
              user.classroomCodes.includes(roomId)
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (localStorage.getItem("userType") === "Professor") {
      fetchData();
    }
  }, [roomId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClassroom = await getDocument("classrooms", roomId);
        if (!fetchedClassroom) {
          console.error("Failed to fetch classroom data");
          return;
        }
        console.log("Fetched classroom data:", fetchedClassroom.instructorId);
        const isProfessor =
          localStorage.getItem("userType") === "Professor" &&
          localStorage.getItem("userId") === fetchedClassroom?.instructorId;
        setIsProfessor(isProfessor);

        if (!isProfessor) {
          const code = query.get("roomId");
          navigate(`/student-view?roomId=${code}`);
        }

        setClassroom(fetchedClassroom);

        if (!fetchedClassroom.deadline) {
          const defaultDead = defaultDeadline();
          saveDeadlineToFirestore(defaultDead);
        } else {
          setDeadline(fetchedClassroom.deadline);
        }

        const fetchedGroups = fetchedClassroom.groups || {};
        setGroups(fetchedGroups);

        const fetchedUser = await getUser(fetchedClassroom?.instructorId);
        const className = fetchedClassroom?.className || `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""}'s Assignment`;
        setClassName(className);

        const members = fetchedClassroom?.members || [];
        const newMemberNames = await Promise.all(
          members.map(async (member) => {
            const user = await getUser(member);
            return {
              id: member,
              name: `${user?.firstName || ""} ${user?.lastName || ""}`,
              profileComplete: user?.profileComplete || false, // Fetch profileComplete status
            };
          })
        );
        setMemberNames(newMemberNames);

        // Initialize grouped and ungrouped members
        const groupedMembers = new Set();
        Object.values(fetchedGroups).forEach((group) => {
          group.members.forEach((member) => {
            groupedMembers.add(member);
          });
        });

        const ungroupedMembers = members.filter(
          (member) => !groupedMembers.has(member)
        );
        setUnmatchedMembers(ungroupedMembers); // Store ungrouped members
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  useEffect(() => {
    if (state === "Lobby" && deadline) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const distance = new Date(deadline) - now;

        if (distance <= 0) {
          clearInterval(intervalId);
          setState("Grouping");
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
  }, [deadline, state]);

  useEffect(() => {
    if (classroom && classroom.state !== state) {
      updateClassroomState(roomId, state);
    }
  }, [state, roomId, classroom]);

  // Function to automatically create a group during LiveGrouping
  useEffect(() => {
    if (state === "LiveGrouping" && unmatchedMembers.length >= minGroupSize) {
      setClassroom((prevClassroom) => {
        const newGroups = { ...prevClassroom.groups };
        const newGroupIndex = Object.keys(newGroups).length;

        const newGroupMembers = unmatchedMembers.slice(0, minGroupSize);
        const remainingUnmatched = unmatchedMembers.slice(minGroupSize);

        newGroups[newGroupIndex] = {
          members: newGroupMembers,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creationMethod: "Live Grouping",
          logMessages: [
            `Group created with Live Grouping method at ${new Date().toISOString()}`,
          ],
        };

        setUnmatchedMembers(remainingUnmatched);

        saveGroups(
          roomId,
          newGroups,
          className,
          Object.values(newGroups).flatMap((group) => group.members),
          remainingUnmatched
        );

        return { ...prevClassroom, groups: newGroups };
      });
    }
  }, [unmatchedMembers, minGroupSize, state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClassroom = await getDocument("classrooms", roomId);
        if (!fetchedClassroom) {
          console.error("Failed to fetch classroom data");
          return;
        }
        setClassroom(fetchedClassroom);
        setState(fetchedClassroom.state || "Lobby");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  const handleStateChange = () => {
    if (state === "Lobby") {
      setState("Grouping");
      updateClassroomState(roomId, "Grouping");
      console.log("State changed to: Grouping");
    } else if (state === "Grouping") {
      setState("LiveGrouping");
      setIsLiveGrouping(true);
      updateClassroomState(roomId, "LiveGrouping");
      console.log("State changed to: LiveGrouping");
    }
  };

  const handleConfirmInitialGroups = () => {
    saveGroupsToFirestore();
    handleStateChange();
  };

  const handleDeleteMember = async (userId, roomId) => {
    try {
      await removeMemberFromClassroom(roomId, userId);

      setClassroom((prevClassroom) => {
        const newGroups = { ...prevClassroom.groups };

        Object.keys(newGroups).forEach((groupKey) => {
          newGroups[groupKey].members = newGroups[groupKey].members.filter(
            (memberId) => memberId !== userId
          );
        });

        return { ...prevClassroom, groups: newGroups };
      });

      setMemberNames((prevMembers) =>
        prevMembers.filter((member) => member.id !== userId)
      );

      setUnmatchedMembers((prevUnmatched) =>
        prevUnmatched.filter((member) => member.id !== userId)
      );
    } catch (error) {
      console.error("Failed to delete member from classroom:", error);
    }
  };

  const handleRandomizeGroups = async (smartMatch) => {
    if (smartMatch) {
      setIsLoading(true);
    }

    const fetchedClassroom = await getDocument("classrooms", roomId);
    const allMembers = fetchedClassroom?.members || [];
    const groups = fetchedClassroom?.groups || {};

    // Create separate lists for locked and unlocked members
    const lockedMembers = new Set();
    const passedLockedGroups = {};

    Object.entries(groups).forEach(([groupIndex, group]) => {
      if (group.locked) {
        passedLockedGroups[groupIndex] = group;
        group.members.forEach(member => lockedMembers.add(member));
      }
    });

    const unlockedAndUnmatchedMembers = allMembers.filter(
      (member) =>
        !lockedMembers.has(member) && !unmatchedMembers.includes(member)
    );

    const method = smartMatch ? "Gruuper" : "Randomizer";

    // Use getGroups function to process the groups, leveraging randomizeGroups or optimizeGroups
    const newGroups = await getGroups(
      roomId,
      setGroups,
      unlockedAndUnmatchedMembers,
      groupSize,
      passedLockedGroups,
      smartMatch
    );

    setIsLoading(false);
    showReminder(); // Show reminder whenever a change is made

    // Update the classroom state with the newly generated groups
    setClassroom((prevClassroom) => {
      const updatedGroups = { ...prevClassroom.groups };

      // Merge the newly generated groups with the existing locked groups
      Object.entries(newGroups).forEach(([key, group], index) => {
        const groupIndex = Object.keys(updatedGroups).length;
        updatedGroups[groupIndex] = {
          members: group.members,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creationMethod: method,
          logMessages: [`Group created with ${method} at ${new Date().toISOString()}`],
          locked: false,  // New groups are unlocked by default
        };
      });

      // Ensure locked groups are kept intact
      Object.entries(passedLockedGroups).forEach(([key, group]) => {
        updatedGroups[key] = group;
      });

      return { ...prevClassroom, groups: updatedGroups };
    });

    // Update member names
    const newMemberNames = await Promise.all(
      allMembers.map(async (member) => {
        const fetchedUser = await getUser(member);
        return {
          id: member,
          name: `${fetchedUser?.firstName || ""} ${
            fetchedUser?.lastName || ""
          }`,
        };
      })
    );
    setMemberNames(newMemberNames);
  };



  useEffect(() => {
    if (groups) {
      const initialLockState = {};
      Object.keys(groups).forEach(key => {
        initialLockState[key] = groups[key].locked || false;
      });
      setLockedGroups(initialLockState);
    }
  }, [groups]);



  const updateGroupCreationMethod = (groupIndex, newMethod) => {
    setClassroom((prevClassroom) => {
      const newGroups = { ...prevClassroom.groups };
      const group = newGroups[groupIndex];

      if (group && group.creationMethod !== newMethod) {
        group.creationMethod = newMethod;
        group.updatedAt = new Date().toISOString();
        group.logMessages.push(
          `Creation method changed to ${newMethod} at ${new Date().toISOString()}`
        );
        newGroups[groupIndex] = group;

        setGroups(newGroups);
      }

      return { ...prevClassroom, groups: newGroups };
    });
  };

  useEffect(() => {
    setClassroom((prevClassroom) => ({
      ...prevClassroom,
      groups: groups,
    }));

    if (groups) {
      const initialLockState = {};
      Object.keys(groups).forEach((key) => {
        initialLockState[key] = false;
      });
      setLockedGroups(initialLockState);
    }
  }, [groups]);

  useEffect(() => {
    setClassroom((prevClassroom) => ({
      ...prevClassroom,
      lockedGroups: lockedGroups,
    }));
  }, [lockedGroups]);

  const saveGroupsToFirestore = () => {
    setClassroom((prevClassroom) => {
      const currentGroups = prevClassroom.groups;
      const newGroups = {};
      const deletedGroups = {};

      let newGroupIndex = 0;

      // Identify active groups (those that have members)
      Object.keys(currentGroups).forEach((groupKey) => {
        if (currentGroups[groupKey].members.length > 0) {
          newGroups[newGroupIndex] = currentGroups[groupKey];
          newGroupIndex++;
        } else {
          // Groups that are empty will be marked as deleted
          deletedGroups[groupKey] = {
            ...currentGroups[groupKey],
            deletedAt: new Date().toISOString(),
            logMessages: currentGroups[groupKey].logMessages
              ? [
                  ...currentGroups[groupKey].logMessages,
                  `Group deleted at ${new Date().toISOString()}`,
                ]
              : [`Group deleted at ${new Date().toISOString()}`],
          };
        }
      });

      const groupedMembers = Object.values(newGroups).flatMap(
        (group) => group.members
      );
      const ungroupedMembers = memberNames
        .map((member) => member.id)
        .filter((id) => !groupedMembers.includes(id));

      // Pass both newGroups and deletedGroups to the saveGroups function
      saveGroups(
        roomId,
        newGroups,
        deletedGroups,
        className,
        groupedMembers,
        ungroupedMembers
      );
      setShowSaveReminder(false);

      return { ...prevClassroom, groups: newGroups };
    });
  };

  const createNewGroup = async (fromIndexes) => {
    setClassroom((prevClassroom) => {
      const { groups: currentGroups, unmatchedMembers: currentUnmatched } =
        prevClassroom;
      const newGroups = { ...currentGroups };
      let memberId;

      // Handle removal from the existing group or unmatched area
      if (fromIndexes.groupIndex === -1) {
        setUnmatchedMembers((prevUnmatched) => {
          const updatedUnmatched = [...prevUnmatched];
          memberId = updatedUnmatched.splice(fromIndexes.memberIndex, 1)[0];
          return updatedUnmatched;
        });
      } else {
        memberId =
          newGroups[fromIndexes.groupIndex].members[fromIndexes.memberIndex];
        newGroups[fromIndexes.groupIndex].members.splice(
          fromIndexes.memberIndex,
          1
        );

        // Log the removal action
        newGroups[fromIndexes.groupIndex].logMessages.push(
          `Member ID: ${memberId} was removed at ${new Date().toISOString()}`
        );

        // If the creation method changes to "Hand-Picked"
        if (
          newGroups[fromIndexes.groupIndex].creationMethod !== "Hand-Picked"
        ) {
          newGroups[fromIndexes.groupIndex].logMessages.push(
            `Group creation method changed from ${
              newGroups[fromIndexes.groupIndex].creationMethod
            } to Hand-Picked at ${new Date().toISOString()}`
          );
          newGroups[fromIndexes.groupIndex].creationMethod = "Hand-Picked";
        }
      }

      // Create a new group with the removed member
      const newGroupIndex = Object.keys(newGroups).length;
      newGroups[newGroupIndex] = {
        members: [memberId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creationMethod: "Hand-Picked",
        logMessages: [
          `Group created with Hand-Picked method at ${new Date().toISOString()}`,
          `Member ID: ${memberId} was added with group creation at ${new Date().toISOString()}`,
        ],
      };

      setLockedGroups((prevLocked) => ({
        ...prevLocked,
        [newGroupIndex]: false,
      }));

      showReminder();

      setGroups(newGroups);
      return { ...prevClassroom, groups: newGroups };
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setClassName(className);
    saveClassname(roomId, className);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      await handleDeleteMember(studentToDelete.id, roomId);
      setOpenDeleteDialog(false);
      setStudentToDelete(null);
    }
  };

  const incrementSize = () => {
    const element = document.querySelector(".counter-value");

    setGroupSize(groupSize + 1);
    element.classList.add("counter-value-change");

    setTimeout(() => {
      element.classList.remove("counter-value-change");
    }, 200);
  };

  const DecrementSize = () => {
    if (groupSize > 1) {
      const element = document.querySelector(".counter-value");

      setGroupSize(groupSize - 1);
      element.classList.add("counter-value-change");

      setTimeout(() => {
        element.classList.remove("counter-value-change");
      }, 200);
    }
  };

  const incrementMinGroupSize = () => {
    setMinGroupSize((prevSize) => prevSize + 1);

    const element = document.querySelector(".counter-value");

    element.classList.add("counter-value-change");

    setTimeout(() => {
      element.classList.remove("counter-value-change");
    }, 200);
  };

  const decrementMinGroupSize = () => {
    if (minGroupSize > 0) {
      setMinGroupSize((prevSize) => prevSize - 1);
    }

    const element = document.querySelector(".counter-value");

    element.classList.add("counter-value-change");

    setTimeout(() => {
      element.classList.remove("counter-value-change");
    }, 200);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f1f1",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 1rem",
            }}
          >
            <h2 className="class-info">Classroom: {roomId}</h2>
            <Tooltip title="Settings">
              <IconButton color="primary" onClick={handleSettingsOpen}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2
              className="class-info"
              style={{
                marginRight: isProfessor ? "1rem" : "1rem",
              }}
            >
              {className}
            </h2>
          </div>
        </div>

        {showSaveReminder && (
          <div
            style={{
              backgroundColor: "gray",
              color: "white",
              padding: "5px",
              textAlign: "center",
            }}
          >
            Be sure to save your changes!
          </div>
        )}

        {state === "Lobby" && (
          <div className="lobby-state body">
            <h2 className="lobby-title">Lobby</h2>
            <div className="control-center">
              <div className="countdown-container">
                <p className="countdown-title">Time until grouping starts:</p>
                {timeLeft ? (
                  <p className="countdown-timer">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                    {timeLeft.seconds}s
                  </p>
                ) : (
                  <p className="countdown-timer">No deadline set</p>
                )}
                <p
                  style={{
                    marginTop: "3rem",
                    fontSize: "0.75rem",
                  }}
                >
                  Choose a deadline below:
                </p>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="deadline-picker"
                />
                <button
                  className="btn-start-grouping"
                  onClick={handleStateChange}
                >
                  Start Grouping Now
                </button>
              </div>
            </div>
            <div className="members-list">
              <h3 className="members-title">Students Joined:</h3>
              <ul className="members-list-ul">
                {memberNames.map((member) => (
                  <li key={member.id} className="members-list-item">
                    {member.name}{" "}
                    {member.profileComplete ? (
                      <CheckIcon style={{ color: "green" }} />
                    ) : (
                      <CloseIcon style={{ color: "red" }} />
                    )}
                  </li>
                ))}
              </ul>
              <div
                className="members-key"
                style={{
                  marginTop: "1rem",
                  fontSize: "0.75rem",
                  color: "#555",
                  display: "flex",
                  justifyContent: "center", // Center horizontally
                  alignItems: "center", // Center vertically
                }}
              >
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "0 1rem",
                  }}
                >
                  Profile Questionnaire Complete
                  <CheckIcon
                    style={{
                      color: "green",
                      fontSize: "1rem",
                      marginRight: "0.25rem",
                    }}
                  />
                </p>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "0 1rem",
                  }}
                >
                  Profile Questionnaire Incomplete
                  <CloseIcon
                    style={{
                      color: "red",
                      fontSize: "1rem",
                      marginRight: "0.25rem",
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}

        {(state === "Grouping" || state === "LiveGrouping") && (
          <div className="grouping-state">
            <div className="body">
              {isProfessor && (
                <div className="control-center">
                  {state === "LiveGrouping" ? (
                    <div className="control-center">
                      <h1>Live Grouping Enabled</h1>
                      <p>
                        Whenever Ungrouped Members reaches the minimum grop
                        size, a new group will be created!
                      </p>
                      <div className="control-center">
                        <div className="size-counter">
                          <div className="counter-title">
                            <span>Minimum</span>
                            <br />
                            <span>Group Size:</span>
                          </div>
                          <span className="counter-value">
                            {minGroupSize < 10
                              ? "0" + minGroupSize
                              : minGroupSize}
                          </span>
                          <div
                            className="counter-buttons"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              className="counter-button"
                              onClick={incrementMinGroupSize}
                            >
                              {" "}
                              +{" "}
                            </button>
                            <button
                              className="counter-button"
                              onClick={decrementMinGroupSize}
                            >
                              {" "}
                              -{" "}
                            </button>
                          </div>
                        </div>
                        <div className="group-controls">
                          <Tooltip title="Save">
                            <SaveIcon
                              className="save-groups-button"
                              onClick={saveGroupsToFirestore}
                              sx={{
                                fontSize: "30px",
                                transition: "transform 0.3s",
                              }}
                            />
                          </Tooltip>
                          <Dialog open={dialogOpen} onClose={handleNotifyClose}>
                            <DialogTitle>Confirm Notify</DialogTitle>
                            <DialogContent>
                              You are about to notify all students in the class
                              that the groups are completed.
                              <br />
                              Are you sure you want to proceed?
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={handleNotifyClose}
                                color="primary"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  handleNotifyConfirm();
                                  handleNotifyClose();
                                }}
                                color="primary"
                              >
                                Confirm
                              </Button>
                            </DialogActions>
                          </Dialog>
                          <Tooltip title="Notify">
                            <SendIcon
                              className="save-groups-button"
                              onClick={handleNotifyClick}
                              sx={{
                                fontSize: "30px",
                                transition: "transform 0.3s",
                              }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="control-center">
                      <div className="size-counter">
                        <div className="counter-title">
                          <span>Maximum</span>
                          <br />
                          <span>Group Size:</span>
                        </div>
                        <span className="counter-value">
                          {groupSize < 10 ? "0" + groupSize : groupSize}
                        </span>
                        <div
                          className="counter-buttons"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="counter-button"
                            onClick={incrementSize}
                          >
                            {" "}
                            +{" "}
                          </button>
                          <button
                            className="counter-button"
                            onClick={DecrementSize}
                          >
                            {" "}
                            -{" "}
                          </button>
                        </div>
                      </div>
                      <div className="group-controls">
                        <Tooltip title="Shuffle">
                          <ShuffleIcon
                            className="randomize-groups-button"
                            onClick={() => handleRandomizeGroups(false)}
                            sx={{
                              fontSize: "30px",
                              transition: "transform 0.3s",
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Smart Match">
                          <SmartMatchIcon
                            className="smart-match-button"
                            onClick={() => handleRandomizeGroups(true)}
                            sx={{
                              fontSize: "30px",
                              transition: "transform 0.3s",
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Save">
                          <SaveIcon
                            className="save-groups-button"
                            onClick={saveGroupsToFirestore}
                            sx={{
                              fontSize: "30px",
                              transition: "transform 0.3s",
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid-container">
                {classroom.groups &&
                  Object.entries(classroom.groups).map(
                    ([key, group], index) => (
                      <DroppableGroup
                        key={index}
                        group={group}
                        index={index}
                        moveMember={moveMember}
                        setCurrentlyDragging={setCurrentlyDragging}
                        currentlyDragging={currentlyDragging}
                        memberNames={memberNames}
                        isProfessor={isProfessor}
                        locked={lockedGroups[index]}
                        toggleLockGroup={toggleLockGroup}
                      />
                    )
                  )}
                {currentlyDragging !== null && (
                  <NewGroupArea createNewGroup={createNewGroup} />
                )}
              </div>
              {isProfessor && (
                <UnmatchedMembersArea
                  unmatchedMembers={unmatchedMembers}
                  moveMember={moveMember}
                  setCurrentlyDragging={setCurrentlyDragging}
                  currentlyDragging={currentlyDragging}
                  isProfessor={isProfessor}
                  removeMemberFromGroup={removeMemberFromGroup}
                  memberNames={memberNames}
                />
              )}
            </div>
            <div>
              <button
                onClick={toggleMembers}
                className="show-members-btn"
                style={{ right: buttonRightPosition }}
              >
                {showMembers ? "Hide All Members" : "Show All Members"}
              </button>

              <div
                id="Members"
                style={{ right: showMembers ? '20px' : '-320px' }}
              >
                <h3>Classroom Members ({memberNames.length})</h3>
                <ul>
                  {memberNames
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((member) => (
                      <li key={member.id}>
                        {member.name}
                        <IconButton
                          onClick={() => handleDeleteClick(member)}
                          aria-label="delete member"
                          size="small"
                          className="delete-button"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          PaperProps={{
            style: {
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              backgroundColor: '#fff',
            },
          }}
        >
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              style={{ color: "#333", fontSize: "1.2rem", textAlign: "center" }}
            >
              Are you sure you want to delete {studentToDelete?.name}? This
              action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions style={{ justifyContent: "center" }}>
            <Button
              onClick={handleCloseDeleteDialog}
              style={{
                color: 'red',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.75rem 2.25rem',
                margin: '0.625rem',
                transition: 'transform 0.3s, background-color 0.3s',
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              style={{
                background: 'linear-gradient(145deg, #6db3f2, #1e5799)',
                color: 'white',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.75rem 2.25rem',
                margin: '0.625rem',
                transition: 'transform 0.3s, background-color 0.3s',
                textTransform: 'none'
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <SettingsModal
          open={isSettingsModalOpen}
          onClose={handleSettingsClose}
          classroomData={classroom}
          onSave={handleSaveSettings}
          onDelete={handleClassroomDeleted}
        />

        {state === "Grouping" && (
          <button
            className="btn-confirm-groups"
            onClick={handleConfirmInitialGroups}
          >
            Confirm Initial Groups
          </button>
        )}
      </div>
    </DndProvider>
  );
};

export default Classroom;
