import React, { useState } from "react";
import Modal from "./Modal";

const PostCreationModal = ({ isOpen, onClose }) => {
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [privacy, setPrivacy] = useState("public");

  const handlePostSubmit = () => {
    // Here you would handle the post submission logic
    console.log({
      postText,
      selectedImage,
      privacy
    });
    
    // Reset form and close modal
    setPostText("");
    setSelectedImage(null);
    onClose();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const modalHeaderStyle = {
    borderBottom: "1px solid #dee2e6",
    paddingBottom: "15px",
    marginBottom: "15px",
    textAlign: "center",
    position: "relative"
  };

  const mainColor = "#C0FFD1";
  
  const actionButtonStyle = {
    backgroundColor: mainColor,
    borderColor: "#28a745",
    color: "#218838",
    fontWeight: "bold"
  };

  const profilePicStyle = {
    width: "40px",
    height: "40px"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h5 className="modal-title">Tạo bài viết mới</h5>
      </div>
      
      <div className="modal-body">
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="rounded-circle me-2"
            style={profilePicStyle}
          />
          <div>
            <h6 className="mb-0">Tên người dùng</h6>
            <div className="dropdown">
              <button 
                className="btn btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                style={{ backgroundColor: mainColor, fontSize: "12px" }}
              >
                {privacy === "public" && <i className="bi bi-globe2 me-1"></i>}
                {privacy === "friends" && <i className="bi bi-people me-1"></i>}
                {privacy === "private" && <i className="bi bi-lock me-1"></i>}
                {privacy === "public" && "Công khai"}
                {privacy === "friends" && "Bạn bè"}
                {privacy === "private" && "Chỉ mình tôi"}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a 
                    className="dropdown-item" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPrivacy("public");
                    }}
                  >
                    <i className="bi bi-globe2 me-2"></i>Công khai
                  </a>
                </li>
                <li>
                  <a 
                    className="dropdown-item" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPrivacy("friends");
                    }}
                  >
                    <i className="bi bi-people me-2"></i>Bạn bè
                  </a>
                </li>
                <li>
                  <a 
                    className="dropdown-item" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPrivacy("private");
                    }}
                  >
                    <i className="bi bi-lock me-2"></i>Chỉ mình tôi
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <textarea
          className="form-control border-0 mb-3"
          placeholder="Bạn đang nghĩ gì?"
          rows="5"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          style={{ resize: "none", fontSize: "18px" }}
        ></textarea>
        
        {selectedImage && (
          <div className="position-relative mb-3">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="img-fluid rounded"
              style={{ maxHeight: "200px", width: "auto" }}
            />
            <button 
              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
              onClick={() => setSelectedImage(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}
        
        <div 
          className="p-3 rounded mb-3" 
          style={{ backgroundColor: "#f8f9fa", border: "2px dashed #dee2e6" }}
        >
          <p className="mb-2 fw-bold">Thêm vào bài viết</p>
          <div className="d-flex">
            <button 
              className="btn me-2" 
              style={{ backgroundColor: mainColor }}
              onClick={() => document.getElementById("image-upload").click()}
            >
              <i className="bi bi-image text-success"></i>
              <span className="ms-2">Ảnh/Video</span>
            </button>
            <input
              type="file"
              id="image-upload"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            
            <button className="btn me-2" style={{ backgroundColor: mainColor }}>
              <i className="bi bi-emoji-smile text-warning"></i>
              <span className="ms-2">Cảm xúc</span>
            </button>
            
          </div>
        </div>
      </div>
      
      <div className="d-grid gap-2 mb-3">
        <button 
          className="btn btn-lg"
          style={actionButtonStyle}
          disabled={!postText && !selectedImage}
          onClick={handlePostSubmit}
        >
          Đăng
        </button>
      </div>
    </Modal>
  );
};

export default PostCreationModal;