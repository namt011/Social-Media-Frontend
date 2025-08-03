import React, { useState } from 'react';
import Modal from './popup/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, 
  faUserFriends, 
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { CreatePost } from '../service/PostService';

const SharePostModal = ({ showModal, handleClose, postToShare }) => {
  const [postContent, setPostContent] = useState('');
  const [privacy, setPrivacy] = useState('public');

  // Handle post submission
  const handleShareSubmit = async () => {
    try {
      const postData = {
        subjectOfThePost: "Chia sẻ bài viết",
        postContent: postContent,
        mediaRequests: [], // Empty as sharing doesn't need new media
        sharedPostId: postToShare.postID, // ID of the post being shared
        privacy: privacy
      };

      console.log('Sending share post data:', postData);

      const response = await CreatePost(postData);
      console.log('Post shared successfully:', response);

      // Reset form
      setPostContent('');
      handleClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Đã có lỗi xảy ra khi chia sẻ bài viết. Vui lòng thử lại.');
    }
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

  return (
    <Modal isOpen={showModal} onClose={handleClose}>
      <div className="modal-header border-bottom pb-2 mb-3">
        <h5 className="modal-title w-100 text-center">Chia sẻ bài viết</h5>
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
                style={{ backgroundColor: '#C0FFD1', fontSize: '12px' }}
              >
                <FontAwesomeIcon icon={getPrivacyIcon()} className="me-1" />
                {getPrivacyText()}
              </button>
              <ul className="dropdown-menu">
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
        
        {/* Share content textarea */}
        <textarea
          className="form-control border-0 mb-3"
          placeholder="Bạn muốn nói gì về bài viết này?"
          rows="3"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          style={{ resize: 'none', fontSize: '18px' }}
        ></textarea>

        {/* Original post preview */}
        
      </div>
      
      {/* Share button */}
      <div className="d-grid gap-2">
        <button 
          className="btn btn-lg"
          style={{ 
            backgroundColor: '#C0FFD1',
            borderColor: '#28a745',
            color: '#218838',
            fontWeight: 'bold'
          }}
          onClick={handleShareSubmit}
        >
          Chia sẻ ngay
        </button>
      </div>
    </Modal>
  );
};

export default SharePostModal;