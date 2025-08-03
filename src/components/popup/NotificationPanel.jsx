import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationModal from './NotificationModal';
import Comment from './Comment';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { getNotifications ,  markNotificationAsRead,
  markAllNotificationsAsRead } from '../../services/NotificationService';

const NotificationPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const size = 10;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(page, size);
      setNotifications(prev => page === 0 ? response.data.content : [...prev, ...response.data.content]);
      setHasMore(!response.data.last);
      setError(null);
    } catch (err) {
      setError('Không thể tải thông báo');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setPage(prev => prev + 1);
    await fetchNotifications();
    setLoadingMore(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.notificationID);
        setNotifications(prev => prev.map(n => 
          n.notificationID === notification.notificationID ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    switch (notification.type) {
      case 'COMMENT':
      case 'REPLY':
        setSelectedPost({
          ...notification.post,
          highlightedCommentId: notification.comment?.commentID
        });
        setIsCommentModalOpen(true);
        break;
        
      case 'FRIEND_REQUEST':
        navigate(`/profile/${notification.relatedUser.userID}`, {
          state: { showFriendResponse: true }
        });
        onClose();
        break;
        
      case 'POST_LIKE':
      case 'SHARE':
        navigate(`/post/${notification.post.postID}`);
        onClose();
        break;
        
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.read);

  const generateNotificationContent = (notification) => {
    const user = notification.relatedUser;
    switch (notification.type) {
      case 'POST_LIKE':
        return `${user.fullName} đã thích bài viết của bạn`;
      case 'COMMENT':
        return `${user.fullName} đã bình luận về bài viết của bạn`;
      case 'FRIEND_REQUEST':
        return `${user.fullName} đã gửi lời mời kết bạn`;
      case 'FRIEND_ACCEPTED':
        return `${user.fullName} đã chấp nhận lời mời kết bạn`;
      case 'REPLY':
        return `${user.fullName} đã trả lời bình luận của bạn`;
      default:
        return notification.content;
    }
  };

  const formatTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: vi 
    });
  };

  const customStyles = {
    header: {
      backgroundColor: '#C0FFD1',
      borderBottom: '1px solid #96E6A1',
      padding: '15px 20px',
      borderRadius: '8px 8px 0 0'
    },
    tabButton: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '8px 15px',
      margin: '0 5px',
      borderRadius: '20px',
      fontWeight: 500,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    activeTabButton: {
      backgroundColor: '#96E6A1',
      color: '#1a472a'
    },
    notificationItem: {
      borderLeft: '3px solid transparent',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    unreadNotification: {
      borderLeft: '3px solid #C0FFD1',
      backgroundColor: 'rgba(192, 255, 209, 0.1)'
    },
    noNotifications: {
      textAlign: 'center',
      padding: '50px 20px',
      color: '#6c757d'
    }
  };

  return (
    <>
      <NotificationModal isOpen={isOpen} onClose={onClose}>
        <div className="notification-container h-100 d-flex flex-column">
          {/* Header */}
          <div style={customStyles.header} className="d-flex justify-content-between align-items-center">
            <h5 className="m-0 fw-bold">Thông báo</h5>
            <button
              onClick={markAllAsRead}
              className="btn btn-sm"
              style={{ backgroundColor: '#96E6A1', color: '#1a472a' }}
            >
              Đánh dấu đã đọc tất cả
            </button>
          </div>

          {/* Tabs */}
          <div className="d-flex border-bottom p-2 justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                ...customStyles.tabButton,
                ...(activeTab === 'all' ? customStyles.activeTabButton : {})
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              style={{
                ...customStyles.tabButton,
                ...(activeTab === 'unread' ? customStyles.activeTabButton : {})
              }}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setActiveTab('read')}
              style={{
                ...customStyles.tabButton,
                ...(activeTab === 'read' ? customStyles.activeTabButton : {})
              }}
            >
              Đã đọc
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-grow-1 overflow-auto">
            {filteredNotifications.length === 0 ? (
              <div style={customStyles.noNotifications}>
                <i className="bi bi-bell-slash fs-1 d-block mb-3 text-muted"></i>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {filteredNotifications.map(notification => (
                  <li
                    key={notification.notificationID}
                    className="list-group-item list-group-item-action p-3"
                    style={{
                      ...customStyles.notificationItem,
                      ...(!notification.read ? customStyles.unreadNotification : {})
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="d-flex">
                      <div className="me-3 position-relative">
                        <img
                          src={notification.relatedUser?.avatarUrl || 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153743/LOgoDon-Photoroom_c3j3qa.png'}
                          alt="avatar"
                          className="rounded-circle"
                          width="50"
                          height="50"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1 fw-semibold">
                              {generateNotificationContent(notification)}
                            </p>
                            <small className="text-muted">
                              {formatTime(notification.createdAt)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-top text-center">
            {hasMore && (
              <button
                className="btn w-100"
                style={{ backgroundColor: '#C0FFD1', color: '#1a472a' }}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : null}
                {loadingMore ? 'Đang tải...' : 'Xem thêm thông báo'}
              </button>
            )}
          </div>
        </div>
      </NotificationModal>

      {/* Comment Modal */}
      {selectedPost && (
        <Comment
          isModalOpenComment={isCommentModalOpen}
          closeModalComment={() => {
            setIsCommentModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}
    </>
  );
};

export default NotificationPanel;