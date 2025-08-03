import React from 'react'
import { useRef, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import PostList from './PostList';
import SharedList from './SharedList';
import Cookies from 'js-cookie';
import './Profile.css';
import { toast } from 'react-toastify';

import { GetUserById, UpdateUser } from '../../../service/UserService';
import { sendFriendRequest, respondToFriendRequest, deleteFriendRequest, getFriends, checkFriendshipStatus } from '../../../service/FriendService';
import Modal from '../../../components/popup/Modal';
import CloudinaryUpload from '../../../components/Testupimage';
import FriendsListModal from '../../../components/popup/FriendsListModal';
import ReportServices, { REPORT_TYPES } from '../../../services/ReportSer';

const Profile = () => {
  const mediaContainerRef = useRef(null);
  const { userID } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Report Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  const [userData, setUserData] = useState({
    userID: null,
    userFirstName: "",
    userLastName: "",
    userDateOfBirth: "",
    userGender: "",
    userAddress: null,
    userSchool: null,
    userRelationshipStatus: null,
    userImageAvatar: null,
    userCreateAt: "",
    userDesc: "",
    isDoBHidden: false,
    isSchoolHidden: false,
    isRelationshipHidden: false,
  });

  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendRequestId, setFriendRequestId] = useState(null);

  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Report reasons
  const REPORT_REASONS = [
    'Spam hoặc nội dung không mong muốn',
    'Quấy rối hoặc bắt nạt',
    'Nội dung không phù hợp',
    'Giả mạo danh tính',
    'Nội dung bạo lực hoặc có hại',
    'Thông tin sai lệch',
    'Vi phạm bản quyền',
    'Lý do khác'
  ];

  // Handle Report User
  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      setReportError('Vui lòng chọn lý do báo cáo');
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportError(null);

      const reportData = {
        reportType: REPORT_TYPES.USER,
        targetId: parseInt(userID),
        reason: reportReason
      };

      const response = await ReportServices.createReport(reportData);
      
      if (response.data.success || response.status === 200) {
        // Close modal and show success message
        setIsReportModalOpen(false);
        setReportReason('');
        toast.success('Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét và xử lý.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setReportError('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Render Report Modal
  const renderReportModal = () => (
    <Modal isOpen={isReportModalOpen} onClose={() => {
      setIsReportModalOpen(false);
      setReportReason('');
      setReportError(null);
    }}>
      <div className="p-4">
        <h4 className="mb-4 text-center">
          <i className="bi bi-flag text-danger me-2"></i>
          Báo cáo người dùng
        </h4>
        
        <div className="mb-3">
          <p className="text-muted">
            Bạn đang báo cáo <strong>{getFullName()}</strong>
          </p>
          <small className="text-muted">
            Vui lòng chọn lý do báo cáo. Chúng tôi sẽ xem xét và thực hiện các biện pháp cần thiết.
          </small>
        </div>

        {reportError && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {reportError}
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-semibold">Lý do báo cáo *</label>
          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {REPORT_REASONS.map((reason, index) => (
              <div key={index} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="reportReason"
                  id={`reason-${index}`}
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  disabled={isSubmittingReport}
                />
                <label className="form-check-label" htmlFor={`reason-${index}`}>
                  {reason}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setIsReportModalOpen(false);
              setReportReason('');
              setReportError(null);
            }}
            disabled={isSubmittingReport}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReportUser}
            disabled={isSubmittingReport || !reportReason.trim()}
          >
            {isSubmittingReport ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="bi bi-flag me-2"></i>
                Gửi báo cáo
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );

  // Thêm hàm xử lý upload ảnh đại diện
  const handleAvatarUpload = async (uploadedFiles) => {
    if (uploadedFiles.length === 0) return;

    try {
      setIsUploading(true);
      const avatarFile = uploadedFiles[0];

      // Gọi API cập nhật avatar
      const updatedUser = {
        ...userData,
        userImageAvatar: avatarFile.url
      };

      await UpdateUser(updatedUser, userID);

      // Cập nhật dữ liệu local
      setUserData(prev => ({
        ...prev,
        userImageAvatar: avatarFile.url
      }));

      setIsAvatarModalOpen(false);
      setNewAvatar(null); // Reset preview
    } catch (error) {
      console.error("Avatar update failed:", error);
      toast.error("Cập nhật ảnh đại diện thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!isCurrentUser && userID) {
        try {
          const response = await checkFriendshipStatus(userID);
          
          if (response.data.success) {
            const status = response.data.data.status;
            // We need to get the requestId from the response
            const requestId = response.data.data.requestId; // Assuming backend sends requestId
            setFriendRequestId(requestId);
            
            switch (status) {
              case 'SELF':
                setIsCurrentUser(true);
                setFriendshipStatus(null);
                break;
                
              case 'NOT_FRIENDS':
              case 'FRIENDS':
              case 'REQUEST_SENT':
              case 'REQUEST_RECEIVED':
              case 'DECLINED':
                setFriendshipStatus(status); 
                break;
                
              default:
                setFriendshipStatus('NOT_FRIENDS');
                console.warn('Unknown friendship status:', status);
                break;
            }
          } else {
            console.error('Error in friendship status response:', response.data.message);
            setFriendshipStatus('NOT_FRIENDS');
          }
        } catch (error) {
          console.error('Error checking friendship status:', error);
          setFriendshipStatus('NOT_FRIENDS');
        }
      }
    };

    checkFriendStatus();
  }, [userID, isCurrentUser]);

  const handleFriendship = async (action) => {
    try {
      switch (action) {
        case 'add':
          const response = await sendFriendRequest(userID);
          if (response.data.success) {
            setFriendshipStatus('REQUEST_SENT');
            setFriendRequestId(response.data.data.id); // Save the new request ID
          }
          break;
          
        case 'accept':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await respondToFriendRequest(friendRequestId, 'ACCEPTED');
          setFriendshipStatus('FRIENDS');
          break;
          
        case 'decline':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await respondToFriendRequest(friendRequestId, 'DECLINED');
          setFriendshipStatus('NOT_FRIENDS');
          setFriendRequestId(null);
          break;
          
        case 'cancel':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await deleteFriendRequest(friendRequestId);
          setFriendshipStatus('NOT_FRIENDS');
          setFriendRequestId(null);
          break;
          
        default:
          console.error('Invalid action');
      }
    } catch (error) {
      console.error('Error handling friendship:', error);
      alert('Có lỗi xảy ra khi xử lý yêu cầu kết bạn');
    }
  };

  const renderFriendshipButton = () => {
    if (isCurrentUser) return null;

    switch (friendshipStatus) {
      case 'FRIENDS':
        return (
          <button
            className="btn btn-outline-danger me-2"
            onClick={() => handleFriendship('cancel')}
          >
            Hủy kết bạn
          </button>
        );
        
      case 'REQUEST_SENT':
        return (
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => handleFriendship('cancel')}
          >
            Hủy yêu cầu
          </button>
        );
        
      case 'REQUEST_RECEIVED':
        return (
          <>
            <button
              className="btn btn-primary me-2"
              onClick={() => handleFriendship('accept')}
            >
              Chấp nhận
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => handleFriendship('decline')}
            >
              Từ chối
            </button>
          </>
        );
        
      case 'NOT_FRIENDS':
        return (
          <button
            className="btn btn-primary me-2"
            onClick={() => handleFriendship('add')}
          >
            Kết bạn
          </button>
        );
        
      default:
        return null;
    }
  };

  // Thêm phần JSX cho avatar upload modal
  const renderAvatarModal = () => (
    <Modal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)}>
      <div className="p-4 text-center">
        <h4 className="mb-4">Cập nhật ảnh đại diện</h4>

        <div className="mb-4 position-relative">
          <div className="avatar-preview-container">
            <img
              src={newAvatar || getAvatar()}
              alt="Preview"
              className="rounded-circle img-fluid"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                filter: isUploading ? 'blur(2px)' : 'none'
              }}
            />
            {isUploading && (
              <div className="upload-overlay">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <CloudinaryUpload
          onFileUpload={handleAvatarUpload}
          fileType="image"
          maxFiles={1}
          showPreview={false}
          buttonText="Chọn ảnh mới"
          disabled={isUploading}
        />

        <div className="mt-3 text-muted">
          <small>Ảnh phải có định dạng JPG, PNG hoặc GIF và nhỏ hơn 10MB</small>
        </div>
      </div>
    </Modal>
  );

  // Format date of birth
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Get full name
  const getFullName = () => {
    return (userData.userLastName || "") + " " + (userData.userFirstName || "");
  };

  // Get relationship status
  const getRelationshipStatus = () => {
    return userData.userRelationshipStatus ? userData.userRelationshipStatus : "Chưa cập nhật";
  };

  // Get school
  const getSchool = () => {
    return userData.userSchool ? userData.userSchool : "Chưa cập nhật";
  };

  // Get address
  const getAddress = () => {
    return userData.userAddress ? userData.userAddress : "Chưa cập nhật";
  };

  // Get avatar
  const getAvatar = () => {
    return userData.userImageAvatar ? userData.userImageAvatar : "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1743004500/social_uploads/social_post_1743004498854_0.jpg";
  };

  // Get user description
  const getUserDesc = () => {
    return userData.userDesc ? userData.userDesc : "Chưa cập nhật";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userResponse, friendshipResponse] = await Promise.all([
          GetUserById(userID),
          getFriends(userID)
        ]);

        const checkFriendRequest = async () => {
          try {
            const response = await checkFriendshipStatus(userID);
            if (response.data.exists) {
              setFriendRequestId(response.data.requestId);
              setFriendshipStatus(response.data.status);
            }
          } catch (err) {
            console.error('Error checking friend request:', err);
          }
        };

        

        setUserData(userResponse.data);

        // Check if current user matches the profile being viewed
        const cookieC_User = Cookies.get('c_user');
        setIsCurrentUser(cookieC_User === userID);

        checkFriendRequest();
        // Check friendship status
        const friends = friendshipResponse.data.data;
        const friendship = friends.find(f =>
          f.sender.userID === userID || f.receiver.userID === userID
        );

        if (friendship) {
          setFriendRequestId(friendship.id);
          if (friendship.status === 'accepted') {
            setFriendshipStatus('friends');
          } else if (friendship.status === 'pending') {
            setFriendshipStatus(friendship.sender.userID === userID ? 'received' : 'pending');
          }
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID]);

  const handleViewFriends = async () => {
    try {
      setLoadingFriends(true);
      setIsFriendsModalOpen(true);
      const response = await getFriends(userID);
      if (response.data.success) {
        setFriendsList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Function to handle Edit Profile click
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedUser = {
        ...userData,
        userDateOfBirth: userData.userDateOfBirth || new Date().toISOString(),
        userCreateAt: userData.userCreateAt || new Date().toISOString()
      };

      await UpdateUser(updatedUser, userID);
      // Refresh user data
      const response = await GetUserById(userID);
      setUserData(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      setUpdateError("Cập nhật thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAvatarSection = () => (
    <div className="col-md-3 text-center position-relative">
      <img
        src={getAvatar()}
        alt="Profile"
        className="rounded-circle img-fluid"
        style={{ minWidth: '250px', height: '250px', objectFit: 'cover' }}
      />

      {isCurrentUser && (
        <button
          className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle"
          style={{ width: '40px', height: '40px' }}
          onClick={() => setIsAvatarModalOpen(true)}
          title="Đổi ảnh đại diện"
        >
          <i className="bi bi-camera"></i>
        </button>
      )}
    </div>
  );


  const sharedPosts = [/* Dữ liệu bài viết được chia sẻ */];

  const posts = [
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Trong Profile.jsx
const renderContent = () => {
  switch (activeTab) {
    case 'posts':
      return <PostList/>;
    case 'shared':
      return <SharedList />;
    default:
      return <PostList/>;
  }
};


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="container mt-3">
          {renderAvatarModal()}
          {renderReportModal()}
          <header className="profile-header">
  <div className="container py-4">
    <div className="row g-4">
      {/* Profile Image Section */}
      <div className="col-12 col-md-4 col-lg-3">
        <div className="position-relative text-center">
          <img
            src={getAvatar()}
            alt="Profile"
            className="rounded-circle img-thumbnail"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              margin: '0 auto'
            }}
          />
          {isCurrentUser && (
            <button
              className="btn btn-primary btn-sm position-absolute bottom-0 end-50 translate-middle-x rounded-circle"
              style={{ width: '35px', height: '35px' }}
              onClick={() => setIsAvatarModalOpen(true)}
              title="Đổi ảnh đại diện"
            >
              <i className="bi bi-camera"></i>
            </button>
          )}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="col-12 col-md-8 col-lg-9">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div className="w-50">
            <h3 className="mb-2">{getFullName()}</h3>
            
            {/* Stats Row */}
            <div className="d-flex align-items-center gap-4 text-muted mb-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-file-post fs-5 me-2"></i>
                <span>{posts.length} bài viết</span>
              </div>
              <button 
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-muted"
                onClick={handleViewFriends}
              >
                <i className="bi bi-people fs-5 me-2"></i>
                <span>{friendsList.length} bạn bè</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 w-100 w-md-auto justify-content-center justify-content-md-end">
            {isCurrentUser ? (
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={handleEditProfile}
              >
                <i className="bi bi-pencil me-2"></i>
                <span className="d-none d-sm-inline">Chỉnh sửa</span>
              </button>
            ) : (
              <>
                {renderFriendshipButton()}
                <button 
                  className="btn btn-primary rounded-pill px-4 me-2"
                >
                  <i className="bi bi-chat me-2"></i>
                  <span className="d-none d-sm-inline">Nhắn tin</span>
                </button>
                
                {/* Report Button */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary rounded-pill px-3"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Tùy chọn khác"
                  >
                    <i className="bi bi-three-dots"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={() => setIsReportModalOpen(true)}
                      >
                        <i className="bi bi-flag me-2"></i>
                        Báo cáo người dùng
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="mt-4">
  <p className="lead mb-3">{getUserDesc()}</p>
  
  <div className="d-flex flex-column gap-3">
    {!userData.isRelationshipHidden && (
      <div>
        <div className="d-flex align-items-center">
          <i className="bi bi-heart-fill text-danger me-3" style={{fontSize: '1.2rem'}}></i>
          <span>{getRelationshipStatus()}</span>
        </div>
      </div>
    )}
    
    {!userData.isSchoolHidden && (
      <div>
        <div className="d-flex align-items-center">
          <i className="bi bi-building text-primary me-3" style={{fontSize: '1.2rem'}}></i>
          <span>Đang học tại {getSchool()}</span>
        </div>
      </div>
    )}

    <div>
      <div className="d-flex align-items-center">
        <i className="bi bi-geo-alt-fill text-success me-3" style={{fontSize: '1.2rem'}}></i>
        <span>{getAddress()}</span>
      </div>
    </div>

    {!userData.isDoBHidden && (
      <div>
        <div className="d-flex align-items-center">
          <i className="bi bi-calendar2-event text-info me-3" style={{fontSize: '1.2rem'}}></i>
          <span>{formatDateOfBirth(userData.userDateOfBirth)}</span>
        </div>
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  </div>
</header>

{/* Tab Navigation */}
<div className="container">
  <ul className="nav nav-tabs nav-fill mt-2 mb-2 border-bottom-0 justify-content-center">
    <li className="nav-item" style={{maxWidth: '200px'}} role="presentation">
      <button
        className={`nav-link position-relative p-2 fs-6 ${
          activeTab === 'posts' ? 'active text-primary' : 'text-muted'
        }`}
        onClick={() => handleTabChange('posts')}
      >
        <div className="d-flex align-items-center justify-content-center gap-1">
          <i className="bi bi-grid fs-5 me-1"></i>
          <span>Bài viết</span>
        </div>
        {activeTab === 'posts' && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x bg-primary" 
               style={{ width: '70%', height: '2px' }} />
        )}
      </button>
    </li>

    <li className="nav-item" style={{maxWidth: '200px'}} role="presentation">
      <button
        className={`nav-link position-relative p-2 fs-6 ${
          activeTab === 'shared' ? 'active text-primary' : 'text-muted'
        }`}
        onClick={() => handleTabChange('shared')}
      >
        <div className="d-flex align-items-center justify-content-center gap-1">
          <i className="bi bi-share fs-5 me-1"></i>
          <span>Đã chia sẻ</span>
        </div>
        {activeTab === 'shared' && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x bg-primary" 
               style={{ width: '70%', height: '2px' }} />
        )}
      </button>
    </li>
  </ul>

  {/* Nội dung tab */}
  <div className="tab-content pt-3">
    {renderContent()}
  </div>
</div>
        </div>
      </div>

      <FriendsListModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        friends={friendsList}
        loadingFriends={loadingFriends}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        style={{
          content: {
            height: '90vh',
            border: '2px solid #C0FFD1',
            borderRadius: '15px'
          }
        }}
      >
        <div className="p-4 d-flex flex-column h-100">
          <h4 className="text-center mb-4" style={{ color: '#2d3436', fontWeight: '600' }}>
            <i className="bi bi-pencil-square me-2" style={{ color: 'rgb(16, 155, 53)' }}></i>
            Chỉnh sửa thông tin cá nhân
          </h4>

          {updateError && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {updateError}
            </div>
          )}

          <form
            onSubmit={handleUpdateProfile}
            className="flex-grow-1 d-flex flex-column overflow-hidden"
          >
            <div
              className="flex-grow-1 overflow-auto pe-3"
              style={{ maxHeight: 'calc(100vh - 240px)' }}
            >
              <div className="row g-4">
                {/* Section 1 */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm p-3" style={{ border: '2px solid rgb(16, 155, 53)' }}>
                    <h5 className="mb-3" style={{ color: 'rgb(16, 155, 53)' }}>
                      <i className="bi bi-person-badge me-2"></i>
                      Thông tin cơ bản
                    </h5>
                    {/* ... giữ nguyên các phần input ... */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            placeholder="Họ"
                            value={userData.userLastName}
                            onChange={(e) => setUserData({ ...userData, userLastName: e.target.value })}
                          />
                          <label htmlFor="lastName" className="text-muted">
                            <i className="bi bi-person me-2"></i>
                            Họ
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder="Tên"
                            value={userData.userFirstName}
                            onChange={(e) => setUserData({ ...userData, userFirstName: e.target.value })}
                          />
                          <label htmlFor="firstName" className="text-muted">
                            <i className="bi bi-person me-2"></i>
                            Tên
                          </label>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-floating">
                          <textarea
                            className="form-control"
                            placeholder="Mô tả bản thân"
                            id="bio"
                            style={{ height: '100px' }}
                            value={userData.userDesc}
                            onChange={(e) => setUserData({ ...userData, userDesc: e.target.value })}
                          />
                          <label htmlFor="bio" className="text-muted">
                            <i className="bi bi-pencil me-2"></i>
                            Mô tả bản thân
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm p-3" style={{ border: '2px solid #C0FFD1' }}>
                    <h5 className="mb-3" style={{ color: 'rgb(16, 155, 53)' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      Thông tin cá nhân
                    </h5>
                    {/* ... giữ nguyên các phần input ... */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="date"
                            className="form-control"
                            id="dob"
                            value={userData.userDateOfBirth?.split('T')[0]}
                            onChange={(e) => setUserData({ ...userData, userDateOfBirth: e.target.value })}
                          />
                          <label htmlFor="dob" className="text-muted">
                            <i className="bi bi-calendar3 me-2"></i>
                            Ngày sinh
                          </label>
                        </div>
                        <div className="form-check mt-2 ms-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="hideDob"
                            checked={userData.isDoBHidden}
                            onChange={(e) => setUserData({ ...userData, isDoBHidden: e.target.checked })}
                          />
                          <label htmlFor="hideDob" className="form-check-label text-muted">
                            Ẩn ngày sinh
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <select
                            className="form-select"
                            id="gender"
                            value={userData.userGender}
                            onChange={(e) => setUserData({ ...userData, userGender: e.target.value })}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                          </select>
                          <label htmlFor="gender" className="text-muted">
                            <i className="bi bi-gender-ambiguous me-2"></i>
                            Giới tính
                          </label>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            placeholder="Địa chỉ"
                            value={userData.userAddress}
                            onChange={(e) => setUserData({ ...userData, userAddress: e.target.value })}
                          />
                          <label htmlFor="address" className="text-muted">
                            <i className="bi bi-geo-alt me-2"></i>
                            Địa chỉ
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm p-3" style={{ border: '2px solid #C0FFD1' }}>
                    <h5 className="mb-3" style={{ color: 'rgb(16, 155, 53)' }}>
                      <i className="bi bi-book me-2"></i>
                      Học vấn & Mối quan hệ
                    </h5>
                    {/* ... giữ nguyên các phần input ... */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="school"
                            placeholder="Trường học"
                            value={userData.userSchool}
                            onChange={(e) => setUserData({ ...userData, userSchool: e.target.value })}
                          />
                          <label htmlFor="school" className="text-muted">
                            <i className="bi bi-building me-2"></i>
                            Trường học
                          </label>
                        </div>
                        <div className="form-check mt-2 ms-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="hideSchool"
                            checked={userData.isSchoolHidden}
                            onChange={(e) => setUserData({ ...userData, isSchoolHidden: e.target.checked })}
                          />
                          <label htmlFor="hideSchool" className="form-check-label text-muted">
                            Ẩn trường học
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <select
                            className="form-select"
                            id="relationship"
                            value={userData.userRelationshipStatus}
                            onChange={(e) => setUserData({ ...userData, userRelationshipStatus: e.target.value })}
                          >
                            <option value="">Chọn tình trạng</option>
                            <option value="Single">Độc thân</option>
                            <option value="In a relationship">Hẹn hò</option>
                            <option value="Married">Đã kết hôn</option>
                          </select>
                          <label htmlFor="relationship" className="text-muted">
                            <i className="bi bi-heart me-2"></i>
                            Tình trạng quan hệ
                          </label>
                        </div>
                        <div className="form-check mt-2 ms-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="hideRelationship"
                            checked={userData.isRelationshipHidden}
                            onChange={(e) => setUserData({ ...userData, isRelationshipHidden: e.target.checked })}
                          />
                          <label htmlFor="hideRelationship" className="form-check-label text-muted">
                            Ẩn tình trạng
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần nút bấm */}
            <div
              className="pt-4 border-top sticky-bottom bg-white"
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10
              }}
            >
              <div className="d-flex justify-content-end gap-3">
                <button
                  type="button"
                  className="btn  btn-outline-secondary rounded-pill px-4"
                  style={{ borderColor: '#C0FFD1', color: '#2d3436' }}
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn rounded-pill px-4"
                  style={{
                    backgroundColor: '#C0FFD1',
                    color: '#2d3436',
                    border: '2px solid #C0FFD1'
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-2"></i>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default Profile