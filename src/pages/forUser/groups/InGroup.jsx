import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CreateGroupPostModal from '../../../components/group/CreateGroupPostModal';
import CustomScrollbar from '../../../components/CustomScrollbar';
import RenderGroupPosts from '../../../components/group/RenderGroupPosts';
import EditGroupForm from '../../../components/group/EditGroupForm';
import groupService from '../../../service/GroupService';
import groupPostService from '../../../service/GroupPostService';
import { toast } from 'react-toastify';

const InGroup = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // States for members management
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const membersPerPage = 6;

  // States for PostLists compatibility
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  // Function to close the modal
  const handleClose = () => setShowModal(false);

  // Close the modal when clicking outside the modal content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEditGroup = async (updatedData) => {
    try {
      const result = await groupService.updateGroup(groupId, updatedData);
      setGroupInfo(prevInfo => ({
        ...prevInfo,
        ...updatedData
      }));
      toast.success('Cập nhật thông tin nhóm thành công!');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin nhóm');
    }
  };

  const handlePostCreated = async () => {
    try {
      const postsData = await groupPostService.getGroupPosts(groupId);
      const transformedPosts = postsData.content.map(post => ({
        postID: post.postID,
        postContent: post.content,
        postCreateAt: post.createdAt,
        user: {
          userID: post.authorID,
          userFirstName: post.authorName.split(' ').slice(-1)[0] || '',
          userLastName: post.authorName.split(' ').slice(0, -1).join(' ') || post.authorName,
          userImageAvatar: post.authorAvatar
        },
        media: post.media || { images: [], videos: [] },
        sharedPost: post.shared_post,
        likesCount: post.likes_count || 0,
        commentCount: post.comments_count || 0,
        liked: post.liked || false,
        owner: post.owner || false,
        privacy: post.privacy || 'public'
      }));
      setPosts(transformedPosts);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  };

  // Fetch group members
  const fetchGroupMembers = async () => {
    try {
      setMembersLoading(true);
      const membersData = await groupService.getGroupMembers(groupId);
      setMembers(membersData);
      setFilteredMembers(membersData);
    } catch (err) {
      console.error('Error fetching group members:', err);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setMembersLoading(false);
    }
  };

  // Open confirm modal for member removal
  const openRemoveConfirmModal = (memberId) => {
    setMemberToRemove(memberId);
    setShowConfirmModal(true);
  };

  // Handle remove member
  const handleRemoveMember = async () => {
    try {
      await groupService.deleteMember(groupId, memberToRemove);
      toast.success('Đã xóa thành viên khỏi nhóm');
      fetchGroupMembers(); // Refresh members list
      setShowConfirmModal(false); // Close modal after successful removal
    } catch (err) {
      toast.error(err.message || 'Xóa thành viên thất bại');
    }
  };

  // Fetch group details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const data = await groupService.getGroupById(groupId);
        setIsAdmin(data.currentUserAdmin);
        setCurrentUser(data.currentUser);
        setGroupInfo({
          ...data,
          memberCount: data.memberCount,
          privacy: data.privacy,
          description: data.description,
          coverPhoto: data.coverImg || 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1746548016/Gust_Profile_CoverPhoto_Blank-21edf1e2890708d5a507204f49afc10b7dc58eb7baea100b68a1bc2c96948297_jmegrg.png',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId]);

  // Fetch group posts and transform them for PostLists
  useEffect(() => {
    const fetchGroupPosts = async () => {
      try {
        setIsLoading(true);
        const postsData = await groupPostService.getGroupPosts(groupId);
        
        const transformedPosts = postsData.content.map(post => ({
          postID: post.postID,
          postContent: post.content,
          postCreateAt: post.createdAt,
          user: {
            userID: post.authorID,
            userFirstName: post.authorName.split(' ').slice(-1)[0] || '',
            userLastName: post.authorName.split(' ').slice(0, -1).join(' ') || post.authorName,
            userImageAvatar: post.authorAvatar
          },
          media: post.media || { images: [], videos: [] },
          sharedPost: post.shared_post,
          likesCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          liked: post.likedByCurrentUser || false,
          owner: post.owner || false,
          privacy: post.privacy || 'public'
        }));
        
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching group posts:', err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (groupInfo) {
      fetchGroupPosts();
    }
  }, [groupId, groupInfo]);

  // Fetch members when members tab is active
  useEffect(() => {
    if (activeTab === 'members') {
      fetchGroupMembers();
    }
  }, [activeTab, groupId]);

  // Filter members based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
      setCurrentPage(1);
    } else {
      const filtered = members.filter(member =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, members]);

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
              &laquo;
            </button>
          </li>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <CustomScrollbar />
      
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger m-4" role="alert">
          {error}
        </div>
      ) : groupInfo && (
        <>
          {/* Group Header */}
          <div className="container-fluid p-0 mb-4">
            <div className="position-relative">
              <div style={{ height: '300px', overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
                <img 
                  src={groupInfo.coverPhoto} 
                  alt="Cover" 
                  className="w-100" 
                  style={{ objectFit: 'cover', minHeight: '300px' }}
                />
              </div>
              
              <div className="position-absolute bottom-0 start-0 p-4 bg-gradient-dark text-white w-100">
                <h1>{groupInfo.name}</h1>
                <div className="d-flex align-items-center">
                  <span className="me-3">
                    <i className="bi bi-people-fill me-1"></i> {groupInfo.memberCount.toLocaleString()} thành viên
                  </span>
                  <span className="me-3">
                    <i className="bi bi-globe me-1"></i> {groupInfo.privacy}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button 
                  className="btn btn-outline-success position-absolute top-0 end-0 m-3"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="bi bi-pencil-square"></i> Chỉnh sửa nhóm
                </button>
              )}
            </div>
          </div>

          <div className="container">
            {/* Navigation Tabs */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex">
                <button 
                  className={`btn btn-lg ${activeTab === 'posts' ? 'btn-success' : 'btn-outline-success'} me-2`}
                  onClick={() => setActiveTab('posts')}
                >
                  Bài viết
                </button>
                <button 
                  className={`btn btn-lg ${activeTab === 'about' ? 'btn-success' : 'btn-outline-success'} me-2`}
                  onClick={() => setActiveTab('about')}
                >
                  Giới thiệu
                </button>
                <button 
                  className={`btn btn-lg ${activeTab === 'members' ? 'btn-success' : 'btn-outline-success'} me-2`}
                  onClick={() => setActiveTab('members')}
                >
                  Thành viên
                </button>
                <button 
                  className={`btn btn-lg ${activeTab === 'media' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setActiveTab('media')}
                >
                  Media
                </button>
              </div>
              <div>
                <button className="btn btn-success">
                  <i className="bi bi-plus-lg me-1"></i> Mời
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="row">
              {/* Left Sidebar - Only show in posts view */}
              {activeTab === 'posts' && (
                <div className="col-md-4">
                  <div className="card mb-4" style={{ backgroundColor: '#C0FFD1' }}>
                    <div className="card-body">
                      <h5 className="card-title">Giới thiệu</h5>
                      <p>{groupInfo?.description}</p>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-people-fill me-2"></i>
                        <span>{groupInfo?.memberCount?.toLocaleString()} thành viên</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-globe me-2"></i>
                        <span>{groupInfo?.privacy}</span>
                      </div>
                      <button className="btn btn-success w-100">Xem tất cả</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className={activeTab === 'posts' ? "col-md-8" : "col-md-12"}>
                {/* Posts Tab - Using PostLists Component */}
                {activeTab === 'posts' && (
                  <div className="d-flex flex-column align-items-center">
                    {/* Group Post Creation Box */}
                    <div className="card mb-4 w-100" style={{ backgroundColor: '#C0FFD1' }}>
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                          <img
                            src={currentUser?.userImageAvatar || "https://via.placeholder.com/50"}
                            alt="Avatar"
                            className="rounded-circle"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                          />
                          <span
                            style={{ fontSize: '18px', fontWeight: '500', cursor: 'pointer', flexGrow: 1 }}
                            onClick={() => setShowModal(true)}
                          >
                            Bạn, có gì muốn chia sẻ với nhóm?
                          </span>
                          <button className="btn btn-outline-success ml-auto" onClick={() => setShowModal(true)}>
                            Đăng
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Use Component */}
                    <RenderGroupPosts 
                      posts={posts}
                      setPosts={setPosts}
                      showCreatePost={false}
                      user={currentUser}
                      isLoading={isLoading}
                      hasMore={hasMore}
                      loadMoreRef={loadMoreRef}
                    />
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="card" style={{ backgroundColor: '#C0FFD1' }}>
                    <div className="card-body">
                      <h3 className="card-title mb-4">Giới thiệu</h3>
                      
                      <div className="mb-4">
                        <h5>Mô tả</h5>
                        <p style={{ whiteSpace: 'pre-line' }}>{groupInfo.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h5>Quy tắc nhóm</h5>
                        <p style={{ whiteSpace: 'pre-line' }}>{groupInfo.rules}</p>
                      </div>
                      
                      <div>
                        <h5>Thông tin chung</h5>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-calendar-date me-2"></i>
                          <span>Ngày tạo: {new Date(groupInfo.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-people-fill me-2"></i>
                          <span>{groupInfo.memberCount.toLocaleString()} thành viên</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-globe me-2"></i>
                          <span>{groupInfo.privacy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div className="card" style={{ backgroundColor: '#C0FFD1' }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="card-title mb-0">
                          Thành viên ({filteredMembers.length}/{groupInfo?.memberCount?.toLocaleString()})
                        </h3>
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tìm thành viên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <button className="btn btn-outline-success" type="button">
                            <i className="bi bi-search"></i>
                          </button>
                        </div>
                      </div>
                      
                      {membersLoading ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-people-fill" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                          <p className="mt-3">
                            {searchTerm ? 'Không tìm thấy thành viên phù hợp' : 'Nhóm chưa có thành viên nào'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="row">
                            {currentMembers.map(member => (
                              <div key={member.groupMemberID} className="col-md-4 col-sm-6 mb-3">
                                <div className="card h-100" style={{ backgroundColor: member.role === 'ADMIN' ? '#e6ffed' : '#f8f9fa' }}>
                                  <div className="card-body">
                                    <div className="d-flex align-items-center">
                                      <img 
                                        src={member.userAvatar} 
                                        alt={member.username} 
                                        className="rounded-circle me-3" 
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                      />
                                      <div>
                                        <h6 className="mb-0">{member.username}</h6>
                                        <small className="text-muted d-block">
                                          Tham gia: {new Date(member.joinedAt).toLocaleDateString()}
                                        </small>
                                        <span className={`badge ${
                                          member.role === 'ADMIN' ? 'bg-danger' : 'bg-success'
                                        } mt-1`}>
                                          {member.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {isAdmin && member.role !== 'ADMIN' && (
                                      <div className="mt-3 d-flex justify-content-end">
                                        <button 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => openRemoveConfirmModal(member.userID)}
                                        >
                                          <i className="bi bi-person-x"></i> Xóa
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {renderPagination()}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div className="card" style={{ backgroundColor: '#C0FFD1' }}>
                    <div className="card-body">
                      <h3 className="card-title mb-4">Media</h3>
                      
                      <ul className="nav nav-tabs mb-3">
                        <li className="nav-item">
                          <a className="nav-link active" aria-current="page" href="#">Tất cả</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#">Hình ảnh</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#">Video</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#">File</a>
                        </li>
                      </ul>
                      
                      <div className="row">
                        {posts.flatMap(post => 
                          post.media.images.map((image, index) => (
                            <div key={`${post.postID}-img-${index}`} className="col-md-4 col-sm-6 mb-3">
                              <div className="card">
                                <img 
                                  src={image} 
                                  className="card-img-top" 
                                  alt="Media" 
                                  style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body" style={{ backgroundColor: '#e6ffed' }}>
                                  <p className="card-text text-truncate">{post.postContent}</p>
                                  <small className="text-muted">Đăng bởi {post.user.userLastName} {post.user.userFirstName} • {new Date(post.postCreateAt).toLocaleDateString()}</small>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        
                        {posts.flatMap(post => 
                          post.media.videos.map((video, index) => (
                            <div key={`${post.postID}-vid-${index}`} className="col-md-4 col-sm-6 mb-3">
                              <div className="card">
                                <div style={{ height: '200px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bi bi-play-circle-fill" style={{ fontSize: '48px', color: '#fff' }}></i>
                                </div>
                                <div className="card-body" style={{ backgroundColor: '#e6ffed' }}>
                                  <p className="card-text text-truncate">{post.postContent}</p>
                                  <small className="text-muted">Đăng bởi {post.user.userLastName} {post.user.userFirstName} • {new Date(post.postCreateAt).toLocaleDateString()}</small>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreateGroupPostModal
        showModal={showModal}
        handleClose={handleClose}
        handleBackdropClick={handleBackdropClick}
        groupId={groupId}
        onPostCreated={handlePostCreated}
      />

      <EditGroupForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        groupInfo={groupInfo}
        onSubmit={handleEditGroup}
      />

      {/* Confirm Remove Member Modal */}
      {showConfirmModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa thành viên</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleRemoveMember}>Xóa thành viên</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InGroup;