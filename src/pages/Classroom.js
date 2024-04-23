import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Redirect } from "react-router-dom";
import {
  getDocument,
  getGroups,
  getUser,
  saveGroups,
  saveClassname,
  removeMemberFromClassroom,
} from "../firebase/firestoreService";
import "./styles/classroom.css";
// import { increment } from "firebase/firestore";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";


import { IconButton, TextField } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import SaveIcon from "@mui/icons-material/Save";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SmartMatchIcon from "@mui/icons-material/Group";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';



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
  locked,
  toggleLockGroup
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => moveMember(item.index, index),
  }));
  return (
    <div ref={drop} id="Groups">
      <h3>Group {index + 1} <IconButton onClick={() => toggleLockGroup(index)}>
        {locked ? <LockIcon /> : <LockOpenIcon />}
      </IconButton></h3>
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
    drop: (item, monitor) => {
      console.log("New group with:", item);
      createNewGroup(item.index);
    }
  }));

  return (
    <div ref={drop} className="new-group-area">
      <p className="new-group-plus"><AddIcon fontSize="large" /></p>
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
  memberNames
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item, monitor) => {
      console.log("Dropping item into unmatched:", item);
      moveMember(item.index, -1);
    }
  }));

  const style = {
    filter: unmatchedMembers.length === 0 ? 'grayscale(1)' : 'none'
  };

  return (
    <div ref={drop} id="UnmatchedGroups" style={style}>
      <h3>Unmatched Members</h3>
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
    </div>
  );
};




