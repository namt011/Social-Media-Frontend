import React, { useState, useEffect, useRef } from 'react';
import Modal from './popup/Modal';
import { updatePost } from '../service/PostService';
import EditPostMediaUpload from './EditPostMediaUpload';
import { toast } from 'react-toastify';

const EditPostModal = ({ showModal, handleClose, post, onSave }) => {
  const [formData, setFormData] = useState({
    postContent: '',
    privacy: 'public',
    mediaRequests: []
  });

  const mediaUploadRef = useRef(null);

  useEffect(() => {
    if (post) {
      const mediaRequests = [];
      if (post.media) {
        if (post.media.images && post.media.images.length > 0) {
          mediaRequests.push(...post.media.images.map(url => ({
            url,
            type: 'image'
          })));
        }
        if (post.media.videos && post.media.videos.length > 0) {
          mediaRequests.push(...post.media.videos.map(url => ({
            url,
            type: 'video'
          })));
        }
      }

      setFormData({
        subjectOfThePost: post.subjectOfThePost || '',
        postContent: post.postContent || '',
        privacy: post.privacy?.toLowerCase() || 'public',
        mediaRequests
      });
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedMedia = await mediaUploadRef.current.handleUpload();
      const updatedFormData = {
        ...formData,
        postContent: formData.postContent,
        privacy: formData.privacy,
        mediaRequests: uploadedMedia.length > 0 ? uploadedMedia.map(media => ({
          url: media.url,
          type: media.type
        })) : null
      };
      
      const updatedPost = await updatePost(post.postID, updatedFormData);
      onSave(updatedPost);
      toast.success('Cập nhật bài viết thành công!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      handleClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Không thể cập nhật bài viết. Vui lòng thử lại!');
    }
  };

  return (
    <Modal isOpen={showModal} onClose={handleClose}>
      <div className="edit-post-container">
        <div className="d-flex align-items-center mb-4">
          <img
            src={post?.user?.userImageAvatar || 'default-avatar-url.jpg'}
            alt="Avatar"
            className="rounded-circle me-3"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <h5 className="mb-0">Chỉnh sửa bài viết</h5>
            <small className="text-muted">
              {post?.user?.userLastName} {post?.user?.userFirstName}
            </small>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Nội dung</label>
            <textarea
              className="form-control"
              value={formData.postContent}
              onChange={(e) => setFormData({
                ...formData,
                postContent: e.target.value
              })}
              rows="4"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #A4D2B9'
              }}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Quyền riêng tư</label>
            <select
              className="form-select"
              value={formData.privacy}
              onChange={(e) => setFormData({
                ...formData,
                privacy: e.target.value
              })}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #A4D2B9'
              }}
            >
              <option value="public">
                <i className="fas fa-globe"></i> Công khai
              </option>
              <option value="friends">
                <i className="fas fa-user-friends"></i> Bạn bè
              </option>
              <option value="private">
                <i className="fas fa-lock"></i> Riêng tư
              </option>
            </select>
          </div>

          <EditPostMediaUpload
            ref={mediaUploadRef}
            existingMedia={formData.mediaRequests}
            onMediaChange={(media) => {
              setFormData(prev => ({
                ...prev,
                mediaRequests: media
              }));
            }}
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditPostModal;