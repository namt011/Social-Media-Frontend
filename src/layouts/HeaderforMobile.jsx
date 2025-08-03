import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronUp, User, LogOut } from 'lucide-react';
import NotificationPanel from '../components/popup/NotificationPanel';
import Cookie from 'js-cookie';
import { GetUserById } from '../service/UserService';
import { getCountUnreadNotifications } from '../services/NotificationService';

const HeaderForMobile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dành cho bạn');
  const [user, setUser] = useState(null);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userID = Cookie.get('c_user');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await GetUserById(userID);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (userID) {
      fetchUser();
    }
  }, [userID]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getCountUnreadNotifications();
        setUnreadCount(count.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleAvatarDropdown = () => {
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
  };

  const handleLogout = () => {
    Cookie.remove('c_user');
    navigate('/login');
  };

  const handlePageSelect = (pageName) => {
    setCurrentPage(pageName);
    closeDropdown();
  };

  return (
    <>
      <header className="container-fluid py-2 shadow-sm">
        <div className="row align-items-center">
          <div className="col-3">
            <div className="logo">
              <img 
                src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153743/LOgoDon-Photoroom_c3j3qa.png" 
                alt="Logo" 
                className="img-fluid" 
                style={{ maxHeight: '32px' }}
              />
            </div>
          </div>

          <div className="col-5 text-center">
            <div className="dropdown">
              <button 
                className="btn btn-light dropdown-toggle d-flex align-items-center justify-content-between w-100" 
                type="button" 
                onClick={toggleDropdown}
              >
                <span className="me-2 text-success fw-medium">{currentPage}</span>
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu d-block position-absolute w-100 mt-1 shadow">
                  <NavLink 
                    className="dropdown-item text-success" 
                    to="/foryou" 
                    activeClassName="active"
                    onClick={() => handlePageSelect('Dành cho bạn')}
                  >
                    Dành cho bạn
                  </NavLink>
                  <NavLink 
                    className="dropdown-item text-success" 
                    to="/following" 
                    activeClassName="active"
                    onClick={() => handlePageSelect('Theo dõi')}
                  >
                    Theo dõi
                  </NavLink>
                  <NavLink 
                    className="dropdown-item text-success" 
                    to="/liked" 
                    activeClassName="active"
                    onClick={() => handlePageSelect('Đã thích')}
                  >
                    Đã thích
                  </NavLink>
                  <NavLink 
                    className="dropdown-item text-success" 
                    to="/shared" 
                    activeClassName="active"
                    onClick={() => handlePageSelect('Đã chia sẻ')}
                  >
                    Đã chia sẻ
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          <div className="col-4 d-flex justify-content-end align-items-center">
            <div 
              className="notification-icon me-3 position-relative"
              onClick={toggleNotifications}
              style={{ cursor: 'pointer' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                  <span className="visually-hidden">unread notifications</span>
                </span>
              )}
            </div>
            <div className="avatar position-relative">
              <div onClick={toggleAvatarDropdown} style={{ cursor: 'pointer' }}>
                {user && (
                  <img
                    src={user.userImageAvatar || 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1742827779/default-avatar-icon-of-social-media-user-vector_boxybc.jpg'}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                )}
              </div>
              
              {isAvatarDropdownOpen && (
                <div className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg" style={{ minWidth: '200px', zIndex: 1000 }}>
                  <NavLink 
                    to={`/profile/${userID}`} 
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-decoration-none text-dark"
                    onClick={() => setIsAvatarDropdownOpen(false)}
                  >
                    <User size={16} className="me-2" />
                    <span>Trang cá nhân</span>
                  </NavLink>
                  <div 
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-danger"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                  >
                    <LogOut size={16} className="me-2" />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={closeNotifications} 
      />
    </>
  );
};

export default HeaderForMobile;
