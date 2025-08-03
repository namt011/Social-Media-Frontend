import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';  // Import js-cookie

const Login = () => {
  // State to manage form data and response
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setErrorMessage(''); // Reset any previous errors

    // Prepare the data to send in the request
    const loginData = {
      username,
      password,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', loginData);
      
      // Handle success response
      if (response.status === 200 && response.data) {
        console.log('Login successful:', response.data);

        // Assuming the server sends back accessToken and refreshToken in the response
        const { accessToken, refreshToken, userID } = response.data;

        // Save accessToken and refreshToken in cookies (with secure options)
        Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'Strict' });
        Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('c_user', userID, { expires: 1, secure: true, sameSite: 'Strict' });

        // You can now redirect the user or handle login state
        // Example: Redirect to a dashboard or home page
        window.location.href = '/foryou';
      }
    } catch (error) {
      // Handle error response
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      } else {
        setErrorMessage('Lỗi mạng. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div id='main' className='bg-light d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
      <div className='card ps-4 pe-4 shadow bg-body-tertiary rounded border border-success-subtle' 
           style={{ width: '100%', maxWidth: '500px' }}>
        <img 
          src="https://res.cloudinary.com/dc0b0ffa8/image/upload/v1740153738/New_Template-Photoroom_yrdk97.png" 
          alt="" 
          style={{ maxWidth: '100px' }} 
          className="d-block mx-auto" 
        />
        <h2 className='text-center'>Đăng nhập</h2>

        {/* Error message display */}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              placeholder="your@email.com" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-check pt-2 pb-2">
            <input type="checkbox" className="form-check-input" id="remember" />
            <label className="form-check-label" htmlFor="remember">Nhớ tài khoản</label>
          </div>
          <button type="submit" className="btn btn-primary pt-2 pb-2 w-100 bg-success bg-gradient">Đăng nhập</button>
        </form>

        <a href="" className='mt-2 text-center d-block'>Quên mật khẩu?</a>
        <div className="d-flex align-items-center">
          <hr className="flex-grow-1" />
          <span className="mx-3">hoặc</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="d-flex justify-content-center">
          <p>Chưa có tài khoản?</p>
          <div className='p-1'></div>
          <a href="/register">Đăng ký</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