const Classroom = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");
  const [classroom, setClassroom] = useState([]);
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

  // Show/Hide Members button position
  const buttonRightPosition = showMembers ? '400px' : '50px';
  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  // Group Locking
  const toggleLockGroup = (index) => {
    setLockedGroups(prevState => {
      // Create a copy of the previous state
      const newState = { ...prevState };
      // Toggle the lock status of the specified group index
      newState[index] = !prevState[index];
      // Return the updated state
      return newState;
    });
  };

  useEffect(() => {
    console.log("Locked Groups:", lockedGroups);
  }, [lockedGroups]);

  useEffect(() => {
    console.log("UNMATCH MEMBERS:", unmatchedMembers);
  }, [unmatchedMembers]);

  const moveMember = useCallback((fromIndexes, toGroupIndex) => {
    setClassroom(prevClassroom => {
      // Logic inside here has access to the most current 'prevClassroom'
      const newGroups = { ...prevClassroom.groups };

      let member;
      if (fromIndexes.groupIndex === -1) {
        // Correct approach to access the current unmatchedMembers state safely
        setUnmatchedMembers(prevUnmatched => {
          const updatedUnmatched = [...prevUnmatched];
          member = updatedUnmatched.splice(fromIndexes.memberIndex, 1)[0];
          return updatedUnmatched;
        });
      } else {
        member = newGroups[fromIndexes.groupIndex].splice(fromIndexes.memberIndex, 1)[0];
      }

      if (toGroupIndex !== -1) {
        newGroups[toGroupIndex] = newGroups[toGroupIndex] || [];
        newGroups[toGroupIndex].push(member);
      } else {
        setUnmatchedMembers(prevUnmatched => [...prevUnmatched, member]);
      }

      return { ...prevClassroom, groups: newGroups };
    });
  }, []);

  const updateUnmatchedMembers = (allMembers, groups) => {
    const groupedMembers = new Set();
    Object.values(groups).forEach(group => {
      group.forEach(member => {
        groupedMembers.add(member);
      });
    });

    const unmatched = allMembers.filter(member => !groupedMembers.has(member));
    setUnmatchedMembers(unmatched);
  };


  const removeMemberFromGroup = (fromIndexes) => {
    console.log("Removing member from group, received indexes:", fromIndexes);
    setClassroom(prevClassroom => {
      // Extract the group index and member index from fromIndexes
      const { groupIndex, memberIndex } = fromIndexes;
      if (groupIndex === -1) {
        // Handle error or unexpected index
        console.error("Invalid groupIndex for removal from group:", groupIndex);
        return prevClassroom;
      }

      const newGroups = { ...prevClassroom.groups };
      const member = newGroups[groupIndex].splice(memberIndex, 1)[0];
      console.log("Member removed:", member);

      setUnmatchedMembers(prevUnmatched => [...prevUnmatched, member]);
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
        // Fetch the classroom details
        const fetchedClassroom = await getDocument("classrooms", roomId);
        if (!fetchedClassroom) {
          console.error("Failed to fetch classroom data");
          return;
        }
        setClassroom(fetchedClassroom);

        // Fetch and set groups
        const fetchedGroups = fetchedClassroom.groups || {};
        setGroups(fetchedGroups);

        // Set up classroom name
        const fetchedUser = await getUser(fetchedClassroom?.instructor);
        const className = fetchedClassroom?.className || `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""}'s Class`;
        setClassName(className);

        // Check if the current user is the professor
        const isProfessor = localStorage.getItem("userType") === "Professor" && localStorage.getItem("userId") === fetchedClassroom?.instructor;
        setIsProfessor(isProfessor);

        if (!isProfessor) {
          const code = query.get("roomId");
          navigate(`/student-view?roomId=${code}`);
        }

        // Fetch and set member names
        const members = fetchedClassroom?.members || [];
        const newMemberNames = await Promise.all(members.map(async (member) => {
          const user = await getUser(member);
          return { id: member, name: `${user?.firstName || ""} ${user?.lastName || ""}` };
        }));
        setMemberNames(newMemberNames);

        // Update unmatched members based on the current groups
        updateUnmatchedMembers(members, fetchedGroups);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);



  const handleDeleteMember = async (userId, roomId) => {
    try {
      // Remove the member from the Firestore database
      await removeMemberFromClassroom(roomId, userId);

      // Update state to reflect these changes
      setClassroom(prevClassroom => {
        const newGroups = { ...prevClassroom.groups };

        // Iterate over each group and filter out the deleted member
        Object.keys(newGroups).forEach(groupKey => {
          newGroups[groupKey] = newGroups[groupKey].filter(memberId => memberId !== userId);
        });

        // Return the updated classroom with the member removed from all groups
        return { ...prevClassroom, groups: newGroups };
      });

      // Update the memberNames state to remove the member entirely from the classroom
      setMemberNames(prevMembers => prevMembers.filter(member => member.id !== userId));

      // If using unmatched members, update that list too
      setUnmatchedMembers(prevUnmatched => prevUnmatched.filter(member => member.id !== userId));
    } catch (error) {
      console.error("Failed to delete member from classroom:", error);
    }
  };



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
    console.log("Triggering randomization process...");

    // Fetch the latest classroom state
    const fetchedClassroom = await getDocument("classrooms", roomId);
    console.log("Fetched classroom:", fetchedClassroom);

    const allMembers = fetchedClassroom?.members || [];
    console.log("All members:", allMembers);

    // Load the current state of locked groups
    const currentLockedGroups = fetchedClassroom?.lockedGroups || {};

    // Collect IDs of members in locked groups
    const lockedMembers = new Set();
    Object.entries(currentLockedGroups).forEach(([groupIndex, group]) => {
      if (group.isLocked) {
        group.forEach(member => lockedMembers.add(member));
      }
    });

    // Filter out members in locked groups and already matched members
    const unlockedAndUnmatchedMembers = allMembers.filter(member =>
      !lockedMembers.has(member) && !unmatchedMembers.includes(member)
    );

    console.log("Unlocked and unmatched members:", unlockedAndUnmatchedMembers);

    // Get new groups with only unlocked and unmatched members
    await getGroups(roomId, setGroups, unlockedAndUnmatchedMembers, groupSize);

    // Update the classroom state
    setClassroom(prevClassroom => {
      // Update only the unlocked groups with new group data
      const newGroups = { ...prevClassroom.groups };
      unlockedAndUnmatchedMembers.forEach((member, index) => {
        const groupIndex = Math.floor(index / groupSize);
        if (!newGroups[groupIndex]) {
          newGroups[groupIndex] = [];
        }
        newGroups[groupIndex].push(member);
      });

      return { ...prevClassroom, groups: newGroups };
    });

    // Update member names based on new groups
    const newMemberNames = await Promise.all(
      allMembers.map(async (member) => {
        const fetchedUser = await getUser(member);
        return {
          id: member,
          name: `${fetchedUser?.firstName || ""} ${fetchedUser?.lastName || ""}`,
        };
      })
    );
    console.log("New member names:", newMemberNames);
    setMemberNames(newMemberNames);
  };


  useEffect(() => {
    console.log("Groups updated:", groups);
    // Ensure the UI reflects the updated state immediately
    setClassroom(prevClassroom => ({
      ...prevClassroom,
      groups: groups // Update with the new groups state
    }));
  }, [groups]);

  useEffect(() => {
    console.log("Locked Groups updated:", lockedGroups);
    // Ensure the UI reflects the updated state immediately
    setClassroom(prevClassroom => ({
      ...prevClassroom,
      lockedGroups: lockedGroups // Update with the new lockedGroups state
    }));
  }, [lockedGroups]);

  useEffect(() => {
    // Initialize lockedGroups when classroom.groups changes
    if (classroom.groups) {
      const numGroups = Object.keys(classroom.groups).length;
      const initialLockedGroups = {};
      for (let i = 0; i < numGroups; i++) {
        initialLockedGroups[i] = false;
      }
      setLockedGroups(initialLockedGroups);
    }
  }, [classroom.groups]);

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


  const createNewGroup = (fromIndexes) => {
    setClassroom(prevClassroom => {
      const { groups: currentGroups, unmatchedMembers: currentUnmatched } = prevClassroom;
      const newGroups = { ...currentGroups };
      let member;

      if (fromIndexes.groupIndex === -1) {
        // Member is coming from the unmatched members list
        setUnmatchedMembers(prevUnmatched => {
          const updatedUnmatched = [...prevUnmatched];
          member = updatedUnmatched.splice(fromIndexes.memberIndex, 1)[0];
          return updatedUnmatched;
        });
      } else {
        // Member is coming from an existing group
        member = newGroups[fromIndexes.groupIndex][fromIndexes.memberIndex][0];
        newGroups[fromIndexes.groupIndex].splice(fromIndexes.memberIndex, 1);
      }

      // Create a new group and add the member
      const newGroupIndex = Object.keys(newGroups).length;
      newGroups[newGroupIndex] = [member];

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
          {isProfessor && (
            <div className="control-center">
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
              <div className="group-controls">

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
                  locked={lockedGroups[index]}
                  toggleLockGroup={toggleLockGroup}
                />
              ))}
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
          <div>
            <button
              onClick={toggleMembers}
              className="show-members-btn"
              style={{ right: buttonRightPosition }}
            >
              {showMembers ? "Hide Members" : "Show Members"}
            </button>

            <div
              id="Members"
              style={{ right: showMembers ? '20px' : '-320px' }}  // Conditional styling based on showMembers state
            >
              <h3>Classroom Members ({memberNames.length})</h3>
              <ul>
                {memberNames.sort((a, b) => a.name.localeCompare(b.name)).map((member) => (
                  <li key={member.id}>
                    {member.name}
                    <IconButton
                      onClick={() => handleDeleteMember(member.id, roomId)}
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
      </div>
    </DndProvider>
  );
};

export default Classroom;
