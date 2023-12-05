import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getDocument,
  getGroups,
  getUser,
  saveGroups,
} from "../firebase/firestoreService";
import "./styles/classroom.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";

import { IconButton, TextField } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

const ItemTypes = {
  MEMBER: "member",
};

const DraggableMember = ({
  name,
  index,
  moveMember,
  setCurrentlyDragging,
  currentlyDragging,
}) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.MEMBER,
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
  const className = `draggable-item ${
    isCurrentlyBeingDragged ? "dragging-item" : ""
  }`;

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
  const organizer = "CJ";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClassroom = await getDocument("classrooms", roomId);
        setClassroom(fetchedClassroom);
        setClassName(fetchedClassroom?.className || `${organizer}'s class`); // Use optional chaining

        const members = fetchedClassroom?.members || [];
        const newMemberNames = await Promise.all(
          members.map(async (member) => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  const handleRandomizeGroups = async () => {
    await getGroups(roomId, setGroups, memberNames, groupSize);
    const fetchedClassroom = await getDocument("classrooms", roomId);

    const members = fetchedClassroom?.members || [];
    const newMemberNames = await Promise.all(
      members.map(async (member) => {
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
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave();
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
                <h2 className="class-info">
                  {className ? className : `${organizer}'s Class`}{" "}
                </h2>
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
                  <CreateIcon style={{ height: "1.25rem", width: "1.25rem" }} />
                </IconButton>
              </div>
            )}
          </div>
        </div>

        <div className="body-container">
          <div className="groups">
            <div className="group-controls">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span
                  style={{
                    alignItems: "center",
                    fontWeight: "bold",
                    display: "flex",
                    margin: "2rem",
                    fontSize: "1.5rem",
                  }}
                >
                  {groupSize}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <button className="inc-dec-buttons"> + </button>
                  <button className="inc-dec-buttons"> - </button>
                </div>
                <button
                  className="randomize-groups-button"
                  onClick={handleRandomizeGroups}
                >
                  Randomize Groups
                </button>
                <button
                  className="save-groups-button"
                  onClick={saveGroupsToFirestore}
                >
                  Save
                </button>
              </div>
            </div>
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
                  />
                ))}
              {currentlyDragging !== null && (
                <NewGroupArea createNewGroup={createNewGroup} />
              )}
            </div>
          </div>
          <div id="Members">
            <h3>Classroom Members</h3>
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
