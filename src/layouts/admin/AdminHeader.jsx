import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaBell, FaBars } from 'react-icons/fa';

const AdminHeader = ({ isSidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className={`admin-header ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <div className="d-flex align-items-center">
            <button 
              className="toggle-sidebar-btn me-3" 
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FaBars />
            </button>
          </div>

          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#notifications" className="position-relative">
                <FaBell />
                <span className="notification-badge">3</span>
              </Nav.Link>

              <NavDropdown 
                title={
                  <span>
                    <FaUser className="me-1" />
                    Admin
                  </span>
                } 
                id="admin-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/admin/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/settings">Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx>{`
        .admin-header {
          position: fixed;
          top: 0;
          right: 0;
          width: calc(100% - 250px); /* Thay đổi từ left sang width */
          height: 60px;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .admin-header.sidebar-collapsed {
          width: calc(100% - 70px); /* Thay đổi từ left sang width */
        }

        .toggle-sidebar-btn {
          background: transparent;
          border: none;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .toggle-sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          transform: translate(50%, -50%);
        }

        @media (max-width: 768px) {
          .admin-header {
            width: calc(100% - 250px);
            transition: all 0.3s ease;
          }

          .admin-header.sidebar-collapsed {
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
};

export default AdminHeader;