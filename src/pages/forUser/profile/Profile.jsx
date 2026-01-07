import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import './Profile.css';

// Services
import { GetUserById, UpdateUser } from '../../../service/UserService';
import { 
  sendFriendRequest, 
  respondToFriendRequest, 
  deleteFriendRequest, 
  getFriends, 
  checkFriendshipStatus 
} from '../../../service/FriendService';
import ReportServices, { REPORT_TYPES } from '../../../services/ReportSer';

// Components
import PostList from './PostList';
import SharedList from './SharedList';
import Modal from '../../../components/popup/Modal';
import AvatarUploader from '../../../components/AvatarUploader';
import FriendsListModal from '../../../components/popup/FriendsListModal';

// Constants
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

const FRIENDSHIP_STATUS = {
  SELF: 'SELF',
  NOT_FRIENDS: 'NOT_FRIENDS',
  FRIENDS: 'FRIENDS',
  REQUEST_SENT: 'REQUEST_SENT',
  REQUEST_RECEIVED: 'REQUEST_RECEIVED',
  DECLINED: 'DECLINED'
};

const DEFAULT_AVATAR = "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1743004500/social_uploads/social_post_1743004498854_0.jpg";
const DEFAULT_TEXT = "Chưa cập nhật";

const Profile = () => {
  const mediaContainerRef = useRef(null);
  const { userID } = useParams();

  // State management
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User data state
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
    friendCount: 0
  });

  // Friendship state
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Error states
  const [updateError, setUpdateError] = useState(null);
  const [reportError, setReportError] = useState(null);

  // Data states
  const [friendsList, setFriendsList] = useState([]);
  const [newAvatar, setNewAvatar] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Helper functions
  const getFullName = () => {
    return `${userData.userLastName || ""} ${userData.userFirstName || ""}`.trim();
  };

  const formatDateOfBirth = (dateString) => {
    if (!dateString) return DEFAULT_TEXT;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return DEFAULT_TEXT;
    }
  };

  const getDisplayValue = (value, isHidden = false) => {
    if (isHidden) return null;
    return value || DEFAULT_TEXT;
  };

  const getAvatar = () => {
    return userData.userImageAvatar || DEFAULT_AVATAR;
  };

  // API Handlers
