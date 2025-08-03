import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  FaChartBar,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaCog,
  FaChevronLeft,
  FaSignOutAlt,
  FaTags,
  FaComments
} from 'react-icons/fa';
import { FiAlertTriangle } from "react-icons/fi";
import { PiUserList } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BsPostcard } from "react-icons/bs";


import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/reports', name: 'Reports', icon: <FiAlertTriangle /> },
    { path: '/admin/users', name: 'Users', icon: <PiUserList /> },
    { path: '/admin/groups', name: 'Groups', icon: <HiOutlineUserGroup /> },
    { path: '/admin/posts', name: 'Posts', icon: <BsPostcard /> },
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img 
          src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153743/LOgoDon-Photoroom_c3j3qa.png" 
          alt="Logo" 
          className={`sidebar-logo ${isCollapsed? 'visible' : 'hidden'}`} 
            style={{ width: '100%', height: '50px' }}
        />
        <img 
          src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153738/New_Template-Photoroom_yrdk97.png" 
          alt="Logo" 
          className={`sidebar-logo full-width ${isCollapsed? 'hidden' : 'visible'}`} 
            style={{ width: '80%', height: '100px' }}
        />
      </div>

      <Nav className="flex-column sidebar-nav">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="link-text">{item.name}</span>
          </Nav.Link>
        ))}
      </Nav>

      <div className="sidebar-footer">
        <Nav.Link as={Link} to="/" className="sidebar-link">
          <span className="icon"><FaSignOutAlt /></span>
          <span className="link-text">Logout</span>
        </Nav.Link>
      </div>

      <style jsx>{`
        .admin-sidebar {
          width: 250px;
          position: fixed;
          height: 100%;
          transition: all 0.3s ease;
        }

        .admin-sidebar.collapsed {
          width: 70px;
        }

        /* Thêm media queries cho responsive */
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 250px;
            transform: translateX(-100%);
          }

          .admin-sidebar.collapsed {
            transform: translateX(0);
            width: 70px;
          }
        }

        .sidebar-logo {
          max-width: 100%;
          transition: all 0.3s ease;
          height: 50px; /* Điều chỉnh chiều cao phù hợp */
        }

        .sidebar-logo.hidden {
          display: none;
        }

        .sidebar-logo.visible {
          display: block;
        }

        .sidebar-logo.full-width {
          width: 100%;
          object-fit: cover;
          object-position: center;
        }

        .sidebar-header {
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;