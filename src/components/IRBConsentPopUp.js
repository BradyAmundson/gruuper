import React from "react";
import Modal from "react-modal";
import Button from "@mui/material/Button";
import { updateUser, getUser } from "../firebase/firestoreService";
const pdfUrl = "../../gruuperpposter.pdf";

Modal.setAppElement("#root");

const IRBConsentPopUp = ({ isOpen, onRequestClose }) => {
  const userId = localStorage.getItem("userId");
  const customStyles = {
    content: {
      backgroundColor: "white",
      width: "25rem",
      minHeight: "15rem",
      margin: "auto",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      height: "fit-content",
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
  };

  const handleDisagree = async () => {
    await updateUser(userId, { consent: false });
    onRequestClose();
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
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
      <p>Please read the IRB Consent Form carefully before proceeding.</p>
      <p>
        Gruuper is participating in an academic study to assess the efficacy of
        grouping strategies in class teams on group satisfaction and academic
        outcomes. You will be able to use Gruuper regardless of your
        participation in the study (which is completely voluntary and will not
        affect your assigned group or grade), but your data will only be
        included if you agree to the following:
        <br />
        <a href={pdfUrl} download="IRB-Gruuper-T&C.pdf">
          Terms and Conditions
        </a>
      </p>
      <p>
        By clicking the button below, you are agreeing to the terms and
        conditions of the IRB Consent Form.
      </p>

      <div style={buttonContainerStyle}>
        <Button
          variant="contained"
          color="secondary"
          onClick={async () => handleDisagree()}
        >
          I Disagree
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => handleAgree()}
        >
          I Agree
        </Button>
      </div>
    </Modal>
  );
};

export default IRBConsentPopUp;
