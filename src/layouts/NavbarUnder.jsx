import React from 'react';
import CreatePostModal from '../components/CreateNewPost';
import { useState } from 'react';

const NavbarUnder = () => {
    const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  
 const [comments, setComments] = useState([
    {
      id: 1,
      username: "user1",
      comment: "Bài viết này rất hay!",
      timestamp: "2025-03-12T10:00:00Z",
      replies: [
        {
          id: 2,
          username: "user2",
          comment: "Cảm ơn bạn đã chia sẻ thông tin!",
          timestamp: "2025-03-12T10:05:00Z",
          repliedToId: 1,
          replies: [],
        },
        {
          id: 4,
          username: "user4",
          comment: "Bài viết rất hữu ích!",
          timestamp: "2025-03-12T10:15:00Z",
          repliedToId: 2,
          replies: [],
        },
        {
            id: 5,
            username: "user4",
            comment: "Bài viết rất hữu ích!",
            timestamp: "2025-03-12T10:15:00Z",
            repliedToId: 2,
            replies: [],
          },
          {
            id: 6,
            username: "user4",
            comment: "Bài viết rất hữu ích!",
            timestamp: "2025-03-12T10:15:00Z",
            repliedToId: 2,
            replies: [],
          },
          {
            id: 7,
            username: "user4",
            comment: "Bài viết rất hữu ích!",
            timestamp: "2025-03-12T10:15:00Z",
            repliedToId: 2,
            replies: [],
          },
          {
            id: 8,
            username: "user4",
            comment: "Bài viết rất hữu ích!",
            timestamp: "2025-03-12T10:15:00Z",
            repliedToId: 2,
            replies: [],
          },
      ],
    },
  ]);

  
  return (
    <div>
    <div>
      <nav className="navbar navbar-expand bg-white py-2 shadow-sm">
        <div className="container-fluid">
          <ul className="navbar-nav mx-auto d-flex justify-content-between w-100">
            <li className="nav-item px-2 py-1 w-20 text-center">
              <a className="nav-link text-dark" href="/foryou" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Trang chủ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-house text-success" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
                </svg>
              </a>
            </li>
            <li className="nav-item px-2 py-1 w-20 text-center">
              <a className="nav-link text-dark" href="/search" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tìm kiếm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search text-success" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </a>
            </li>
            
            <li className="nav-item px-2 py-1 w-20 text-center">
              <a className="nav-link text-dark" href="/message" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tin nhắn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-text text-success" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                  <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
                </svg>
              </a>
            </li>
            <li className="nav-item px-2 py-1 w-20 text-center">
              <a className="nav-link text-success" href="/group" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Nhóm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
            </svg>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
    </div>


    <div id="modal-container">
      <CreatePostModal showModal={showModal} handleClose={handleClose} handleBackdropClick={handleBackdropClick} />
    </div>
  </div>
    
  );
};

export default NavbarUnder;
