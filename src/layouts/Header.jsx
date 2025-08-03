import React from 'react';
import { NavLink } from 'react-router-dom';
import { GetUserById } from '../service/UserService';
import Cookie from 'js-cookie';
import { useState, useEffect } from 'react';

const Header = () => {

  const [user, setUser] = useState(null);
  const userID = Cookie.get('c_user')

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


  return (
    <header className="container-fluid py-3">
      <style>
        {`
          .nav-link.active {
            font-weight: bold;
            color: #007bff; /* Màu sắc khi trang được chọn */
          }
        `}
      </style>
      <div className="row align-items-center">
        {/* Phần đầu: Thanh tìm kiếm */}
        <div className="col-2">
          
        </div>

        {/* Phần giữa: Các item */}
        <div className="col-8 text-center">
          <ul className="nav justify-content-center">
            <li className="nav-item active">
              <NavLink 
                className="nav-link text-success" 
                to="/foryou" 
                activeClassName="active">
                Dành cho bạn
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className="nav-link text-success" 
                to="/following" 
                activeClassName="active">
                Theo dõi
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className="nav-link text-success" 
                to="/liked" 
                activeClassName="active">
                Đã thích
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className="nav-link text-success" 
                to="/shared" 
                activeClassName="active">
                Đã chia sẻ
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Phần cuối: Avatar */}
        <div className="col-2 text-end">
          <NavLink 
            to={`/profile/${userID}`} 
            className="d-flex align-items-center justify-content-end text-decoration-none"
          >
            {user && (
              <>
                <span className="text-success me-2">{user.userLastName+" "+ user.userFirstName}</span>
                <img
                  src={user.userImageAvatar || 'https://res.cloudinary.com/dc0b0ffa8/image/upload/v1742827779/default-avatar-icon-of-social-media-user-vector_boxybc.jpg'}
                  alt="Avatar"
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              </>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
