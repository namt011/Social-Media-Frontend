import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  const modalOverlayStyle = {
    position: "fixed",
    zIndex: 10000,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
    width: "40%",
    minWidth: "300px",
  };

  const modalContentMobileStyle = {
    ...modalContentStyle,
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
    height: "100%",
    maxHeight: "100%",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px", // Move to the top
    right: "10px", // Move to the right
    backgroundColor: "transparent", // Make it transparent
    border: "none", // Remove the border
    color: "black", // Set the icon color
    fontSize: "20px", // Increase the icon size
    cursor: "pointer",
    zIndex: 10001,
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className="modal-overlay"
      style={modalOverlayStyle}
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        style={isMobile ? modalContentMobileStyle : modalContentStyle}
      >
        <button onClick={onClose} style={closeButtonStyle}>
        <i className="bi bi-x-lg" style={{fontSize:'24px'}}></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
