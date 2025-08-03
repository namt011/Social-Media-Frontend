import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import { Outlet } from 'react-router-dom'; // Import Outlet từ react-router-dom
import NavbarUnder from '../NavbarUnder';
import HeaderforMobile from '../HeaderforMobile';

function OnlyLeftSidebar() {
  const [showNavbar, setShowNavbar] = useState(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      touchEndY.current = e.touches[0].clientY;
    };
    
    const handleTouchEnd = () => {
      // Calculate swipe distance
      const swipeDistance = touchEndY.current - touchStartY.current;
      
      // Set threshold for swipe detection (adjust as needed)
      const threshold = 1;
      
      // Check swipe direction
      if (swipeDistance < -threshold) {
        // Swiped up - hide navbar
        setShowNavbar(false);
      } else if (swipeDistance > threshold) {
        // Swiped down - show navbar
        setShowNavbar(true);
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('touchstart', handleTouchStart);
      contentElement.addEventListener('touchmove', handleTouchMove);
      contentElement.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        contentElement.removeEventListener('touchstart', handleTouchStart);
        contentElement.removeEventListener('touchmove', handleTouchMove);
        contentElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  return (
    <>
      {/* Desktop Layout */}
      <div className="d-none d-md-flex" style={{ height: '100vh' }}>
        {/* Left Sidebar */}
        <div
          style={{
            width: '100px',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: 10000,
          }}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '100px', width: 'calc(100% - 100px)', overflow: 'hidden' }}>
          {/* Header */}

          {/* Content Area */}
          <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', paddingRight: '15px', height: 'calc(100vh - 60px)' }}>
            <Outlet /> {/* Dùng Outlet để hiển thị content được render */}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="d-block d-md-none" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="h-100 w-100 d-flex flex-column position-relative">
          {/* Header */}
          {/* Content Area */}
          <div 
            ref={contentRef}
            className="flex-grow-1 p-3 overflow-auto"
          >
            <Outlet />
          </div>
        </div>

        {/* Bottom Navbar - Separate layer that appears on swipe down */}
        <div 
          className={`w-100 bg-white shadow position-fixed bottom-0 start-0`}
          style={{ 
            height: '65px', 
            zIndex: 10000, 
            transition: 'transform 0.3s ease',
            transform: showNavbar ? 'translateY(0)' : 'translateY(100%)'
          }}
        >
          <NavbarUnder />
        </div>
      </div>
    </>
  );
}

export default OnlyLeftSidebar;
