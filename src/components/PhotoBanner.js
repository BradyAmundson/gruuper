import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import photo1 from "../images/group4.jpg";
import photo2 from "../images/group2.jpg";
import photo3 from "../images/group6.jpg";
import "./PhotoBanner.css";

const PhotoBanner = () => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = [photo1, photo2, photo3];

  useEffect(() => {
    // Set up an interval to change the photo every 3 seconds
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 8000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <Paper
      className="photo-banner-container"
      style={{ textAlign: "center", zIndex: 0 }}
    >
      <div className="photo-banner">
        {photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={""}
            className={index === currentPhotoIndex ? "visible" : "hidden"}
          />
        ))}
      </div>
    </Paper>
  );
};

export default PhotoBanner;
