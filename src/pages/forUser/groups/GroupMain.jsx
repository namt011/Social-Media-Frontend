import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaSection from '../../../components/post/MediaSection';
import SharedPostComponent from '../../../components/post/SharedPostComponent';
import CustomScrollbar from '../../../components/CustomScrollbar';
import groupService from '../../../service/GroupService';
import groupPostService from '../../../service/GroupPostService';

import CreateGroupModal from '../../../components/popup/CreateGroupModal';
import Modal from '../../../components/popup/Modal';

// Component cho nhóm đã tham gia
const JoinedGroup = ({ group }) => {  
  const navigate = useNavigate();  

  if (!group) {
    return (
      <div className="text-center p-3 text-muted">
        <i className="bi bi-people mb-2" style={{ fontSize: '2rem' }}></i>
        <p className="mb-0">Bạn chưa tham gia nhóm nào</p>
        <small>Hãy tham gia các nhóm để kết nối với mọi người</small>
      </div>
    );
  }

  const handleClick = () => {  
    navigate(`${group.groupID}`); // Chuyển đến trang nhóm với ID  
  };  

  return (  
    <div  
      className="joined-group mb-2 p-2 d-flex align-items-center"  
      style={{  
        cursor: 'pointer',  
        borderRadius: '8px',  
        transition: 'background-color 0.2s',  
      }}  
      onClick={handleClick}  
    >  
      <img  
        src={group.coverImg || "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1746946923/social_uploads/jno7dmo6auuc3ckmpao8.png"}  
        alt={group.name}  
        className="rounded-circle me-2"  
        width="50"  
        height="50"  
      />  
      <div className="group-info" style={{ overflow: 'hidden' }}>  
        <h6  
          className="mb-0"  
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}  
        >  
          {group.name}  
        </h6>  
        <small className="text-muted">{group.memberCount} thành viên</small>  
      </div>  
    </div>  
  );  
};  

// Component cho nhóm gợi ý
const SuggestedGroup = ({ group, onJoin }) => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      await groupService.joinGroup(group.groupID);
      setJoined(true);
      if (onJoin) onJoin(group.groupID);
    } catch (err) {
      console.error('Failed to join group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggested-group mb-2 p-2 d-flex align-items-center justify-content-between" style={{ 
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'background-color 0.2s',
      ':hover': { backgroundColor: '#e8fff0' }
    }}>
      <div className="d-flex align-items-center">
        <img src={group.coverImg || "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1746946923/social_uploads/jno7dmo6auuc3ckmpao8.png"} alt={group.name} className="rounded-circle me-2" width="50" height="50" />
        <div className="group-info" style={{ overflow: 'hidden' }}>
          <h6 className="mb-0" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</h6>
          <small className="text-muted">{group.memberCount || 0} thành viên</small>
        </div>
      </div>
      <button 
        className="btn btn-sm"
        style={{ backgroundColor: joined ? '#a8e6ba' : '#C0FFD1', color: '#2c5e39' }}
        onClick={handleJoin}
        disabled={loading || joined}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : joined ? 'Đã tham gia' : 'Tham gia'}
      </button>
    </div>
  );
};

