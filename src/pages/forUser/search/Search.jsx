import React, { useState, useRef, useEffect } from 'react';
import MediaSection from '../../../components/post/MediaSection';
import SharedPostComponent from '../../../components/post/SharedPostComponent';
import CustomScrollbar from '../../../components/CustomScrollbar';
import ListLike from '../../../components/popup/ListLike';  
import Comment from '../../../components/popup/Comment';

import { searchUsers, searchPosts, searchGroups } from '../../../services/searchService';
import { CreateReaction, DeleteReaction, CheckReaction } from '../../../service/PostService';
import { sendFriendRequest, checkFriendshipStatus, deleteFriendRequest, respondToFriendRequest } from '../../../service/FriendService';
import Cookies from 'js-cookie';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const videoRefs = useRef([]); // Ref array to hold video references
  const observerRef = useRef(null); // Reference for IntersectionObserver

  const [processingLikes, setProcessingLikes] = useState(new Set());
  const [processingFriendRequests, setProcessingFriendRequests] = useState(new Set());
  const [posts, setPosts] = useState([]);

  // Define defaultAvatar for use in renderUser and renderPost
  const defaultAvatar = 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1742827779/default-avatar-icon-of-social-media-user-vector_boxybc.jpg';

  // States for modal handling
  const [currentPostForComment, setCurrentPostForComment] = useState(null);
  const [currentPostForLike, setCurrentPostForLike] = useState(null);
  const [isModalOpenLike, setIsModalOpenLike] = useState(false);
  const [isModalOpenComment, setIsModalOpenComment] = useState(false);

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

  // Initialize Bootstrap components if needed
  useEffect(() => {
    // Initialize all Bootstrap tooltips, popovers, and collapses
    if (typeof document !== 'undefined') {
      // Check if Bootstrap is available
      if (typeof window.bootstrap !== 'undefined') {
        const collapseElementList = document.querySelectorAll('.collapse');
        [...collapseElementList].map(collapseEl => new window.bootstrap.Collapse(collapseEl, {
          toggle: false
        }));
      }
    }
  }, []);

  // Modal functions
  const openModalLike = (post) => {
    setCurrentPostForLike(post);
    setIsModalOpenLike(true);
  };
  
  const closeModalLike = () => {
    setIsModalOpenLike(false);
    setCurrentPostForLike(null);
  };

  const openModalComment = (post) => {
    setCurrentPostForComment(post);
    setIsModalOpenComment(true);
  };
  
  const closeModalComment = () => {
    setIsModalOpenComment(false);
    setCurrentPostForComment(null);
  };

  // Handle like functionality
  const handleLikeClick = async (postId) => {
    const userId = Cookies.get('c_user');
    if (!userId || processingLikes.has(postId)) return;
  
    try {
      setProcessingLikes(prev => new Set(prev).add(postId));
    
      // Create a copy of posts to rollback if needed
      const originalPosts = [...posts];
      const originalResults = [...searchResults];
      
      // Optimistic update for posts state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.postID === postId) {
          const newLikeStatus = !post.isLiked;
          return {
            ...post,
            isLiked: newLikeStatus,
            likesCount: newLikeStatus ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      }));
      
      // Also update searchResults since they may contain the same posts
      setSearchResults(prevResults => prevResults.map(item => {
        if (item.type === 'post' && item.postID === postId) {
          const newLikeStatus = !item.isLiked;
          return {
            ...item,
            isLiked: newLikeStatus,
            likesCount: newLikeStatus ? item.likesCount + 1 : item.likesCount - 1
          };
        }
        return item;
      }));
  
      // Call API
      const postToUpdate = originalPosts.find(p => p.postID === postId) || 
                           originalResults.find(p => p.type === 'post' && p.postID === postId);
                           
      if (postToUpdate && postToUpdate.isLiked) {
        await DeleteReaction({ userId: userId, postId: postId });
      } else {
        await CreateReaction({ userID: userId, postID: postId });
      }
  
    } catch (error) {
      console.error('Error toggling like:', error);
      // Rollback if there's an error
      setPosts(posts);
      setSearchResults(searchResults);
      
      // Show error message (optional)
      alert('Thao tác thất bại. Vui lòng thử lại!');
    } finally {
      setProcessingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const params = {
        query: searchQuery,
        page: 0,
        size: 10
      };

      let results = [];
      let postsResults = [];
      
      if (activeFilter === 'all') {
        const [usersRes, postsRes, groupsRes] = await Promise.all([
          searchUsers(searchQuery),
          searchPosts(searchQuery),
          searchGroups(searchQuery)
        ]);
        
        // Process each post to check if it's liked by the current user
        const postsWithLikeStatus = await Promise.all(
          postsRes.content.map(async (post) => {
            try {
              const checkResponse = await CheckReaction({
                postId: post.postID
              });
              return {
                ...post,
                isLiked: checkResponse.data.isLiked,
                type: 'post'
              };
            } catch (error) {
              console.error('Error checking reaction:', error);
              return {
                ...post,
                isLiked: false,
                type: 'post'
              };
            }
          })
        );
        
        // Process each user to check friendship status
        const usersWithFriendshipStatus = await Promise.all(
          usersRes.content.map(async (user) => {
            try {
              const response = await checkFriendshipStatus(user.userID);
              let status = 'NOT_FRIENDS';
              
              if (response.data.success) {
                status = response.data.data.status;
              }
              
              return {
                ...user,
                friendshipStatus: status,
                requestId: response.data.data?.requestId || null,
                type: 'user'
              };
            } catch (error) {
              console.error('Error checking friendship status:', error);
              return {
                ...user,
                friendshipStatus: 'NOT_FRIENDS',
                requestId: null,
                type: 'user'
              };
            }
          })
        );
        
        results = [
          ...usersWithFriendshipStatus,
          ...postsWithLikeStatus,
          ...groupsRes.content.map(item => ({ type: 'group', ...item }))
        ];
        
        // Update the posts state with only the post results
        postsResults = postsWithLikeStatus;
      } else if (activeFilter === 'posts') {
        const postsRes = await searchPosts(searchQuery);
        
        // Process posts to check if they're liked
        const postsWithLikeStatus = await Promise.all(
          postsRes.content.map(async (post) => {
            try {
              const checkResponse = await CheckReaction({
                postId: post.postID
              });
              return {
                ...post,
                isLiked: checkResponse.data.isLiked,
                type: 'post'
              };
            } catch (error) {
              console.error('Error checking reaction:', error);
              return {
                ...post,
                isLiked: false,
                type: 'post'
              };
            }
          })
        );
        
        results = postsWithLikeStatus;
        postsResults = postsWithLikeStatus;
      } else {
        // Handle other filter types
        let apiCall;
        switch(activeFilter) {
          case 'users':
            apiCall = searchUsers(searchQuery);
            break;
          case 'groups':
            apiCall = searchGroups(searchQuery);
            break;
          default:
            apiCall = Promise.resolve({ content: [] });
        }
        
        const response = await apiCall;
        console.log(`${activeFilter} response:`, response);
        
        if (response && response.content) {
          if (activeFilter === 'users') {
            // Process users to check friendship status
            const usersWithFriendshipStatus = await Promise.all(
              response.content.map(async (user) => {
                try {
                  const statusResponse = await checkFriendshipStatus(user.userID);
                  let status = 'NOT_FRIENDS';
                  
                  if (statusResponse.data.success) {
                    status = statusResponse.data.data.status;
                  }
                  
                  return {
                    ...user,
                    friendshipStatus: status,
                    requestId: statusResponse.data.data?.requestId || null,
                    type: activeFilter
                  };
                } catch (error) {
                  console.error('Error checking friendship status:', error);
                  return {
                    ...user,
                    friendshipStatus: 'NOT_FRIENDS',
                    requestId: null,
                    type: activeFilter
                  };
                }
              })
            );
            results = usersWithFriendshipStatus;
          } else {
            results = response.content.map(item => ({ type: activeFilter, ...item }));
          }
        } else {
          console.error(`Invalid response format for ${activeFilter}:`, response);
          results = [];
        }
      }

      setSearchResults(results);
      setPosts(postsResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle friend request
  const handleFriendship = async (action, user) => {
    const userId = user.userID;
    const requestId = user.requestId;
    
    if (processingFriendRequests.has(userId)) return;
    
    try {
      setProcessingFriendRequests(prev => new Set(prev).add(userId));
      
      // Create a copy of search results to rollback if needed
      const originalResults = [...searchResults];
      
      switch (action) {
        case 'add':
          // Send new friend request
          setSearchResults(prevResults => prevResults.map(item => {
            if (item.type === 'user' && item.userID === userId) {
              return {
                ...item,
                friendshipStatus: 'REQUEST_SENT'
              };
            }
            return item;
          }));
          
          const response = await sendFriendRequest(userId);
          if (response.data.success) {
            // Update requestId with the new one from response
            setSearchResults(prevResults => prevResults.map(item => {
              if (item.type === 'user' && item.userID === userId) {
                return {
                  ...item,
                  requestId: response.data.data.id
                };
              }
              return item;
            }));
          }
          break;
          
        case 'accept':
          if (!requestId) {
            console.error('No friend request ID found');
            return;
          }
          
          setSearchResults(prevResults => prevResults.map(item => {
            if (item.type === 'user' && item.userID === userId) {
              return {
                ...item,
                friendshipStatus: 'FRIENDS'
              };
            }
            return item;
          }));
          
          await respondToFriendRequest(requestId, 'ACCEPTED');
          break;
          
        case 'decline':
          if (!requestId) {
            console.error('No friend request ID found');
            return;
          }
          
          setSearchResults(prevResults => prevResults.map(item => {
            if (item.type === 'user' && item.userID === userId) {
              return {
                ...item,
                friendshipStatus: 'NOT_FRIENDS',
                requestId: null
              };
            }
            return item;
          }));
          
          await respondToFriendRequest(requestId, 'DECLINED');
          break;
          
        case 'cancel':
          if (!requestId) {
            console.error('No friend request ID found');
            return;
          }
          
          setSearchResults(prevResults => prevResults.map(item => {
            if (item.type === 'user' && item.userID === userId) {
              return {
                ...item,
                friendshipStatus: 'NOT_FRIENDS',
                requestId: null
              };
            }
            return item;
          }));
          
          await deleteFriendRequest(requestId);
          break;
          
        default:
          console.error('Invalid action');
      }
      
    } catch (error) {
      console.error('Error handling friendship:', error);
      // Rollback if there's an error
      setSearchResults(originalResults);
      
      // Show error message
      alert('Có lỗi xảy ra khi xử lý yêu cầu kết bạn');
    } finally {
      setProcessingFriendRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  
  // Function to render friendship button based on status
  const renderFriendshipButton = (user) => {
    const status = user.friendshipStatus;
    
    // Check if this is the current user
    if (status === 'SELF') {
      return (
        <button
          className="btn btn-outline-success btn-sm"
          disabled={true}
          style={{ minWidth: '120px' }}
        >
          <i className="bi bi-person-check me-1"></i>
          Chính bạn
        </button>
      );
    }
    
    switch (status) {
      case 'FRIENDS':
        return (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleFriendship('cancel', user)}
            disabled={processingFriendRequests.has(user.userID)}
            style={{ 
              minWidth: '120px',
              opacity: processingFriendRequests.has(user.userID) ? 0.7 : 1
            }}
          >
            {processingFriendRequests.has(user.userID) ? (
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            ) : null}
            Hủy kết bạn
          </button>
        );
        
      case 'REQUEST_SENT':
        return (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleFriendship('cancel', user)}
            disabled={processingFriendRequests.has(user.userID)}
            style={{ 
              minWidth: '120px',
              opacity: processingFriendRequests.has(user.userID) ? 0.7 : 1
            }}
          >
            {processingFriendRequests.has(user.userID) ? (
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            ) : null}
            Hủy yêu cầu
          </button>
        );
        
      case 'REQUEST_RECEIVED':
        return (
          <div className="d-flex">
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => handleFriendship('accept', user)}
              disabled={processingFriendRequests.has(user.userID)}
              style={{ 
                minWidth: '100px',
                opacity: processingFriendRequests.has(user.userID) ? 0.7 : 1
              }}
            >
              {processingFriendRequests.has(user.userID) ? (
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              ) : null}
              Chấp nhận
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleFriendship('decline', user)}
              disabled={processingFriendRequests.has(user.userID)}
              style={{ 
                minWidth: '80px',
                opacity: processingFriendRequests.has(user.userID) ? 0.7 : 1
              }}
            >
              Từ chối
            </button>
          </div>
        );
        
      case 'NOT_FRIENDS':
      case 'DECLINED':
      default:
        return (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleFriendship('add', user)}
            disabled={processingFriendRequests.has(user.userID)}
            style={{ 
              minWidth: '120px',
              opacity: processingFriendRequests.has(user.userID) ? 0.7 : 1
            }}
          >
            {processingFriendRequests.has(user.userID) ? (
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            ) : null}
            Kết bạn
          </button>
        );
    }
  };

  // Function to render user card in newsfeed style
  const renderUser = (user) => {
    return (
      <div key={`user-${user.userID}`} className="card mt-3 w-100" style={{ backgroundColor: '#C0FFD1' }}>
        <div className="card-body d-flex align-items-center">
          <img 
            src={user.userImageAvatar || defaultAvatar} 
            className="rounded-circle me-3" 
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            alt={`${user.userFirstName} ${user.userLastName}`}
          />
          <div className="flex-grow-1">
            <h3 className="fs-5 fw-semibold mb-1">
              <a
                className="link-offset-2 link-underline link-underline-opacity-0 text-reset"
                href={`/profile/${user.userID}`}
              >
                {user.userLastName} {user.userFirstName}
              </a>
            </h3>
            <p className="text-muted small mb-0">
              {user.userSchool || 'Chưa cập nhật trường học'}
            </p>
          </div>
          <div>
            {renderFriendshipButton(user)}
          </div>
        </div>
      </div>
    );
  };

  // Function to render group card in newsfeed style
  const renderGroup = (group) => {
    // Format the creation date
    const formattedDate = new Date(group.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  
    return (
      <div 
        key={`group-${group.groupID}`} 
        className="card mt-3 w-100"
        style={{ backgroundColor: '#C0FFD1' }}
      >
        <div className="card-body d-flex align-items-center">
          <img 
            src={group.coverImg || defaultAvatar} 
            alt={group.name} 
            className="rounded-circle me-3" 
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <h3 className="fs-5 fw-semibold mb-1">
              <a
                className="link-offset-2 link-underline link-underline-opacity-0 text-reset"
                href={`/group/${group.groupID}`}
              >
                {group.name}
              </a>
            </h3>
            <p className="text-muted small mb-0">
              {group.memberCount ? `${group.memberCount} thành viên` : 'Nhóm mới'} • 
              {group.privacy === 'PUBLIC' ? (
                <span><i className="bi bi-globe-americas ms-1"></i> Công khai</span>
              ) : (
                <span><i className="bi bi-lock ms-1"></i> Riêng tư</span>
              )} • 
              Ngày lập: {formattedDate}
            </p>
          </div>
          <button className={`btn ${group.isJoined ? 'btn-outline-success' : 'btn-success'} btn-sm`}>
            {group.isJoined ? 'Đã tham gia' : 'Tham gia'}
          </button>
        </div>
      </div>
    );
  };

  // Function to render post in newsfeed style
  const renderPost = (post) => (
    <div 
      key={`post-${post.postID}`} 
      className="card mt-3 w-100"
      style={{ backgroundColor: '#C0FFD1', overflow: 'hidden' }}
    >
      <div className="card-body">
        {/* Post header */}
        <div className="d-flex align-items-start justify-content-between">
          <img
            src={post.user?.userImageAvatar || defaultAvatar}
            className="rounded-circle"
            style={{ 
              width: '50px', 
              height: '50px', 
              objectFit: 'cover', 
              marginRight: '15px' 
            }}
            alt={post.user ? `${post.user.userFirstName} ${post.user.userLastName}` : 'User'}
          />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between flex-wrap">
              <span style={{ fontSize: '18px', fontWeight: '500', cursor: 'pointer' }}>
                <a
                  className="link-offset-2 link-underline link-underline-opacity-0 text-reset"
                  href={`/profile/${post.user?.userID}`}
                >
                  {post.user ? `${post.user.userLastName} ${post.user.userFirstName}` : 'Unknown User'}
                </a>
              </span>
              <span style={{ fontSize: '14px', color: '#888' }}>
                {new Date(post.postCreateAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p style={{ fontSize: '16px', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
              {post.postContent}
            </p>
          </div>
        </div>

        {/* Media Section */}
        {post.media && post.media.length > 0 && (
          <MediaSection 
            media={post.media} 
            videoRefs={videoRefs}
          />
        )}

        {/* Shared Post */}
        {post.sharedPost && (
          <SharedPostComponent 
            sharedPost={post.sharedPost} 
            videoRefs={videoRefs}
          />
        )}

        {/* Interaction section */}
        <div className="d-flex flex-column flex-md-row mt-3 ms-3">
          <div className="d-flex mb-2 mb-md-0">
            <div className="me-3 text-success" style={{ cursor: 'pointer' }}>
              <i 
                className={`bi ${post.isLiked ? 'bi-heart-fill' : 'bi-heart'}`}
                style={{ 
                  fontSize: '22px', 
                  color: post.isLiked ? '#ff0000' : 'inherit',
                  transition: 'color 0.3s ease, transform 0.2s ease',
                  transform: post.isLiked ? 'scale(1.1)' : 'scale(1)',
                  opacity: processingLikes.has(post.postID) ? 0.5 : 1,
                  cursor: processingLikes.has(post.postID) ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleLikeClick(post.postID)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = post.isLiked ? 'scale(1.1)' : 'scale(1)'}
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
                {post.likesCount || 0}
              </span>
            </div>
            
            <div 
              className="me-3 text-success" 
              style={{ cursor: 'pointer' }}
              onClick={() => openModalComment(post)}
            >
              <i className="bi bi-chat-right-text" style={{ fontSize: '22px' }}></i>
              <span className="ms-1">{post.commentCount || 0}</span>
            </div>
            
            <div className="me-3 text-success" style={{ cursor: 'pointer' }}>
              <i className="bi bi-share" style={{ fontSize: '22px' }}></i>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="container py-4">
        <CustomScrollbar />
        <div className="row g-4">
          {/* Mobile search bar - only visible on small screens */}
          <div className="col-12 d-md-none mb-3">
            <div className="card shadow-sm" style={{ backgroundColor: '#C0FFD1' }}>
              <div className="card-body">
                <form onSubmit={handleSearch} className="mb-2">
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#A4D2B9', border: 'none' }}>
                        <i className="bi bi-search text-white"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                          backgroundColor: '#EAFFF0', 
                          border: 'none', 
                          color: '#027536'
                        }}
                      />
                    </div>
                  </div>
                  <div className="d-flex mt-2">
                    <button
                      type="submit"
                      className="btn flex-grow-1"
                      style={{ backgroundColor: '#027536', color: 'white' }}
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </form>
                
                {/* Mobile filter buttons */}
                <div className="d-flex justify-content-between mt-2">
                  <button 
                    className={`btn btn-sm flex-grow-1 me-1 ${activeFilter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    Tất cả
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 me-1 ${activeFilter === 'users' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveFilter('users')}
                  >
                    Người dùng
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 me-1 ${activeFilter === 'posts' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveFilter('posts')}
                  >
                    Bài viết
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 ${activeFilter === 'groups' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveFilter('groups')}
                  >
                    Nhóm
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Left column - Search and filters - hidden on mobile */}
          <div className="col-md-4 d-none d-md-block">
            <div className="card shadow-sm" style={{ backgroundColor: '#C0FFD1' }}>
              <div className="card-body">
                {/* Title */}
                <h1 className="fs-4 fw-bold mb-4 text-success">Tìm kiếm</h1>
                
                {/* Search form */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="mb-3 position-relative">
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#A4D2B9', border: 'none' }}>
                        <i className="bi bi-search text-white"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                          backgroundColor: '#EAFFF0', 
                          border: 'none', 
                          color: '#027536'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn w-100"
                    style={{ backgroundColor: '#027536', color: 'white' }}
                  >
                    Tìm kiếm
                  </button>
                </form>
                
                {/* Result type filters */}
                <div className="mb-4">
                  <h2 className="fs-5 fw-semibold mb-3 text-success">Loại kết quả</h2>
                  <div className="list-group">
                    <button 
                      className={`list-group-item list-group-item-action ${activeFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('all')}
                      style={{ 
                        backgroundColor: activeFilter === 'all' ? '#027536' : '#EAFFF0',
                        color: activeFilter === 'all' ? 'white' : '#027536',
                        border: 'none',
                        marginBottom: '5px'
                      }}
                    >
                      Tất cả kết quả
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeFilter === 'users' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('users')}
                      style={{ 
                        backgroundColor: activeFilter === 'users' ? '#027536' : '#EAFFF0',
                        color: activeFilter === 'users' ? 'white' : '#027536',
                        border: 'none',
                        marginBottom: '5px'
                      }}
                    >
                      Người dùng
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeFilter === 'posts' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('posts')}
                      style={{ 
                        backgroundColor: activeFilter === 'posts' ? '#027536' : '#EAFFF0',
                        color: activeFilter === 'posts' ? 'white' : '#027536',
                        border: 'none',
                        marginBottom: '5px'
                      }}
                    >
                      Bài viết
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeFilter === 'groups' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('groups')}
                      style={{ 
                        backgroundColor: activeFilter === 'groups' ? '#027536' : '#EAFFF0',
                        color: activeFilter === 'groups' ? 'white' : '#027536',
                        border: 'none'
                      }}
                    >
                      Nhóm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Search results */}
          <div className="col-12 col-md-8">
            <div className="card shadow-sm" style={{ backgroundColor: 'rgb(192, 255, 197)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fs-4 fw-semibold mb-0 text-success">Kết quả tìm kiếm</h2>
                  <div className="text-muted small">
                    {isLoading ? 'Đang tải...' : `${searchResults.length} kết quả`}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(item => {
                    if (item.type === 'users' || item.type === 'user') return renderUser(item);
                    if (item.type === 'post') return renderPost(item);
                    if (item.type === 'groups' || item.type === 'group') return renderGroup(item);
                    return null;
                  })
                ) : searchQuery ? (
                  <div className="text-center py-4">
                    <i className="bi bi-search fs-1 text-success"></i>
                    <p className="text-muted mt-2">Không tìm thấy kết quả phù hợp</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-search fs-1 text-success"></i>
                    <p className="text-muted mt-2">Nhập từ khóa để tìm kiếm</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ListLike 
        isModalOpenLike={isModalOpenLike} 
        closeModalLike={closeModalLike} 
        post={currentPostForLike}
      />
      
      <Comment 
        isModalOpenComment={isModalOpenComment} 
        closeModalComment={closeModalComment} 
        post={currentPostForComment} 
      />
    </div>
  );
};

export default Search;