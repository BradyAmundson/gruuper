import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getDocument,
  getGroups,
  getUser,
  saveGroups,
  saveClassname,
} from "../firebase/firestoreService";
import "./styles/classroom.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";

import { IconButton, TextField } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { increment } from "firebase/firestore";

import SaveIcon from "@mui/icons-material/Save";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SmartMatchIcon from "@mui/icons-material/Group";

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
  let className = `draggable-item-professor ${isCurrentlyBeingDragged ? "dragging-item" : ""
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
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => moveMember(item.index, index),
  }));
  return (
    <div ref={drop} id="Groups">
      <h3>Group {index + 1}</h3>
      <ul>
        {group.map((user, idx) => (
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
    </div>
  );
};

const NewGroupArea = ({ createNewGroup }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => createNewGroup(item.index),
  }));

  return (
    <div ref={drop} className="new-group-area">
      <p>Drop here to create a new group</p>
    </div>
  );
};

const Classroom = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);
  const [groups, setGroups] = useState(Object);
  const [memberNames, setMemberNames] = useState([]);
  const [groupSize, setGroupSize] = useState(1);
  const [currentlyDragging, setCurrentlyDragging] = useState(null);
  const [className, setClassName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

  const [isMatching, setIsMatching] = useState(false);

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
        setClassroom(fetchedClassroom);
        const fetchedUser = await getUser(fetchedClassroom?.instructor);
        setClassName(
          fetchedClassroom?.className ||
          `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""
          }'s Class`
        );
        setIsProfessor(
          localStorage.getItem("userType") === "Professor" &&
          localStorage.getItem("userId") === fetchedClassroom?.instructor
        );

        const members = fetchedClassroom?.members || [];
        const newMemberNames = await Promise.all(
          members.map(async (member) => {
            const fetchedUser = await getUser(member);
            return {
              id: member,
              name: `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""
                }`,
            };
          })
        );
        setMemberNames(newMemberNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  function calculateMatchScore(student1, student2) {
    let score = 0;
    if (student1.major === student2.major) score += 1;
    if (student1.classYear === student2.classYear) score += 1;
    if (student1.nightOrMorning === student2.nightOrMorning) score += 1;
    if (student1.socialPreference === student2.socialPreference) score += 1;
    if (student1.deadlineBehavior === student2.deadlineBehavior) score += 1;
    return score;
  }

  const handleSmartMatch = async () => {
    setIsMatching(true);
    await getGroups(roomId, setGroups, memberNames, groupSize);
    const fetchedClassroom = await getDocument("classrooms", roomId);

    const members = fetchedClassroom?.members || [];

    // Fetch students and their preferences
    // For demonstration, let's assume `memberNames` includes all necessary info
    const membersWithPreferences = [...memberNames]; // Assume this array has all the data

    const matchedGroups = findBestMatchingGroups(members, groupSize);

    // Example: Update your state with these new groups
    // This step will depend on how your groups are structured and stored
    // For now, we'll log the results to demonstrate output
    console.log("Matched Groups:", matchedGroups);

    setClassroom(fetchedClassroom);
    setIsMatching(false);
  };

  const findBestMatchingGroups = (students, groupSize) => {
    let remainingStudents = [...students];
    const matchedGroups = [];

    while (remainingStudents.length >= groupSize) {
      // Take a slice of students for the current group
      const currentGroup = remainingStudents.slice(0, groupSize);

      // Find the best matching group based on the current group members' profiles
      const bestMatchingGroup = findBestMatchForGroup(currentGroup);

      // Add the best matching group to the result
      matchedGroups.push(bestMatchingGroup);

      // Remove the students assigned to the current group from the remaining students
      remainingStudents = remainingStudents.filter(student => !currentGroup.includes(student));
    }

    // If there are remaining students, create a group with them
    if (remainingStudents.length > 0) {
      matchedGroups.push(remainingStudents);
    }


    return matchedGroups;
  };


  const findBestMatchForGroup = (group) => {
    // Sort students randomly to vary pairings each time the function is called
    group.sort(() => 0.5 - Math.random());

    let bestMatchScore = -1;
    let bestMatchGroup = [];

    // Compare each student with every other student in the group
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const score = calculateMatchScore(group[i], group[j]);
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchGroup = [group[i], group[j]];
        }
      }
    }

    console.log("Best Match Score:", bestMatchScore);
    console.log("Best Match Group:", bestMatchGroup);
    return bestMatchGroup;
  };


  const handleRandomizeGroups = async () => {
    await getGroups(roomId, setGroups, memberNames, groupSize);
    const fetchedClassroom = await getDocument("classrooms", roomId);

    const members = fetchedClassroom?.members || [];
    const newMemberNames = await Promise.all(
      members.map(async (member) => {
        const fetchedUser = await getUser(member);
        return {
          id: member,
          name: `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""
            }`,
        };
      })
    );

    setMemberNames(newMemberNames);
    setClassroom(fetchedClassroom);
  };

  const saveGroupsToFirestore = () => {
    setClassroom((prevClassroom) => {
      const currentGroups = prevClassroom.groups;
      const newGroups = {};

      // Filter out empty groups and reassign keys
      let newGroupIndex = 0;
      Object.keys(currentGroups).forEach((groupKey) => {
        if (currentGroups[groupKey].length > 0) {
          newGroups[newGroupIndex] = currentGroups[groupKey];
          newGroupIndex++;
        }
      });
      console.log("classname2", className);
      // Now newGroups contains only non-empty groups
      // Perform your save operation here (e.g., saving to a backend)
      saveGroups(roomId, newGroups, className);
      // Return the updated classroom object without empty groups
      return { ...prevClassroom, groups: newGroups };
    });
  };

  const moveMember = (fromIndexes, toGroupIndex) => {
    setClassroom((prevClassroom) => {
      // Deep cloning the groups to avoid direct state mutation
      const newGroups = { ...prevClassroom.groups };

      // Extracting the member's name from the source group
      const fromGroupIndex = fromIndexes.groupIndex;
      const fromMemberIndex = fromIndexes.memberIndex;
      const memberName = newGroups[fromGroupIndex][fromMemberIndex];

      // Remove the member from the original group
      newGroups[fromGroupIndex].splice(fromMemberIndex, 1);

      // Add the member to the destination group
      newGroups[toGroupIndex].push(memberName);

      // Return the updated classroom object with new groups
      return { ...prevClassroom, groups: newGroups };
    });
  };

  const createNewGroup = (memberIndex) => {
    setClassroom((prevClassroom) => {
      const newGroups = { ...prevClassroom.groups };
      const fromGroupIndex = memberIndex.groupIndex;
      const fromMemberIndex = memberIndex.memberIndex;
      const memberName = newGroups[fromGroupIndex][fromMemberIndex];

      // Remove member from the original group
      newGroups[fromGroupIndex].splice(fromMemberIndex, 1);

      // Create a new group with the member
      const newGroupIndex = Object.keys(newGroups).length;
      newGroups[newGroupIndex] = [memberName];

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

  const incrementSize = () => {
    setGroupSize(groupSize + 1);
  };

  const DecrementSize = () => {
    if (groupSize > 1) {
      setGroupSize(groupSize - 1);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f1f1",
          }}
        >
          <h2 className="class-info" style={{ marginLeft: "1rem" }}>
            Classroom: {roomId}
          </h2>
          <div style={{ display: "flex" }}>
            {isEditing ? (
              <TextField
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  inputProps: { maxLength: 35 },
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  },
                }}
                style={{
                  marginRight: "1.5rem",
                  marginTop: "1rem",
                  width: "100%",
                }}
                className="class-name-input"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <div style={{ display: "flex" }}>
                <h2
                  className="class-info"
                  style={{
                    marginRight: isProfessor ? "0rem" : "1rem",
                  }}
                >
                  {className}
                </h2>
                {isProfessor && (
                  <IconButton
                    color="primary"
                    onClick={isEditing ? handleSave : handleEditClick}
                    style={{
                      marginTop: ".75rem",
                      marginRight: "1rem",
                      height: "2rem",
                      width: "2rem",
                    }}
                  >
                    <CreateIcon
                      style={{ height: "1.25rem", width: "1.25rem" }}
                    />
                  </IconButton>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="body">
          <div className="groups">
            {isProfessor && (
              <div className="group-controls">
                <div className="size-counter">
                  <h3 className="counter-title">Group Size</h3>
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
                    <button className="counter-button" onClick={incrementSize}>
                      {" "}
                      +{" "}
                    </button>
                    <button className="counter-button" onClick={DecrementSize}>
                      {" "}
                      -{" "}
                    </button>
                  </div>
                </div>
                <ShuffleIcon
                  className="randomize-groups-button"
                  onClick={handleRandomizeGroups}
                  sx={{ fontSize: "30px", transition: "transform 0.3s" }}
                />
                <SmartMatchIcon
                  className="smart-match-button"
                  onClick={handleSmartMatch}
                  sx={{ fontSize: "30px", transition: "transform 0.3s" }}
                />
                <SaveIcon
                  className="save-groups-button"
                  onClick={saveGroupsToFirestore}
                  sx={{ fontSize: "30px", transition: "transform 0.3s" }}
                />
              </div>
            )}
            <div className="grid-container">
              {classroom.groups &&
                Object.entries(classroom.groups).map(([key, group], index) => (
                  <DroppableGroup
                    key={index}
                    group={group}
                    index={index}
                    moveMember={moveMember}
                    setCurrentlyDragging={setCurrentlyDragging}
                    currentlyDragging={currentlyDragging}
                    memberNames={memberNames}
                    isProfessor={isProfessor}
                  />
                ))}
              {currentlyDragging !== null && (
                <NewGroupArea createNewGroup={createNewGroup} />
              )}
            </div>
          </div>
          <div id="Members">
            <h3>Classroom Members ({memberNames.length})</h3>
            {memberNames.sort().map((member) => (
              <li key={member.name}>{member.name}</li>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Classroom;
