import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Newfeeds from './pages/forUser/newfeed/Newfeeds';
import Follower from './pages/forUser/newfeed/Follower';
import Liked from './pages/forUser/newfeed/Liked';
import Shared from './pages/forUser/newfeed/Shared';
import MainLayout from './layouts/layoutdetail/MainLayout';
import OnlyLeftSidebar from './layouts/layoutdetail/OnlyLeftSidebar';
import Message from './pages/forUser/message/Message';
import Profile from './pages/forUser/profile/Profile';
import Search from './pages/forUser/search/Search';
import GroupMain from './pages/forUser/groups/GroupMain';
import Signup from './pages/Signup';
import InGroup from './pages/forUser/groups/InGroup';
import AdminLayout from './layouts/admin/adminLayoutDetail/AdminLayout';
import Dashboard from './pages/forAdmin/dashboard/Dashboard';
import UserManagement from './pages/forAdmin/users/UserManagement';
import ReportManagement from './pages/forAdmin/reports/ReportManagement';
import GroupManagement from './pages/forAdmin/groups/GroupManagement';
import PostManagement from './pages/forAdmin/posts/PostManagement';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={1}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
        containerId="default"
      />
      <Router>
      <Routes>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="groups" element={<GroupManagement />} />
          <Route path="posts" element={<PostManagement />} />
    
        </Route>


        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Signup/>}/>

        <Route path="/" element={<MainLayout />}>
          {/* Các route con trong MainLayout */}
          <Route path="foryou" element={<Newfeeds />} />
          <Route path="following" element={<Follower />} />
          <Route path="liked" element={<Liked />} />
          <Route path="shared" element={<Shared />} />
        </Route>

        <Route path='/profile' element={<OnlyLeftSidebar />}>
          <Route path=":userID" element={<Profile />} />
          
        </Route>
        <Route path='/search' element={<OnlyLeftSidebar />}>
          <Route path="" element={<Search />} />
          
        </Route>

        <Route path='/group' element={<OnlyLeftSidebar />}>
          <Route path="" element={<GroupMain />} />
          <Route path=":groupId" element={<InGroup />} />
          
        </Route>

        <Route path="/message" element={<OnlyLeftSidebar />}>
          <Route path="" element={<Message />} />
        </Route>


      </Routes>
    </Router>
    </>
  )
}

export default App
