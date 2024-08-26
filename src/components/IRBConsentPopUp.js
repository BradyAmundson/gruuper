import React from "react";
import Modal from "react-modal";
import Button from "@mui/material/Button";
import { updateUser } from "../firebase/firestoreService";
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { useNavigate } from "react-router-dom";
import "@react-pdf-viewer/core/lib/styles/index.css";
const pdfUrl = "/docs/Informed Consent Form Updated RCR 5.9.23.pdf";

Modal.setAppElement("#root");

const IRBConsentPopUp = ({ isOpen, onRequestClose }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const customStyles = {
    content: {
      backgroundColor: "white",
      width: "30rem",
      height: "80vh",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      borderRadius: "20px",
      border: "5px solid #6db3f2",
      padding: "30px",
      position: "absolute",
      zIndex: 9999,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      overflow: "hidden",
      zIndex: 9998,
    },
  };

  const handleAgree = async () => {
    await updateUser(userId, { consent: true });
    onRequestClose();
    if (localStorage.getItem("userType") !== "Professor") {
      navigate("/edit-profile");
    }
  };

  const handleDisagree = async () => {
    await updateUser(userId, { consent: false });
    onRequestClose();
    if (localStorage.getItem("userType") !== "Professor") {
      navigate("/edit-profile");
    }
  };

  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
  };

  const agreeButtonStyle = {
    marginBottom: "10px",
    width: "100%",
    background: "linear-gradient(145deg, #6db3f2, #1e5799)",
    color: "white",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "1.25rem",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s",
    textAlign: "center",
  };

  const disagreeButtonStyle = {
    width: "100%",
    background: "transparent",
    color: "#6db3f2",
    textTransform: "none",
    boxShadow: "none",
    borderRadius: "10px",
    // padding: "10px 20px",
    fontSize: "0.75rem",
    cursor: "pointer",
    transition: "color 0.3s, transform 0.3s",
    textAlign: "center",
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="IRB Consent Form"
      shouldCloseOnOverlayClick={false}
    >
      <h2>IRB Consent Form</h2>
      <p>
        Hello! Gruuper is a part of a research project that will require data
        collection and analysis. Please review the IRB Consent Form before
        proceeding!
      </p>
      <div
        style={{
          height: "50vh",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <Worker
          workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
        >
          <Viewer fileUrl={pdfUrl} />
        </Worker>
      </div>
      <div style={buttonContainerStyle}>
        <Button
          variant="contained"
          style={agreeButtonStyle}
          onClick={async () => handleAgree()}
        >
          I Agree
        </Button>
        <Button
          variant="text"
          style={disagreeButtonStyle}
          onClick={async () => handleDisagree()}
        >
          I Disagree
        </Button>
      </div>
    </Modal>
  );
};

export default IRBConsentPopUp;