const handleAvatarUpload = async (uploadedFiles) => {
  if (uploadedFiles.length === 0) return;

  try {
    setIsUploading(true);
    const avatarFile = uploadedFiles[0];

    const avatarUpdate = {
      userImageAvatar: avatarFile.url
    };

    // 🔍 LOG 1: Kiểm tra data trước khi gửi
    console.log("=== FRONTEND DEBUG ===");
    console.log("Avatar URL:", avatarFile.url);
    console.log("Data to send:", avatarUpdate);
    console.log("JSON stringify:", JSON.stringify(avatarUpdate));
    console.log("User ID:", userID);

    // Gửi request
    const response = await UpdateUser(avatarUpdate, userID);
    
    // 🔍 LOG 2: Kiểm tra response
    console.log("Response:", response);
    console.log("Response data:", response.data);

    // Fetch lại data
    const userResponse = await GetUserById(userID);
    console.log("Updated user data:", userResponse.data);
    
    setUserData(userResponse.data);
    setIsAvatarModalOpen(false);
    setNewAvatar(null);
    toast.success("Cập nhật ảnh đại diện thành công");
  } catch (error) {
    console.error("=== ERROR DEBUG ===");
    console.error("Error:", error);
    console.error("Error response:", error.response);
    console.error("Error data:", error.response?.data);
    toast.error("Cập nhật ảnh đại diện thất bại");
  } finally {
    setIsUploading(false);
  }
};

  const handleFriendship = async (action) => {
    try {
      switch (action) {
        case 'add':
          const response = await sendFriendRequest(userID);
          if (response.data.success) {
            setFriendshipStatus(FRIENDSHIP_STATUS.REQUEST_SENT);
            setFriendRequestId(response.data.data.id);
            toast.success("Đã gửi lời mời kết bạn");
          }
          break;
          
        case 'accept':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await respondToFriendRequest(friendRequestId, 'ACCEPTED');
          setFriendshipStatus(FRIENDSHIP_STATUS.FRIENDS);
          toast.success("Đã chấp nhận lời mời kết bạn");
          break;
          
        case 'decline':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await respondToFriendRequest(friendRequestId, 'DECLINED');
          setFriendshipStatus(FRIENDSHIP_STATUS.NOT_FRIENDS);
          setFriendRequestId(null);
          toast.success("Đã từ chối lời mời kết bạn");
          break;
          
        case 'cancel':
          if (!friendRequestId) {
            console.error('No friend request ID found');
            return;
          }
          await deleteFriendRequest(friendRequestId);
          setFriendshipStatus(FRIENDSHIP_STATUS.NOT_FRIENDS);
          setFriendRequestId(null);
          toast.success("Đã hủy yêu cầu kết bạn");
          break;
          
        default:
          console.error('Invalid action');
      }
    } catch (error) {
      console.error('Error handling friendship:', error);
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu kết bạn');
    }
  };

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

  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setIsUpdating(true);
  setUpdateError(null);

  try {
    //LOẠI BỎ userID, friendCount, userCreateAt
    const {
      userID,
      friendCount,
      userCreateAt,
      ...rest
    } = userData;

    // ✅ CHỈ GỬI FIELD CÓ TRONG UserUpdateDTO
    const updatedUser = {
      userFirstName: rest.userFirstName,
      userLastName: rest.userLastName,
      userDateOfBirth: rest.userDateOfBirth,
      isDoBHidden: rest.isDoBHidden,
      userGender: rest.userGender,
      userAddress: rest.userAddress,
      userSchool: rest.userSchool,
      isSchoolHidden: rest.isSchoolHidden,
      userRelationshipStatus: rest.userRelationshipStatus,
      isRelationshipHidden: rest.isRelationshipHidden,
      userImageAvatar: rest.userImageAvatar,
      userImageCover: rest.userImageCover,
      userDesc: rest.userDesc
    };

    await UpdateUser(updatedUser, userID);

    const response = await GetUserById(userID);
    setUserData(response.data);
    setIsEditModalOpen(false);
    toast.success("Cập nhật thông tin thành công");
  } catch (error) {
    console.error("Update failed:", error);
    setUpdateError("Cập nhật thất bại. Vui lòng thử lại sau.");
  } finally {
    setIsUpdating(false);
  }
};


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
      toast.error('Có lỗi khi tải danh sách bạn bè');
    } finally {
      setLoadingFriends(false);
    }
  };

  // Effect for checking friendship status
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!isCurrentUser && userID) {
        try {
          const response = await checkFriendshipStatus(userID);
          
          if (response.data.success) {
            const status = response.data.data.status;
            const requestId = response.data.data.requestId;
            
            setFriendRequestId(requestId);
            
            switch (status) {
              case FRIENDSHIP_STATUS.SELF:
                setIsCurrentUser(true);
                setFriendshipStatus(null);
                break;
                
              case FRIENDSHIP_STATUS.NOT_FRIENDS:
              case FRIENDSHIP_STATUS.FRIENDS:
              case FRIENDSHIP_STATUS.REQUEST_SENT:
              case FRIENDSHIP_STATUS.REQUEST_RECEIVED:
              case FRIENDSHIP_STATUS.DECLINED:
                setFriendshipStatus(status); 
                break;
                
              default:
                setFriendshipStatus(FRIENDSHIP_STATUS.NOT_FRIENDS);
                console.warn('Unknown friendship status:', status);
                break;
            }
          }
        } catch (error) {
          console.error('Error checking friendship status:', error);
          setFriendshipStatus(FRIENDSHIP_STATUS.NOT_FRIENDS);
        }
      }
    };

    checkFriendStatus();
  }, [userID, isCurrentUser]);

  // Effect for fetching user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userResponse] = await Promise.all([
          GetUserById(userID),
          getFriends(userID)
        ]);

        // Filter response data to only include known fields
        const userDataFromApi = userResponse.data;
        const filteredUserData = {
          userID: userDataFromApi.userID,
          userFirstName: userDataFromApi.userFirstName,
          userLastName: userDataFromApi.userLastName,
          userDateOfBirth: userDataFromApi.userDateOfBirth,
          userGender: userDataFromApi.userGender,
          userAddress: userDataFromApi.userAddress,
          userSchool: userDataFromApi.userSchool,
          userRelationshipStatus: userDataFromApi.userRelationshipStatus,
          userImageAvatar: userDataFromApi.userImageAvatar,
          userCreateAt: userDataFromApi.userCreateAt,
          userDesc: userDataFromApi.userDesc,
          isDoBHidden: userDataFromApi.isDoBHidden,
          isSchoolHidden: userDataFromApi.isSchoolHidden,
          isRelationshipHidden: userDataFromApi.isRelationshipHidden,
          friendCount: userDataFromApi.friendCount || 0
        };

        setUserData(filteredUserData);

        const cookieC_User = Cookies.get('c_user');
        setIsCurrentUser(cookieC_User === userID);

        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    if (userID) {
      fetchUserData();
    }
  }, [userID]);

  // Render functions
  const renderFriendshipButton = () => {
    if (isCurrentUser) return null;

    const buttonConfig = {
      [FRIENDSHIP_STATUS.FRIENDS]: {
        text: 'Hủy kết bạn',
        className: 'btn-outline-danger',
        action: 'cancel'
      },
      [FRIENDSHIP_STATUS.REQUEST_SENT]: {
        text: 'Hủy yêu cầu',
        className: 'btn-outline-secondary',
        action: 'cancel'
      },
      [FRIENDSHIP_STATUS.REQUEST_RECEIVED]: [
        {
          text: 'Chấp nhận',
          className: 'btn-primary me-2',
          action: 'accept'
        },
        {
          text: 'Từ chối',
          className: 'btn-outline-secondary',
          action: 'decline'
        }
      ],
      [FRIENDSHIP_STATUS.NOT_FRIENDS]: {
        text: 'Kết bạn',
        className: 'btn-primary me-2',
        action: 'add'
      }
    };

    const config = buttonConfig[friendshipStatus];

    if (!config) return null;

    if (Array.isArray(config)) {
      return (
        <>
          {config.map((btn, index) => (
            <button
              key={index}
              className={`btn ${btn.className}`}
              onClick={() => handleFriendship(btn.action)}
            >
              {btn.text}
            </button>
          ))}
        </>
      );
    }

    return (
      <button
        className={`btn ${config.className} me-2`}
        onClick={() => handleFriendship(config.action)}
      >
        {config.text}
      </button>
    );
  };

  const renderReportModal = () => (
    <Modal 
      isOpen={isReportModalOpen} 
      onClose={() => {
        setIsReportModalOpen(false);
        setReportReason('');
        setReportError(null);
      }}
    >
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
  
  const renderAvatarModal = () => (
<Modal
  isOpen={isAvatarModalOpen}
  onClose={() => setIsAvatarModalOpen(false)}
>
  <AvatarUploader
    userID={userID}
    currentAvatar={getAvatar()}
    UpdateUser={UpdateUser}
    GetUserById={GetUserById}
    onSuccess={(updatedUser) => setUserData(updatedUser)}
    onClose={() => setIsAvatarModalOpen(false)}
  />
</Modal>

  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostList />;
      case 'shared':
        return <SharedList />;
      default:
        return <PostList />;
    }
  };

  // Loading and Error states
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
      <div className="container mt-3">
        {renderAvatarModal()}
        {renderReportModal()}
        
        {/* Profile Header */}
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
                        <span>0 bài viết</span>
                      </div>
                      <button 
                        className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-muted"
                        onClick={handleViewFriends}
                      >
                        <i className="bi bi-people fs-5 me-2"></i>
                        <span>{userData.friendCount} bạn bè</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 w-100 w-md-auto justify-content-center justify-content-md-end">
                    {isCurrentUser ? (
                      <button
                        className="btn btn-outline-primary rounded-pill px-4"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        <span className="d-none d-sm-inline">Chỉnh sửa</span>
                      </button>
                    ) : (
                      <>
                        {renderFriendshipButton()}
                        <button className="btn btn-primary rounded-pill px-4 me-2">
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
                  <p className="lead mb-3">{getDisplayValue(userData.userDesc)}</p>
                  
                  <div className="d-flex flex-column gap-3">
                    {getDisplayValue(userData.userRelationshipStatus, userData.isRelationshipHidden) && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-heart-fill text-danger me-3" style={{fontSize: '1.2rem'}}></i>
                        <span>{getDisplayValue(userData.userRelationshipStatus)}</span>
                      </div>
                    )}
                    
                    {getDisplayValue(userData.userSchool, userData.isSchoolHidden) && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-building text-primary me-3" style={{fontSize: '1.2rem'}}></i>
                        <span>Đang học tại {getDisplayValue(userData.userSchool)}</span>
                      </div>
                    )}

                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt-fill text-success me-3" style={{fontSize: '1.2rem'}}></i>
                      <span>{getDisplayValue(userData.userAddress)}</span>
                    </div>

                    {!userData.isDoBHidden && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-calendar2-event text-info me-3" style={{fontSize: '1.2rem'}}></i>
                        <span>{formatDateOfBirth(userData.userDateOfBirth)}</span>
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
                onClick={() => setActiveTab('posts')}
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
                onClick={() => setActiveTab('shared')}
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

          {/* Tab Content */}
          <div className="tab-content pt-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FriendsListModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        friends={friendsList}
        loadingFriends={loadingFriends}
      />

      {/* Edit Profile Modal */}
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
        <EditProfileModalContent
          userData={userData}
          setUserData={setUserData}
          updateError={updateError}
          isUpdating={isUpdating}
          onUpdate={handleUpdateProfile}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </>
  );
};

