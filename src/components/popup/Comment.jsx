import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import MediaSection from "../post/MediaSection";
import SharedPostComponent from "../post/SharedPostComponent";
import {
  CreateComment,
  GetCommentByCommentId,
  GetCommentByPostId,
  CreateReaction,
  DeleteReaction
} from "../../service/PostService";
import Cookies from 'js-cookie';
import { Spinner } from "react-bootstrap";
import { GetUserById } from "../../service/UserService";

const Comment = ({ isModalOpenComment, closeModalComment, post }) => {
  const [comments, setComments] = useState([]);
  const [replyPages, setReplyPages] = useState({});
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [processingLikes, setProcessingLikes] = useState(new Set());
  const userId = parseInt(Cookies.get('c_user'));
  const [user, setUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [expandedComments, setExpandedComments] = useState(new Set());

  const defaultImg = "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1743004500/social_uploads/social_post_1743004498854_0.jpg";

  useEffect(() => {
    if (isModalOpenComment && post) {
      setPage(0);
      setHasMore(true);
      setInitialLoad(true);
      fetchRootComments(0);
    }
  }, [isModalOpenComment, post]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await GetUserById(userId);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (!isModalOpenComment || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          fetchRootComments(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.querySelector('#comments-sentinel');
    if (sentinel && hasMore) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [isModalOpenComment, loading, hasMore, page]);

  const fetchRootComments = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const response = await GetCommentByPostId(post?.postID, {
        page: pageNumber,
        size: 5,
        sort: ["commentCreateAt"]
      });
      
      const newComments = response.data.content.map(comment => ({
        ...comment,
        isLiked: comment.liked,
        replies: []
      }));
      
      setComments(prev => pageNumber === 0 ? newComments : [...prev, ...newComments]);
      
      // Check if we've reached the end of the comments
      setHasMore(
        !response.data.last && 
        response.data.numberOfElements > 0 && 
        response.data.totalElements > (pageNumber + 1) * response.data.size
      );
      
      setPage(pageNumber);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const findCommentSafe = (comments, targetId) => {
    if (!comments || !Array.isArray(comments)) return null;
    
    for (const comment of comments) {
      if (comment?.commentId === targetId) return comment;
      if (Array.isArray(comment?.replies)) {
        const found = findCommentSafe(comment.replies, targetId);
        if (found) return found;
      }
    }
    return null;
  };


  const fetchReplies = async (commentId, page) => {
    try {
      const response = await GetCommentByCommentId(commentId, {
        page,
        size: 3, // Load 3 replies at a time
        sort: ["commentCreateAt"]
      });
      
      return response.data.content.map(reply => ({
        ...reply,
        isLiked: reply.liked
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    let tempId = Date.now();
    
    try {
      const commentData = {
        content: newComment,
        postId: post.postID,
        parentCommentId: replyingTo?.commentId || null
      };

      // Optimistic update object
      const newCommentObj = {
        commentId: tempId,
        content: newComment,
        user: {
          userId: user.userID,
          firstName: user.userFirstName,
          lastName: user.userLastName,
          avatar: user.userImageAvatar
        },
        parentCommentId: replyingTo?.commentId || null,
        rootCommentId: replyingTo?.rootCommentId || null,
        createdAt: new Date().toISOString(),
        replyToUser: replyingTo?.user 
          ? {
              userId: replyingTo.user.userId,
              firstName: replyingTo.user.firstName,
              lastName: replyingTo.user.lastName,
              avatar: replyingTo.user.avatar
            }
          : null,
        // Add these for UI state management
        reactCount: 0,
        isLiked: false,
        replyCount: 0,
        liked: false
      };

      // Add optimistic update
      setComments(prev => replyingTo 
        ? prev.map(comment => 
            comment.commentId === replyingTo.commentId
              ? { 
                  ...comment, 
                  replyCount: comment.replyCount + 1, 
                  replies: [newCommentObj, ...comment.replies] 
                }
              : comment
          )
        : [newCommentObj, ...prev]
      );

      // Call API without userId
      const response = await CreateComment(commentData);
      
      // Replace with API response
      setComments(prev => prev.map(comment => {
        if (comment.commentId === tempId) return {...response.data, isLiked: response.data.liked};
        if (comment.replies?.some(reply => reply.commentId === tempId)) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.commentId === tempId ? {...response.data, isLiked: response.data.liked} : reply
            )
          };
        }
        return comment;
      }));

      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating comment:", error);
      // Rollback if error
      setComments(prev => prev.filter(comment => 
        comment.commentId !== tempId && 
        !comment.replies?.some(reply => reply.commentId === tempId)
      ));
    }
  };

  const handleLoadMoreReplies = async (commentId) => {
    try {
      const currentPage = replyPages[commentId] || 0;
      const newReplies = await fetchReplies(commentId, currentPage);
      
      setComments(prev => prev.map(comment => {
        if (comment.commentId === commentId) {
          const updatedReplies = [...(comment.replies || []), ...newReplies];
          // Remove any duplicates based on commentId
          const uniqueReplies = Array.from(
            new Map(updatedReplies.map(reply => [reply.commentId, reply])).values()
          );
          return {
            ...comment,
            replies: uniqueReplies
          };
        }
        return comment;
      }));
      
      setReplyPages(prev => ({ ...prev, [commentId]: currentPage + 1 }));
    } catch (error) {
      console.error("Error loading more replies:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (processingLikes.has(commentId)) return;
    
    try {
      setProcessingLikes(prev => new Set([...prev, commentId]));

      const targetComment = findCommentSafe(comments, commentId);
      if (!targetComment) {
        console.error("Comment not found:", commentId);
        return;
      }

      // Optimistic update
      setComments(prev => updateComments(prev, commentId));
      
      // API call - no need to handle response data
      if (targetComment.isLiked) {
        await DeleteReaction({ commentId });
      } else {
        await CreateReaction({ commentID: commentId });
      }

      // Keep the optimistic update since API was successful
      
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert the optimistic update on error
      setComments(prev => updateComments(prev, commentId)); // Toggle back
    } finally {
      setProcessingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) 
        ? '--/--/----' 
        : date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
    } catch {
      return '--/--/----';
    }
  };


  const findComment = (comments, targetId) => {
    for (const comment of comments) {
      if (comment.commentId === targetId) return comment;
      if (comment.replies) {
        const found = findComment(comment.replies, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Hàm helper để update comments
const updateComments = (comments, commentId) => {
  return comments.map(comment => {
    if (comment.commentId === commentId) {
      return {
        ...comment,
        isLiked: !comment.isLiked,
        reactCount: comment.isLiked ? comment.reactCount - 1 : comment.reactCount + 1
      };
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: updateComments(comment.replies, commentId)
      };
    }
    return comment;
  });
};

// Add these before the CommentItem component
const toggleCommentExpansion = (commentId) => {
  setExpandedComments(prev => {
    const newSet = new Set(prev);
    if (newSet.has(commentId)) {
      newSet.delete(commentId);
      // When collapsing, we keep only the first 5 replies
      setComments(prev => prev.map(comment => {
        if (comment.commentId === commentId) {
          return {
            ...comment,
            replies: comment.replies.slice(0, 5)
          };
        }
        return comment;
      }));
    } else {
      newSet.add(commentId);
    }
    return newSet;
  });
};

const isCommentExpanded = (commentId) => {
  return expandedComments.has(commentId);
};

  const CommentItem = ({ comment, depth = 0 }) => {
    if (!comment) return null;

    const hasMoreReplies = comment.replyCount > (comment.replies?.length || 0);
    const isExpanded = isCommentExpanded(comment.commentId);
    // Show first 5 replies when collapsed, all when expanded
    const visibleReplies = isExpanded 
      ? comment.replies 
      : (comment.replies || []).slice(0, 5);
    const hiddenRepliesCount = (comment.replies || []).length - 5;

    return (
      <div className={`ms-${depth * 2} mt-2`} style={{ borderLeft: depth > 0 ? '2px solid #eee' : 'none' }}>
        <div className="d-flex align-items-start">
          <img
            src={comment.user?.avatar || defaultImg}
            className="rounded-circle me-2"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            alt={`${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`}
          />
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0">
                {comment.user?.lastName || 'User'} {comment.user?.firstName || ''}
              </h6>
              {comment?.replyToUser && (
                <small className="text-muted">
                  → Trả lời {comment.replyToUser.lastName} {comment.replyToUser.firstName}
                </small>
              )}
            </div>
            
            <p className="mb-1">{comment.content}</p>
            
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-link p-0 text-muted d-flex align-items-center"
                onClick={() => handleLikeComment(comment.commentId)}
                disabled={processingLikes.has(comment.commentId)}
              >
                {processingLikes.has(comment.commentId) ? (
                  <Spinner animation="border" size="sm" className="me-1" />
                ) : (
                  <i className={`bi ${comment.isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'}`} />
                )}
                <span className="ms-1">{comment.reactCount}</span>
              </button>
              
              <button
                className="btn btn-link p-0 text-muted"
                onClick={() => setReplyingTo({
                  commentId: comment.commentId,
                  userName: `${comment.user.lastName} ${comment.user.firstName}`,
                  user: comment.user
                })}
              >
                Trả lời
              </button>
              
              <small className="text-muted">
                {formatDate(comment.commentCreateAt)}
              </small>
            </div>

            {/* Replies section */}
            {visibleReplies.length > 0 && (
              <div className="ms-4">
                {visibleReplies.map(reply => (
                  <CommentItem 
                    key={`${reply.commentId}-${reply.parentCommentId}`} 
                    comment={reply} 
                    depth={depth + 1} 
                  />
                ))}
                
                {/* Show/Hide replies button */}
                {comment.replies?.length > 5 && (
                  <button
                    className="btn btn-link p-0 small d-block mt-2"
                    onClick={() => toggleCommentExpansion(comment.commentId)}
                  >
                    {isExpanded 
                      ? '↑ Ẩn bớt phản hồi' 
                      : `↓ Xem thêm ${hiddenRepliesCount} phản hồi`}
                  </button>
                )}
              </div>
            )}

            {/* Load more replies button */}
            {hasMoreReplies && (
              <button
                className="btn btn-link p-0 small d-block mt-2"
                onClick={() => handleLoadMoreReplies(comment.commentId)}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Tải thêm {comment.replyCount - (comment.replies?.length || 0)} phản hồi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isModalOpenComment} onClose={closeModalComment}>
      {post && (
        <div className="container-fluid p-3" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', overflowX:'clip'  }}>
          <div className="card mb-3" style={{ backgroundColor: '#C0FFD1' }}>
            <div className="card-body">
              <div className="d-flex align-items-start">
                <img
                  src={post.user?.userImageAvatar || defaultImg}
                  className="rounded-circle me-3"
                  style={{ width: '40px', height: '40px' }}
                  alt={post.user?.userFirstName}
                />
                <div className="flex-grow-1">
                  <h5>{post.user?.userLastName} {post.user?.userFirstName}</h5>
                  <p>{post.postContent}</p>
                  <div style={{
                    marginLeft: '-5vh',
                    width: '100vh',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    whiteSpace: 'nowrap',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: '-ms-autohiding-scrollbar'
                  }}>
                    <MediaSection media={post.media} />
                    {post.sharedPost && <SharedPostComponent sharedPost={post.sharedPost} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="d-flex align-items-center">
                <img
                  src={user?.userImageAvatar || defaultImg}
                  className="rounded-circle me-2"
                  style={{ width: '40px', height: '40px' , objectFit: 'cover' }}
                  alt="Your avatar"
                />
                <div className="flex-grow-1 me-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={replyingTo 
                      ? `Trả lời ${replyingTo.userName}...`
                      : "Viết bình luận..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={!newComment.trim()}
                >
                  Đăng
                </button>
              </div>
              {replyingTo && (
                <div className="mt-2 text-muted">
                  Đang trả lời {replyingTo.userName}
                  <button 
                    type="button" 
                    className="btn btn-link p-0 ms-2"
                    onClick={() => setReplyingTo(null)}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </form>

            {initialLoad ? (
              <div className="text-center">
                <Spinner animation="border" variant="success" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted">Chưa có bình luận nào</div>
            ) : (
              <>
                {comments.map(comment => (
                  <CommentItem key={comment.commentId} comment={comment} />
                ))}
                {loading && (
                  <div className="text-center mt-3">
                    <Spinner animation="border" variant="success" size="sm" />
                  </div>
                )}
                {!loading && !hasMore && comments.length > 0 && (
                  <div className="text-center text-muted mt-3">
                    <small>Đã hiển thị tất cả bình luận</small>
                  </div>
                )}
                <div id="comments-sentinel" style={{ height: "20px" }} />
              </>
            )}
          </div>
        </div>
      </div>
      )}
    </Modal>
  );
};

export default Comment;