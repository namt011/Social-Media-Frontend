import React, { useState } from 'react';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      <AdminHeader isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
      <div className="admin-container">
        <AdminSidebar isCollapsed={isSidebarCollapsed} />
        <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Outlet />
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-container {
          display: flex;
          flex: 1;
          margin-top: 60px;
          transition: all 0.3s ease;
          position: relative; /* Thêm position relative */
        }

        .admin-main {
          flex: 1;
          padding: 20px;
          background-color: #f5f5f5;
          overflow-y: auto;
          margin-left: 250px;
          min-height: calc(100vh - 60px);
          transition: all 0.3s ease;
        }

        .admin-main.sidebar-collapsed {
          margin-left: 70px;
        }

        /* Thêm media queries cho responsive */
        @media (max-width: 768px) {
          .admin-main {
            margin-left: 0;
            width: 100%;
          }

          .admin-main.sidebar-collapsed {
            margin-left: 0;
          }

          .admin-container {
            position: relative;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;