// Extracted Edit Profile Modal Component for better readability
// Extracted Edit Profile Modal Component for better readability
const EditProfileModalContent = ({ 
  userData, 
  setUserData, 
  updateError, 
  isUpdating, 
  onUpdate, 
  onClose 
}) => {
  
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setUserData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const renderFormSection = (title, icon, children, borderColor = '2px solid rgb(16, 155, 53)') => (
    <div className="col-12">
      <div className="card border-0 shadow-sm p-3" style={{ border: borderColor }}>
        <h5 className="mb-3" style={{ color: 'rgb(16, 155, 53)' }}>
          <i className={`bi ${icon} me-2`}></i>
          {title}
        </h5>
        {children}
      </div>
    </div>
  );

  const renderFormField = (label, icon, id, type = 'text', value, onChange, options = []) => (
    <div className="form-floating">
      {type === 'select' ? (
        <>
          <select
            className="form-select"
            id={id}
            value={value || ''}
            onChange={(e) => onChange(id, e.target.value)}
          >
            <option value="">Chọn {label.toLowerCase()}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label htmlFor={id} className="text-muted">
            <i className={`bi ${icon} me-2`}></i>
            {label}
          </label>
        </>
      ) : type === 'textarea' ? (
        <>
          <textarea
            className="form-control"
            placeholder={label}
            id={id}
            style={{ height: '100px' }}
            value={value || ''}
            onChange={(e) => onChange(id, e.target.value)}
          />
          <label htmlFor={id} className="text-muted">
            <i className={`bi ${icon} me-2`}></i>
            {label}
          </label>
        </>
      ) : (
        <>
          <input
            type={type}
            className="form-control"
            id={id}
            placeholder={label}
            value={value || ''}
            onChange={(e) => onChange(id, e.target.value)}
          />
          <label htmlFor={id} className="text-muted">
            <i className={`bi ${icon} me-2`}></i>
            {label}
          </label>
        </>
      )}
    </div>
  );

const renderCheckbox = (id, label, checked, onChange) => (
  <div className="form-check mt-2 ms-1">
    <input
      type="checkbox"
      className="form-check-input"
      id={id}
      checked={checked || false}
      onChange={(e) => onChange(id, e.target.checked)}
    />
    <label htmlFor={id} className="form-check-label text-muted">
      {label}
    </label>
  </div>
);

  return (
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

      <form onSubmit={onUpdate} className="flex-grow-1 d-flex flex-column overflow-hidden">
        <div 
          className="flex-grow-1 overflow-auto pe-3" 
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          <div className="row g-4">
            {/* Section 1: Basic Information */}
            {renderFormSection(
              "Thông tin cơ bản",
              "bi-person-badge",
              <div className="row g-3">
                <div className="col-md-6">
                  {renderFormField(
                    "Họ",
                    "bi-person",
                    "userLastName",
                    "text",
                    userData.userLastName,
                    handleInputChange
                  )}
                </div>

                <div className="col-md-6">
                  {renderFormField(
                    "Tên",
                    "bi-person",
                    "userFirstName",
                    "text",
                    userData.userFirstName,
                    handleInputChange
                  )}
                </div>

                <div className="col-12">
                  {renderFormField(
                    "Mô tả bản thân",
                    "bi-pencil",
                    "userDesc",
                    "textarea",
                    userData.userDesc,
                    handleInputChange
                  )}
                </div>
              </div>
            )}

            {/* Section 2: Personal Information */}
            {renderFormSection(
              "Thông tin cá nhân",
              "bi-info-circle",
              <div className="row g-3">
                <div className="col-md-6">
                  {renderFormField(
                    "Ngày sinh",
                    "bi-calendar3",
                    "userDateOfBirth",
                    "date",
                    userData.userDateOfBirth?.split('T')[0],
                    handleInputChange
                  )}
                  {renderCheckbox(
                  "isDoBHidden", // Sửa từ "hideDob" thành "isDoBHidden"
                  "Ẩn ngày sinh",
                  userData.isDoBHidden,
                  handleCheckboxChange
                  )}
                </div>

                <div className="col-md-6">
                  {renderFormField(
                    "Giới tính",
                    "bi-gender-ambiguous",
                    "userGender",
                    "select",
                    userData.userGender,
                    handleInputChange,
                    [
                      { value: "Male", label: "Nam" },
                      { value: "Female", label: "Nữ" },
                      { value: "Other", label: "Khác" }
                    ]
                  )}
                </div>

                <div className="col-12">
                  {renderFormField(
                    "Địa chỉ",
                    "bi-geo-alt",
                    "userAddress",
                    "text",
                    userData.userAddress,
                    handleInputChange
                  )}
                </div>
              </div>,
              "2px solid #C0FFD1"
            )}

            {/* Section 3: Education & Relationship */}
            {renderFormSection(
              "Học vấn & Mối quan hệ",
              "bi-book",
              <div className="row g-3">
                <div className="col-md-6">
                  {renderFormField(
                    "Trường học",
                    "bi-building",
                    "userSchool",
                    "text",
                    userData.userSchool,
                    handleInputChange
                  )}
                  {renderCheckbox(
                    "isSchoolHidden",
                    "Ẩn trường học",
                    userData.isSchoolHidden,
                    handleCheckboxChange
                  )}
                </div>

                <div className="col-md-6">
                  {renderFormField(
                    "Tình trạng quan hệ",
                    "bi-heart",
                    "userRelationshipStatus",
                    "select",
                    userData.userRelationshipStatus,
                    handleInputChange,
                    [
                      { value: "Single", label: "Độc thân" },
                      { value: "In a relationship", label: "Hẹn hò" },
                      { value: "Married", label: "Đã kết hôn" }
                    ]
                  )}
                  {renderCheckbox(
                    "isRelationshipHidden",
                    "Ẩn tình trạng",
                    userData.isRelationshipHidden,
                    handleCheckboxChange
                  )}
                </div>
              </div>,
              "2px solid #C0FFD1"
            )}
          </div>
        </div>

        {/* Action Buttons */}
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
              className="btn btn-outline-secondary rounded-pill px-4"
              style={{ 
                borderColor: '#C0FFD1', 
                color: '#2d3436',
                minWidth: '120px'
              }}
              onClick={onClose}
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
                border: '2px solid #C0FFD1',
                minWidth: '140px'
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span 
                    className="spinner-border spinner-border-sm me-2" 
                    role="status"
                  ></span>
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
  );
};

export default Profile;