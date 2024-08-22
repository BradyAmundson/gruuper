import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, CircularProgress } from "@mui/material";
import "../pages/styles/MatchAnimationModal.css"; // Make sure to import the CSS file

const placeholderNames = ["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank", "Grace", "Hank"];

const MatchAnimationModal = ({ open, groups, memberNames }) => {
    const [animatedMembers, setAnimatedMembers] = useState([]);
    const [groupIndexToShow, setGroupIndexToShow] = useState(-1); // Index of the group to show
    const displayGroups = groups || {
        0: { members: [1, 2, 3] },
        1: { members: [4, 5, 6] },
        2: { members: [7, 8] },
    };

    const displayMemberNames = memberNames && memberNames.length > 1 ? memberNames : placeholderNames.map((name, index) => ({
        id: index,
        name,
    }));

    useEffect(() => {
        let timeoutId;
        let intervalId;

        if (open) {
            const members = Array(10).fill(Object.values(displayGroups).flatMap(group => group.members)).flat();
            setAnimatedMembers(members);
            setGroupIndexToShow(-1); // Reset group index when the modal opens

            // Delay showing the groups by 3 seconds
            timeoutId = setTimeout(() => {
                intervalId = setInterval(() => {
                    setGroupIndexToShow((prevIndex) => {
                        if (prevIndex >= Object.keys(displayGroups).length - 1) {
                            clearInterval(intervalId);
                            return prevIndex;
                        }
                        return prevIndex + 1;
                    });
                }, 1000); // Show each group one by one every second
            }, 3000); // Start showing groups after 3 seconds
        }

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            setGroupIndexToShow(-1); // Reset group index when the modal is closed or about to reopen
            setAnimatedMembers([]);  // Clear animated members
        };
    }, [open]); // Dependencies should only include 'open' to avoid unnecessary re-renders

    return (
        <Modal open={open}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" component="h2" textAlign="center">
                    Forming Groups...
                </Typography>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
                <Box sx={{ mt: 2, position: "relative", height: "200px" }}>
                    {animatedMembers.map((id, idx) => {
                        const memberName = displayMemberNames.find((member) => member.id === id)?.name || placeholderNames[idx % placeholderNames.length];
                        return (
                            <Typography
                                key={id}
                                className="swoop-animation"
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    opacity: 0,
                                    animationDelay: `${idx * 0.5}s`,
                                }}
                            >
                                {memberName}
                            </Typography>
                        );
                    })}
                </Box>
                <Box sx={{ mt: 2 }}>
                    {Object.entries(displayGroups).map(([index, group], idx) => (
                        <Typography
                            key={idx}
                            sx={{
                                mt: 1,
                                opacity: groupIndexToShow >= index ? 1 : 0,
                                transition: "opacity 1s ease-in",
                            }}
                        >
                            Group {parseInt(index) + 1}:{" "}
                            {group.members
                                .map(
                                    (id) =>
                                        displayMemberNames.find((member) => member.id === id)?.name
                                )
                                .join(", ")}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Modal>
    );
};

export default MatchAnimationModal;
