import { faDizzy, faZ } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const NotificationModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "notification-modal-overlay") {
      onClose();
    }
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
    width: "30%",
    minWidth: "300px",
    marginLeft: "110px",
    height: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column",
  };

  const modalContentMobileStyle = {
    ...modalContentStyle,
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
    height: "calc(100vh - 40px)",
    marginLeft: "0px",
    marginBottom: "40px",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "5px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    color: "#888",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    width: "25px",
    height: "25px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  // Kiểm tra kích thước màn hình để chọn style cho modal
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className="notification-modal-overlay"
      style={modalOverlayStyle}
      onClick={handleOverlayClick}
    >
      <div
        className="notification-modal-content"
        style={isMobile ? modalContentMobileStyle : modalContentStyle}
      >
        <button onClick={onClose} style={closeButtonStyle}>
          ×
        </button>
        
        {/* Phần content trống để có thể tùy chỉnh sau */}
        {children}
      </div>
    </div>
  );
};

export default NotificationModal;