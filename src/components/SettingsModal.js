import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "../pages/styles/SettingsModal.css";

const SettingsModal = ({ open, onClose, classroomData = {}, onSave, onDelete }) => {
    const [className, setClassName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");

    useEffect(() => {
        if (classroomData) {
            setClassName(classroomData.className || "");
            setCourseNumber(classroomData.courseNumber || "");
            setGradeLevel(classroomData.gradeLevel || "");
        }
    }, [classroomData]);

    const handleSave = () => {
        onSave({ className, courseNumber, gradeLevel });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this classroom? This action cannot be undone.")) {
            onDelete();
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="modal-container">
                <Box className="modal-header">
                    <Typography variant="h6">Classroom Settings</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {classroomData ? (
                    <Box className="classroom-info">
                        <Typography variant="body1"><strong>Classroom Name:</strong> {classroomData.className || "N/A"}</Typography>
                        <Typography variant="body1"><strong>Instructor Name:</strong> {classroomData.instructor || "N/A"}</Typography>
                        <Typography variant="body1"><strong>Created At:</strong> {classroomData.createdAt ? new Date(classroomData.createdAt).toLocaleString() : "N/A"}</Typography>
                    </Box>
                ) : (
                    <Box className="classroom-info">
                        <Typography variant="body1" color="error">Classroom data is not available.</Typography>
                    </Box>
                )}

                <Box mt={2}>
                    <TextField
                        label="Classroom Name"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Course Number"
                        value={courseNumber}
                        onChange={(e) => setCourseNumber(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Grade Level</InputLabel>
                        <Select
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            label="Grade Level"
                        >
                            <MenuItem value="Freshman">Freshman</MenuItem>
                            <MenuItem value="Sophomore">Sophomore</MenuItem>
                            <MenuItem value="Junior">Junior</MenuItem>
                            <MenuItem value="Senior">Senior</MenuItem>
                            <MenuItem value="Graduate">Graduate</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box className="button-group">
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDelete}>
                        Delete Classroom
                    </Button>
                </Box>
            </Box>
        </Modal>

    );
};

export default SettingsModal;
