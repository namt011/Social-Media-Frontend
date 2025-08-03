import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, 
  faSmile,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import CloudinaryUpload from '../Testupimage';
import Modal from '../popup/Modal';
import groupPostService from '../../service/GroupPostService';
import 'react-toastify/dist/ReactToastify.css';

const CreateGroupPostModal = ({ showModal, handleClose, handleBackdropClick, groupId, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const cloudinaryRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileSelect = (files) => {
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc chọn media để đăng');
      return;
    }

    setIsSubmitting(true);
    try {
      // First upload files if any
      let mediaRequests = [];
      if (cloudinaryRef.current && selectedFiles.length > 0) {
        try {
          mediaRequests = await cloudinaryRef.current.handleUpload();
        } catch (error) {
          toast.error('Tải lên media thất bại. Vui lòng thử lại.');
          console.error('Media upload failed:', error);
          return;
        }
      }

      // Create post data
      const postData = {
        content: content,
        mediaIds: mediaRequests
      };

      // Create the post
      await groupPostService.createPost(groupId, postData);
      
      toast.success('Đăng bài viết thành công!');
      
      // Reset form
      setContent('');
      setShowUploader(false);
      setShowEmojis(false);
      handleClose();
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple emoji picker component
  const EmojiPicker = () => {
    const emojis = ['😀', '😂', '😍', '🥰', '😎', '🙌', '👍', '❤️', '🔥', '😊'];
    
    return (
      <div className="emoji-picker p-2 bg-white rounded shadow-sm border">
        <div className="d-flex flex-wrap">
          {emojis.map((emoji, index) => (
            <div 
              key={index} 
              className="emoji-item p-1" 
              style={{ cursor: 'pointer', fontSize: '1.5rem' }}
              onClick={() => setContent(prev => prev + emoji)}
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
      <div className="modal-header border-bottom pb-2 mb-3">
        <h5 className="modal-title w-100 text-center">Tạo bài viết mới</h5>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </div>

      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="form-control border-0 mb-3"
            rows="4"
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              backgroundColor: '#e6ffed',
              resize: 'none',
              fontSize: '16px'
            }}
          ></textarea>

          {showUploader && (
            <div className="mb-3">
              <CloudinaryUpload 
                ref={cloudinaryRef}
                maxFiles={10}
                showPreview={true}
                onFileUpload={handleFileSelect}
              />
            </div>
          )}

          {showEmojis && (
            <div className="mb-3">
              <EmojiPicker />
            </div>
          )}

          <div className="d-flex align-items-center mb-3 p-2 rounded" 
               style={{ backgroundColor: '#e6ffed' }}>
            <button 
              type="button"
              className={`btn me-2 ${showUploader ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setShowUploader(!showUploader)}
            >
              <FontAwesomeIcon icon={faImage} className="me-1" />
              {showUploader ? 'Đóng' : 'Thêm ảnh/video'}
            </button>
            <button 
              type="button"
              className={`btn me-2 ${showEmojis ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <FontAwesomeIcon icon={faSmile} className="me-1" />
              Cảm xúc
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                Đang đăng...
              </>
            ) : (
              'Đăng bài'
            )}
          </button>
        </form>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Modal>
  );
};

export default CreateGroupPostModal;