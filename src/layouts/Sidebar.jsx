import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import CreatePostModal from '../components/CreateNewPost';
import { getCountUnreadNotifications } from '../services/NotificationService';

import NotificationPanel from '../components/popup/NotificationPanel';
import Cookie from 'js-cookie';

const Sidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getCountUnreadNotifications();
        setUnreadCount(Number(response.data.unreadCount)); // Đảm bảo convert sang number
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    
    // Set up interval để poll dữ liệu mới
    const interval = setInterval(fetchUnreadCount, 100000000000); // Poll mỗi 10 giây
    
    return () => clearInterval(interval); // Cleanup interval
  }, []);

  const handleNotificationClick = () => {
    setShowNotification(!showNotification); // Toggle notifications
  };
  const userID = Cookie.get('c_user'); // Lấy userId từ localStorage
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleCloseNotification = () => setShowNotification(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div>
      <div className="vh-100 d-flex flex-column align-items-center" style={{ width: '100px' }}>
        {/* Logo at the top */}
        <div className="logo mb-4 mt-2">
          <img src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153743/LOgoDon-Photoroom_c3j3qa.png" alt="Logo" style={{ width: '60px', height: 'auto' }} />
        </div>

        {/* Sidebar links */}
        <ul className="nav flex-column text-center flex-grow-1 d-flex justify-content-center p-4">
          <li className="nav-item mb-3 ps-2 pe-2 bg-light rounded">
            <a className="nav-link text-dark" href="/foryou" data-bs-toggle="tooltip" data-bs-placement="right" title="Trang chủ">
              {/* Home icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-house text-success" viewBox="0 0 16 16">
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
              </svg>
            </a>
          </li>
          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-dark position-relative" href="#" data-bs-toggle="tooltip" data-bs-placement="right" title="Thông báo" onClick={handleNotificationClick}>
              {/* Notification icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-bell text-success" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
              </svg>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                      style={{ fontSize: '0.6rem', marginLeft: '-8px' }}>
                  {unreadCount}
                  <span className="visually-hidden">thông báo chưa đọc</span>
                </span>
              )}
            </a>
          </li>

          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-dark" href="/message" data-bs-toggle="tooltip" data-bs-placement="right" title="Tin nhắn">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-chat-text text-success" viewBox="0 0 16 16">
                <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
              </svg>
            </a>
          </li>
          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-dark" href="#" data-bs-toggle="tooltip" data-bs-placement="right" title="Tạo bài viết" onClick={handleShow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-plus-square text-success" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
              </svg>
            </a>
          </li>
          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-dark" href="/search" data-bs-toggle="tooltip" data-bs-placement="right" title="Tìm kiếm">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-search text-success" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </a>
          </li>
          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-dark" href={`/profile/${userID}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Trang cá nhân">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-square text-success" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
              </svg>
            </a>
          </li>

          <li className="nav-item mb-3 ps-2 pe-2">
            <a className="nav-link text-success fs-4" href="/group" data-bs-toggle="tooltip" data-bs-placement="right" title="Nhóm">
              <FontAwesomeIcon icon={faPeopleRoof} />
            </a>
          </li>
        </ul>

        {/* Footer at the bottom */}
        <a href="/login">
          <div className="footer mt-auto mb-3" data-bs-toggle="tooltip" data-bs-placement="right" title="Đăng xuất">
            {/* Logout icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-box-arrow-left text-success" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
              <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
            </svg>
          </div>
        </a>
      </div>

      {/* Sử dụng component NotificationPanel thay cho notification-panel tự tạo */}
      

      {/* Đảm bảo CreatePostModal được render bên ngoài mọi container khác */}
      <div id="modal-container">
      <NotificationPanel isOpen={showNotification} onClose={handleCloseNotification} />
        <CreatePostModal showModal={showModal} handleClose={handleClose} handleBackdropClick={handleBackdropClick} />
      </div>
    </div>
  );
};

export default Sidebar;