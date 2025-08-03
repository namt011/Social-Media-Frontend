import React, { useState, useEffect, useRef } from 'react';
import CreatePostModal from '../CreateNewPost';
import SharePostModal from '../SharePostModal';
import SharedPostComponent from '../post/SharedPostComponent';
import ListLike from '../popup/ListLike';
import Comment from '../popup/Comment';
import MediaSection from '../post/MediaSection';
import Cookies from 'js-cookie';
import { CreateReaction, DeleteReaction, DeletePost } from '../../service/PostService';
import EditPostModal from '../EditPostModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import ReportPostModal from '../post/ReportPostModal';


const RenderGroupPosts = ({ 
  posts, 
  setPosts, 
  showCreatePost = false, 
  user,
  isLoading,
  hasMore,
  loadMoreRef 
}) => {
  const [showModal, setShowModal] = useState(false);
  const videoRefs = useRef([]);
  const observerRef = useRef(null);
  const [processingLikes, setProcessingLikes] = useState(new Set());
  const [currentPostForComment, setCurrentPostForComment] = useState(null);
  const [isModalOpenLike, setIsModalOpenLike] = useState(false);
  const [isModalOpenComment, setIsModalOpenComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [postToShare, setPostToShare] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  // Thêm state cho modal báo cáo
  const [showReportModal, setShowReportModal] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const openModalLike = () => setIsModalOpenLike(true);
  const closeModalLike = () => setIsModalOpenLike(false);

  const openModalComment = (post) => {
    setCurrentPostForComment(post);
    setIsModalOpenComment(true);
  };
  const closeModalComment = () => setIsModalOpenComment(false);

  const handleShareClick = (post) => {
    setPostToShare(post);
    setShowShareModal(true);
  };

  const handleLikeClick = async (postId) => {
    const userId = Cookies.get('c_user');
    if (!userId || processingLikes.has(postId)) return;

    const originalPosts = [...posts];

    try {
      setProcessingLikes(prev => new Set(prev).add(postId));
      
      const currentPost = posts.find(p => p.postID === postId);
      if (!currentPost) return;
      
      const isCurrentlyLiked = currentPost.liked;
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.postID === postId) {
          const newLikeStatus = !post.liked;
          return {
            ...post,
            liked: newLikeStatus,
            likesCount: newLikeStatus ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      }));

      if (isCurrentlyLiked) {
        await DeleteReaction({ postId: postId });
      } else {
        await CreateReaction({ postID: postId });
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      setPosts(originalPosts);
      alert('Thao tác thất bại. Vui lòng thử lại!');
    } finally {
      setProcessingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  const handleEditPost = (postId) => {
    const post = posts.find(p => p.postID === postId);
    setPostToEdit(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (editedPost) => {
    try {
      // Xóa tất cả toast hiện tại
      toast.dismiss();
      
      // Cập nhật posts
      await updatePost(editedPost); // Giả sử bạn có hàm updatePost để gọi API
      
      setPosts(posts.map(post => 
        post.postID === editedPost.postID 
          ? {
              ...post,
              subjectOfThePost: editedPost.subjectOfThePost,
              postContent: editedPost.postContent,
              privacy: editedPost.privacy,
              media: editedPost.media
            }
          : post
      ));
      
      // Hiển thị thông báo thành công
      toast.success('Cập nhật bài viết thành công!', {
        position: "top-right",
        autoClose: 3000,
        toastId: `edit-success-${Date.now()}`, // Thêm timestamp để đảm bảo ID unique
        containerId: "default"
      });
      
      setShowEditModal(false);
      setPostToEdit(null);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Không thể cập nhật bài viết. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        toastId: `edit-error-${Date.now()}`,
        containerId: "default"
      });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa bài viết?',
        text: "Bạn không thể hoàn tác sau khi xóa!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        background: '#f8f9fa',
        borderRadius: '15px'
      });

      if (result.isConfirmed) {
        await DeletePost(postId);
        setPosts(prevPosts => prevPosts.filter(post => post.postID !== postId));
        
        toast.success('Đã xóa bài viết thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error('Không thể thực hiện thao tác. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  // Cập nhật hàm handleReportPost
  const handleReportPost = (post) => {
    setPostToReport(post);
    setShowReportModal(true);
  };

  return (
    <div className="d-flex flex-column align-items-center w-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      {showCreatePost && (
        <div className="card w-50" style={{ minWidth: '360px', backgroundColor: '#C0FFD1' }}>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <img
                src={user?.userImageAvatar || 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1742827779/default-avatar-icon-of-social-media-user-vector_boxybc.jpg'}
                alt="Avatar"
                className="rounded-circle"
                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
              />
              <span
                style={{ fontSize: '18px', fontWeight: '500', cursor: 'pointer' }}
                onClick={handleShow}
              >
                Bạn, có gì mới?
              </span>
              <button className="btn btn-outline-success ml-auto" onClick={handleShow}>
                Đăng
              </button>
            </div>
          </div>
        </div>
      )}

      {posts.map((post) => (
        <div
          key={post.postID}
          className="card mt-3 w-100"
          style={{ minWidth: '360px', backgroundColor: '#C0FFD1', overflow: 'hidden' }}
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={post.user?.userImageAvatar || 'default-avatar-url.jpg'}
                  alt="Avatar"
                  className="rounded-circle me-3"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <div>
                  <div>
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: '18px', fontWeight: '500', cursor: 'pointer' }}>
                        <a
                          className="link-offset-2 link-underline link-underline-opacity-0 text-reset"
                          href={`/profile/${post.user.userID}`}
                        >
                          {`${post.user.userLastName} ${post.user.userFirstName}`}
                        </a>
                      </span>
                      <span className="ms-2 text-muted" style={{ fontSize: '14px' }}>
                        {post.privacy === 'public' && <i className="bi bi-globe2"></i>}
                        {post.privacy === 'friends' && <i className="bi bi-people-fill"></i>}
                        {post.privacy === 'private' && <i className="bi bi-lock-fill"></i>}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: '14px', color: '#888' }}>
                        {getRelativeTime(post.postCreateAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dropdown">
                <button 
                  className="btn btn-link text-dark p-0" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-three-dots"></i>
                </button>
                <ul className="dropdown-menu">
                  {post.owner && (
                    <>
                      <li>
                        <button className="dropdown-item" onClick={() => handleEditPost(post.postID)}>
                          <i className="bi bi-pencil me-2"></i>Chỉnh sửa
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => handleDeletePost(post.postID)}>
                          <i className="bi bi-trash me-2"></i>Xóa
                        </button>
                      </li>
                    </>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={() => handleReportPost(post)}>
                      <i className="bi bi-flag me-2"></i>Báo cáo
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <p style={{ fontSize: '16px', marginTop: '10px' }}>{post.postContent}</p>

            {/* Media Section */}
            <MediaSection 
              media={post.media} 
              videoRefs={videoRefs}
            />

            {/* Shared Post */}
            {post.sharedPost && <SharedPostComponent sharedPost={post.sharedPost} />}

            {/* Phần interaction */}
            <div className="d-flex mt-3 ms-3">
              <div className='d-flex'>
                <div className='me-3 text-success' style={{ cursor: 'pointer' }}>
                  <i 
                    className={`bi ${post.liked ? 'bi-heart-fill' : 'bi-heart'}`}
                    style={{ 
                      fontSize: '22px', 
                      color: post.liked ? '#ff0000' : 'inherit',
                      transition: 'color 0.3s ease, transform 0.2s ease',
                      transform: post.liked ? 'scale(1.1)' : 'scale(1)',
                      opacity: processingLikes.has(post.postID) ? 0.5 : 1,
                      cursor: processingLikes.has(post.postID) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => handleLikeClick(post.postID)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {processingLikes.has(post.postID) && (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    )}
                  </i>
                  <span
                    className="ms-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openModalLike(post)}
                  >
                    {post.likesCount}
                  </span>
                </div>
                <div className='me-3 text-success' onClick={() => openModalComment(post)} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-chat-right-text" style={{ fontSize: '22px' }}></i> 
                  <a href="#" className='text-reset'> {post.commentCount}</a>
                </div>
                <div className='me-3 text-success' onClick={() => handleShareClick(post)} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-share" style={{ fontSize: '22px' }}></i>
                </div>
              </div>
              <div className='ms-auto me-3'>
                <input
                  type="text"
                  placeholder="bình luận..."
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #A4D2B9',
                    outline: 'none',
                    padding: '5px 0',
                    width: '40vh'
                  }}
                />
                <i className="bi bi-arrow-return-right" style={{ fontSize: '22px', color: 'rgb(2, 117, 54)', cursor: 'pointer' }}></i>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div ref={loadMoreRef} className="text-center my-3">
        {isLoading && (
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        {!hasMore && <p>No more posts to load</p>}
      </div>

      <CreatePostModal
        showModal={showModal}
        handleClose={handleClose}
        handleBackdropClick={handleBackdropClick}
      />

      <ListLike isModalOpenLike={isModalOpenLike} closeModalLike={closeModalLike} />
      <Comment 
        isModalOpenComment={isModalOpenComment} 
        closeModalComment={closeModalComment} 
        post={currentPostForComment} 
      />
      <SharePostModal 
        showModal={showShareModal}
        handleClose={() => setShowShareModal(false)}
        postToShare={postToShare}
      />
      <EditPostModal
        showModal={showEditModal}
        handleClose={() => setShowEditModal(false)}
        post={postToEdit}
        onSave={handleSaveEdit}
      />
      {/* Thêm ReportPostModal */}
      <ReportPostModal
        showModal={showReportModal}
        handleClose={() => setShowReportModal(false)}
        post={postToReport}
      />
    </div>
  );
};

export default RenderGroupPosts;