// Component cho bài đăng trong nhóm (kiểu newsfeed)
const GroupPost = ({ post, postIndex, videoRefs }) => {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [commented, setCommented] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // State cho dropdown menu

  // Format thời gian
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Xử lý xóa bài viết
  const handleDeletePost = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        // Gọi API xóa bài viết
        // await deletePost(post.id);
        // Cập nhật UI
      } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
      }
    }
    setShowOptions(false);
  };

  // Xử lý chỉnh sửa bài viết
  const handleEditPost = () => {
    // Mở modal chỉnh sửa hoặc chuyển hướng đến trang chỉnh sửa
    setShowOptions(false);
  };

  return (
    <div className="card mt-3 w-100" style={{ backgroundColor: '#C0FFD1', overflow: 'hidden' }}>
      <div className="card-body">
        <div className="d-flex align-items-start">
          <img 
            src={post.authorAvatar || "/api/placeholder/50/50"} 
            alt={post.authorName} 
            className="rounded-circle me-2" 
            width="50" 
            height="50" 
          />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '18px', fontWeight: '500' }}>
                    <a className="link-offset-2 link-underline link-underline-opacity-0 text-reset" href="#">
                      {post.authorName || 'Người dùng'}
                    </a>
                  </span>
                  <small className="text-muted">
                    • {formatDateTime(post.createdAt)}
                  </small>
                </div>
                <small className="text-muted d-block">
                  Đăng trong <span className="fw-bold">{post.groupName}</span>
                </small>
              </div>
              
              {/* Dropdown menu cho các chức năng */}
              <div className="dropdown">
                <button 
                  className="btn btn-link text-dark" 
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ padding: '0 8px' }}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
                {showOptions && (
                  <div className="dropdown-menu show position-absolute" style={{ right: 0 }}>
                    <button className="dropdown-item" onClick={handleEditPost}>
                      <i className="bi bi-pencil-square me-2"></i>Chỉnh sửa
                    </button>
                    <button className="dropdown-item text-danger" onClick={handleDeletePost}>
                      <i className="bi bi-trash me-2"></i>Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p style={{ fontSize: '16px', marginTop: '8px' }}>{post.content}</p>
          </div>
        </div>

        {/* Sử dụng MediaSection nếu có media */}
        {post.media && (
          <MediaSection 
            media={post.media} 
            postIndex={postIndex}
            videoRefs={videoRefs}
          />
        )}

        {/* Sử dụng SharedPostComponent nếu là bài viết chia sẻ */}
        {post.shared_post && <SharedPostComponent sharedPost={post.shared_post} />}

        <div className="d-flex mt-3 ms-3 flex-wrap">
          <div className='d-flex mb-2 me-auto'>
            <div className='me-3 text-success' style={{ cursor: 'pointer' }}>
              <i className={`bi ${post.likedByCurrentUser ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '22px' }}></i> {likes}
            </div>
            <div className='me-3 text-success' style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
              <i className="bi bi-chat-right-text" style={{ fontSize: '22px' }}></i> {post.commentCount || 0}
            </div>
            <div className='me-3 text-success' style={{ cursor: 'pointer' }}>
              <i className="bi bi-send" style={{ fontSize: '22px' }}></i> 
            </div>
          </div>

          <div className='w-100 d-md-none d-block'></div>

          <div className='me-3 d-flex'>
            <input
              type="text"
              placeholder="bình luận..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #A4D2B9',
                outline: 'none',
                padding: '5px 0',
                width: '100%',
                maxWidth: '40vh'
              }}
              onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
            />
            <i 
              className="bi bi-arrow-return-right" 
              style={{ fontSize: '22px', color: 'rgb(2, 117, 54)', cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                if (commentText.trim()) {
                  setCommented(true);
                  setCommentText('');
                }
              }}
            ></i>
          </div>
        </div>
        
        {showComments && (
          <div className="comments-section mt-3">
            {post.comments && post.comments.map((comment, index) => (
              <div key={index} className="comment d-flex mb-2">
                <img src={comment.userAvatar || "/api/placeholder/30/30"} alt={comment.userName} className="rounded-circle me-2" width="30" height="30" />
                <div className="comment-content p-2 rounded" style={{ backgroundColor: '#e8fff0', borderRadius: '18px' }}>
                  <h6 className="mb-0 fs-6">{comment.userName}</h6>
                  <p className="mb-0 small">{comment.text}</p>
                </div>
              </div>
            ))}
            
            {commented && (
              <div className="comment d-flex mb-2">
                <img src="/api/placeholder/30/30" alt="Your Avatar" className="rounded-circle me-2" width="30" height="30" />
                <div className="comment-content p-2 rounded" style={{ backgroundColor: '#e8fff0', borderRadius: '18px' }}>
                  <h6 className="mb-0 fs-6">Bạn</h6>
                  <p className="mb-0 small">Đã thêm bình luận</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component chính
const GroupMain = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const videoRefs = useRef([]);
  const observerRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false); // State cho mobile sidebar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State để lưu loại bài viết đang hiển thị
  const [postFilter, setPostFilter] = useState('all'); // 'all', 'joined', 'public'
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Add these state variables at the beginning of GroupMain component
  const [allPosts, setAllPosts] = useState({
    content: [],
    last: false,
    pageNumber: 0
  });
  const [joinedPosts, setJoinedPosts] = useState({
    content: [],
    last: false,
    pageNumber: 0
  });
  const [publicPosts, setPublicPosts] = useState({
    content: [],
    last: false,
    pageNumber: 0
  });

  // State cho nhóm gợi ý
  const [suggestedGroups, setSuggestedGroups] = useState([]);

  // Fetch posts based on filter
  const fetchPosts = async (resetPage = false) => {
    try {
      setLoadingPosts(true);
      
      switch (postFilter) {
        case 'joined':
          const joinedResponse = await groupPostService.getJoinedGroupsPosts(resetPage ? 0 : joinedPosts.pageNumber);
          setJoinedPosts(prev => ({
            content: resetPage ? joinedResponse.content : [...prev.content, ...joinedResponse.content],
            last: joinedResponse.last,
            pageNumber: joinedResponse.pageable.pageNumber + 1
          }));
          setPosts(resetPage ? joinedResponse.content : [...posts, ...joinedResponse.content]);
          setHasMore(!joinedResponse.last);
          break;

        case 'public':
          const publicResponse = await groupPostService.getPublicGroupsPosts(resetPage ? 0 : publicPosts.pageNumber);
          setPublicPosts(prev => ({
            content: resetPage ? publicResponse.content : [...prev.content, ...publicResponse.content],
            last: publicResponse.last,
            pageNumber: publicResponse.pageable.pageNumber + 1
          }));
          setPosts(resetPage ? publicResponse.content : [...posts, ...publicResponse.content]);
          setHasMore(!publicResponse.last);
          break;

        default:
          // For 'all', fetch both joined and public posts
          const [allJoinedResponse, allPublicResponse] = await Promise.all([
            groupPostService.getJoinedGroupsPosts(resetPage ? 0 : joinedPosts.pageNumber),
            groupPostService.getPublicGroupsPosts(resetPage ? 0 : publicPosts.pageNumber)
          ]);

          // Update individual post states
          setJoinedPosts(prev => ({
            content: resetPage ? allJoinedResponse.content : [...prev.content, ...allJoinedResponse.content],
            last: allJoinedResponse.last,
            pageNumber: allJoinedResponse.pageable.pageNumber + 1
          }));

          setPublicPosts(prev => ({
            content: resetPage ? allPublicResponse.content : [...prev.content, ...allPublicResponse.content],
            last: allPublicResponse.last,
            pageNumber: allPublicResponse.pageable.pageNumber + 1
          }));

          // Merge and sort all posts
          const allPosts = [...(resetPage ? [] : posts), ...allJoinedResponse.content, ...allPublicResponse.content];
          const uniquePosts = allPosts.reduce((acc, current) => {
            const x = acc.find(item => item.postID === current.postID);
            if (!x) {
              return acc.concat([current]);
            }
            return acc;
          }, []);

          // Sort by date
          const sortedPosts = uniquePosts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );

          setPosts(sortedPosts);
          setHasMore(!allJoinedResponse.last || !allPublicResponse.last);
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch posts when filter changes
  useEffect(() => {
    fetchPosts(true);
  }, [postFilter]);

  // Load more posts
  const handleLoadMore = () => {
    if (!loadingPosts && hasMore) {
      fetchPosts();
    }
  };

  // Fetch joined groups and suggested groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch joined groups
        const joinedResponse = await groupService.getUserGroups();
        setJoinedGroups(joinedResponse.content); // Assuming pagination response
        
        // Fetch suggested groups
        const suggestedResponse = await groupService.getSuggestedGroups();
        setSuggestedGroups(suggestedResponse.content);
      } catch (err) {
        setError('Failed to load groups');
        console.error(err);
      }
    };
    
    fetchGroups();
  }, []);

  // Handler for joining group
  const handleJoinGroup = async (groupId) => {
    try {
      await groupService.joinGroup(groupId);
      // Refresh groups list
      const [joinedResponse, suggestedResponse] = await Promise.all([
        groupService.getUserGroups(),
        groupService.getSuggestedGroups()
      ]);
      setJoinedGroups(joinedResponse.content);
      setSuggestedGroups(suggestedResponse.content);
    } catch (err) {
      setError('Failed to join group');
      console.error(err);
    }
  };

  // Handler for creating post
  const handleCreatePost = async (groupId, postData) => {
    try {
      await groupPostService.createPost(groupId, postData);
      // Refresh posts
      const response = await groupPostService.getGroupPosts(groupId);
      // Update posts state
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
    }
  };

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Function to open the modal
  const handleShow = () => setShowModal(true);

  // Function to close the modal
  const handleClose = () => setShowModal(false);

  // Close the modal when clicking outside the modal content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Initialize IntersectionObserver to observe videos and handle autoplay
  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.5 // Video should be 50% in view to trigger play
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
          // Pause all other videos and play only the one in view
          videoRefs.current.forEach((vid) => {
            if (vid !== video) {
              vid.pause();
            }
          });
          video.play();
        } else {
          video.pause();
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, options);

    // Observe each video
    videoRefs.current.forEach(video => {
      if (video) observerRef.current.observe(video);
    });

    return () => {
      // Cleanup observer on component unmount
      if (observerRef.current) {
        videoRefs.current.forEach(video => {
          if (video) observerRef.current.unobserve(video);
        });
        observerRef.current.disconnect();
      }
    };
  }, [posts]);

  return (
    <div className="container-fluid">
      <CustomScrollbar />
      {/* Mobile Header với nút toggle sidebar */}
      <div className="d-md-none d-block sticky-top bg-white py-2 shadow-sm mb-3">
        <div className="d-flex justify-content-between align-items-center px-3">
          <button 
            className="btn" 
            style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i> Nhóm
          </button>
          <h5 className="mb-0">Cộng đồng</h5>
          <div className="d-flex gap-2">
            <button 
              className="btn" 
              style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}
              onClick={() => setShowCreateGroupModal(true)}
            >
              <i className="bi bi-plus-circle"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="position-fixed d-md-none top-0 start-0 w-100 h-100" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1050,
          }}
          onClick={toggleSidebar}
        >
          <div 
            className="bg-white h-100 p-3" 
            style={{ 
              width: '80%', 
              maxWidth: '300px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Nhóm</h5>
              <button className="btn-close" onClick={toggleSidebar}></button>
            </div>
            
            <h6 className="mb-2" style={{ color: '#2c5e39' }}>Nhóm của bạn</h6>
            {joinedGroups.length > 0 ? (
              joinedGroups.map(group => (
                <JoinedGroup key={group.groupID} group={group} />
              ))
            ) : (
              <JoinedGroup />
            )}
            <button className="btn btn-link text-decoration-none d-block mt-2 mb-3" style={{ color: '#2c5e39' }}>
              Xem tất cả nhóm
            </button>
            
            <h6 className="mb-2" style={{ color: '#2c5e39' }}>Gợi ý cho bạn</h6>
            {suggestedGroups.length > 0 ? (
              suggestedGroups.map(group => (
                <SuggestedGroup key={group.groupID} group={group} onJoin={handleJoinGroup} />
              ))
            ) : (
              <div className="text-center p-3 text-muted">
                <small>Không có nhóm gợi ý nào</small>
              </div>
            )}
            <button className="btn d-block w-100 mt-2" style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}>
              Khám phá thêm nhóm
            </button>
          </div>
        </div>
      )}

      <div className="row mt-3">
        {/* Sidebar - Danh sách nhóm (ẩn trên mobile) */}
        <div className="col-md-3 d-none d-md-block">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}>
              <h5 className="mb-0">Nhóm của bạn</h5>
              <button
                className="btn btn-sm"
                onClick={() => setShowCreateGroupModal(true)}
                style={{ backgroundColor: '#e8fff0', color: '#2c5e39' }}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Tạo nhóm
              </button>
            </div>
            <div className="card-body p-2">
              {joinedGroups.length > 0 ? (
                joinedGroups.map(group => (
                  <JoinedGroup key={group.id} group={group} />
                ))
              ) : (
                <JoinedGroup />
              )}
              <button className="btn btn-link text-decoration-none d-block mt-2" style={{ color: '#2c5e39' }}>
                Xem tất cả nhóm
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}>
              <h5 className="mb-0">Gợi ý cho bạn</h5>
            </div>
            <div className="card-body p-2">
              {suggestedGroups.length > 0 ? (
                suggestedGroups.map(group => (
                  <SuggestedGroup key={group.groupID} group={group} onJoin={handleJoinGroup} />
                ))
              ) : (
                <div className="text-center p-3 text-muted">
                  <small>Không có nhóm gợi ý nào</small>
                </div>
              )}
              <button className="btn d-block w-100 mt-2" style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}>
                Khám phá thêm nhóm
              </button>
            </div>
          </div>
        </div>

        {/* Main content - Newsfeed style */}
        <div className="col-md-6 col-12">
          <div className="card mb-3">
            <div className="card-header" style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}>
              {/* Tabs cho Desktop */}
              <ul className="nav nav-tabs card-header-tabs d-none d-md-flex">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${postFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPostFilter('all')}
                    style={postFilter === 'all' ? { borderColor: '#C0FFD1', borderBottomColor: '#fff', color: '#2c5e39' } : {}}
                  >
                    Tất cả bài viết
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${postFilter === 'joined' ? 'active' : ''}`}
                    onClick={() => setPostFilter('joined')}
                    style={postFilter === 'joined' ? { borderColor: '#C0FFD1', borderBottomColor: '#fff', color: '#2c5e39' } : {}}
                  >
                    Nhóm đã tham gia
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${postFilter === 'public' ? 'active' : ''}`}
                    onClick={() => setPostFilter('public')}
                    style={postFilter === 'public' ? { borderColor: '#C0FFD1', borderBottomColor: '#fff', color: '#2c5e39' } : {}}
                  >
                    Nhóm công khai
                  </button>
                </li>
              </ul>
              
              {/* Dropdown cho Mobile */}
              <div className="d-md-none d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Bài viết</h5>
                <select 
                  className="form-select" 
                  style={{ width: 'auto', backgroundColor: '#e8fff0', color: '#2c5e39', border: '1px solid #C0FFD1' }}
                  value={postFilter}
                  onChange={(e) => setPostFilter(e.target.value)}
                >
                  <option value="all">Tất cả bài viết</option>
                  <option value="joined">Nhóm đã tham gia</option>
                  <option value="public">Nhóm công khai</option>
                </select>
              </div>
            </div>
            
            <div className="card-body">
              {/* Show loading state */}
              {loadingPosts && posts.length === 0 && (
                <div className="text-center p-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Show error state */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Render posts */}
              {posts.map((post, postIndex) => (
                <GroupPost 
                  key={post.postID} 
                  post={post} 
                  postIndex={postIndex} 
                  videoRefs={videoRefs} 
                />
              ))}

              {/* Load more button */}
              {hasMore && (
                <div className="text-center mt-3">
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}
                    onClick={handleLoadMore}
                    disabled={loadingPosts}
                  >
                    {loadingPosts ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang tải...
                      </>
                    ) : (
                      'Xem thêm bài viết'
                    )}
                  </button>
                </div>
              )}

              {/* Show when no more posts */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center mt-3 text-muted">
                  Không còn bài viết nào khác
                </div>
              )}

              {/* Show when no posts found */}
              {!loadingPosts && posts.length === 0 && !error && (
                <div className="text-center p-4 text-muted">
                  Chưa có bài viết nào
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile bottom navbar */}

      </div>

      {/* Modal for creating group */}
      <Modal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      >
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
        />
      </Modal>
    </div>
  );
};

export default GroupMain;