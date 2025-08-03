import React, { useState, useRef } from 'react';
import Modal from './popup/Modal';
import CloudinaryUpload from './Testupimage';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, 
  faSmile, 
  faMapMarkerAlt, 
  faGlobe, 
  faUserFriends, 
  faLock, 
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

import { CreatePost } from '../service/PostService';

const CreatePostModal = ({ showModal, handleClose, handleBackdropClick }) => {
  const [postContent, setPostContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [privacy, setPrivacy] = useState('public');
  const [showUploader, setShowUploader] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef(null);
  const cloudinaryRef = useRef(null);

  // Handle file upload complete
  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  // Handle file removal
  const handleRemoveFile = (index, newFiles) => {
    setUploadedFiles(newFiles);
  };

  // Handle post submission
  const handlePostSubmit = async () => {
    const userID = parseInt(Cookies.get('c_user'), 10);
    
    if (isNaN(userID)) {
      console.error('UserID not found in cookies');
      alert('Vui lòng đăng nhập lại');
      return;
    }

    if (!postContent.trim() && uploadedFiles.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn media để đăng');
      return;
    }

    try {
      console.log('Starting post creation:', {
        userID,
        content: postContent,
        filesCount: uploadedFiles.length
      });

      // First upload files if any
      let mediaRequests = [];
      if (cloudinaryRef.current && uploadedFiles.length > 0) {
        try {
          const uploadedMediaFiles = await cloudinaryRef.current.handleUpload();
          console.log('Files uploaded successfully:', uploadedMediaFiles);

          // Transform uploaded files to required format
          mediaRequests = uploadedMediaFiles.map(file => ({
            url: file.url,
            type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'
          }));

          console.log('Transformed mediaRequests:', mediaRequests);
        } catch (error) {
          console.error('Media upload failed:', error);
          alert('Tải lên media thất bại. Vui lòng thử lại.');
          return;
        }
      }

      const postData = {
        subjectOfThePost: postContent.substring(0, 50) || "Bài viết mới",
        postContent: postContent,
        mediaRequests: mediaRequests,
        privacy: privacy
      };

      console.log('Sending post data:', postData);

      const response = await CreatePost(postData);
      console.log('Post created successfully:', response);

      // Reset form
      setPostContent('');
      setUploadedFiles([]);
      setShowUploader(false);
      setShowEmojis(false);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại.');
    }
  };

  // Toggle the uploader visibility
  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  // Get privacy icon
  const getPrivacyIcon = () => {
    switch(privacy) {
      case 'public': return faGlobe;
      case 'friends': return faUserFriends;
      case 'private': return faLock;
      default: return faGlobe;
    }
  };

  // Get privacy text
  const getPrivacyText = () => {
    switch(privacy) {
      case 'public': return 'Công khai';
      case 'friends': return 'Bạn bè';
      case 'private': return 'Chỉ mình tôi';
      default: return 'Công khai';
    }
  };

  // Add emoji to post content
  const addEmoji = (emoji) => {
    setPostContent(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Simple emoji picker component
  const EmojiPicker = () => {
    const emojis = ['😀', '😂', '😍', '🥰', '😎', '🙌', '👍', '❤️', '🔥', '😊', '🥳', '🤔', '😢', '😭', '🤗', '👋', '🎉', '✨', '🌈', '🌹'];
    
    return (
      <div className="emoji-picker p-2 bg-white rounded shadow-sm border" style={{ maxWidth: '800px' }}>
        <div className="d-flex flex-wrap">
          {emojis.map((emoji, index) => (
            <div 
              key={index} 
              className="emoji-item p-1" 
              style={{ cursor: 'pointer', fontSize: '1.5rem' }}
              onClick={() => addEmoji(emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={showModal} onClose={handleClose}>
      <div className="modal-header border-bottom pb-2 mb-3 position-relative">
        <h5 className="modal-title w-100 text-center">Tạo bài viết mới</h5>
      </div>
      
      <div className="modal-body">
        {/* User info and privacy settings */}
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153743/LOgoDon-Photoroom_c3j3qa.png"
            alt="Avatar"
            className="rounded-circle me-2"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <h6 className="mb-0">Tên người dùng</h6>
            
            <div className="dropdown">
              <button 
                className="btn btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                id="dropdownMenuButton1"
                style={{ backgroundColor: '#C0FFD1', fontSize: '12px' }}
              >
                <FontAwesomeIcon icon={getPrivacyIcon()} className="me-1" />
                {getPrivacyText()}
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <a 
                    className="dropdown-item cursor-pointer" 
                    onClick={() => setPrivacy('public')}
                  >
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Công khai
                  </a>
                </li>
                <li>
                  <a 
                    className="dropdown-item cursor-pointer" 
                    onClick={() => setPrivacy('friends')}
                  >
                    <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                    Bạn bè
                  </a>
                </li>
                <li>
                  <a 
                    className="dropdown-item cursor-pointer" 
                    onClick={() => setPrivacy('private')}
                  >
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Chỉ mình tôi
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Post content textarea */}
        <textarea
          ref={textareaRef}
          className="form-control border-0 mb-3"
          placeholder="Bạn đang nghĩ gì?"
          rows="5"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          style={{ resize: 'none', fontSize: '18px' }}
        ></textarea>
        
        {/* Cloudinary uploader */}
        {showUploader && (
          <div className="mb-3">
            <CloudinaryUpload 
              ref={cloudinaryRef}
              onFileUpload={handleFileUpload} 
              onRemoveFile={handleRemoveFile}
              initialFiles={uploadedFiles}
              maxFiles={10}
            />
          </div>
        )}
        
        {/* Emoji picker */}
        {showEmojis && (
          <div className="mb-3">
            <EmojiPicker />
          </div>
        )}
        
        {/* Add to post section */}
        <div 
          className="p-3 rounded mb-3" 
          style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}
        >
          <p className="mb-2 fw-bold">Thêm vào bài viết</p>
          <div className="d-flex flex-wrap">
            <button 
              className={`btn me-2 mb-2 ${showUploader ? 'btn-success' : ''}`}
              style={{ backgroundColor: showUploader ? '' : '#C0FFD1' }}
              onClick={toggleUploader}
            >
              <FontAwesomeIcon icon={faImage} className={showUploader ? 'text-white' : 'text-success'} />
              <span className="ms-2">{showUploader ? 'Đóng uploader' : 'Ảnh/Video'}</span>
            </button>
            
            <button 
              className={`btn me-2 mb-2 ${showEmojis ? 'btn-warning' : ''}`}
              style={{ backgroundColor: showEmojis ? '' : '#C0FFD1' }}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <FontAwesomeIcon icon={faSmile} className={showEmojis ? 'text-white' : 'text-warning'} />
              <span className="ms-2">Cảm xúc</span>
            </button>
            
           
          </div>
        </div>
      </div>
      
      {/* Preview of uploaded files */}
      {uploadedFiles.length > 0 && !showUploader && (
        <div className="uploaded-files-preview mb-3">
          <div className="row g-2">
            {uploadedFiles.slice(0, 4).map((file, index) => (
              <div key={index} className="col-3">
                <div className="preview-item" style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.name || `Uploaded ${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : file.type.startsWith('video/') ? (
                    <div style={{ 
                      backgroundColor: '#000', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}>
                      🎬
                    </div>
                  ) : (
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      📄
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      const newFiles = [...uploadedFiles];
                      newFiles.splice(index, 1);
                      setUploadedFiles(newFiles);
                    }}
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-0"
                    style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesomeIcon icon={faTimes} size="xs" />
                  </button>
                </div>
              </div>
            ))}
            
            {uploadedFiles.length > 4 && (
              <div className="col-3">
                <div 
                  className="more-files" 
                  style={{ 
                    height: '80px', 
                    borderRadius: '8px', 
                    backgroundColor: '#f8f9fa', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer' 
                  }}
                  onClick={toggleUploader}
                >
                  +{uploadedFiles.length - 4}
                </div>
              </div>
            )}
          </div>
          
          {!showUploader && (
            <div className="text-center mt-2">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={toggleUploader}
              >
                Chỉnh sửa tệp đính kèm
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Post button */}
      <div className="d-grid gap-2 mt-3">
        <button 
          className="btn btn-lg"
          style={{ 
            backgroundColor: '#C0FFD1',
            borderColor: '#28a745',
            color: '#218838',
            fontWeight: 'bold'
          }}
          disabled={!postContent && uploadedFiles.length === 0}
          onClick={handlePostSubmit}
        >
          Đăng
        </button>
      </div>
    </Modal>
  );
};

export default CreatePostModal;