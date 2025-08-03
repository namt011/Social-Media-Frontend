import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  // State to manage form data and error messages
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // Validate form
  const validateForm = () => {
    const { firstName, lastName, gender, dob, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !gender || !dob || !email || !password || !confirmPassword) {
      return 'Vui lòng điền tất cả các trường.';
    }
    if (password !== confirmPassword) {
      return 'Mật khẩu không khớp.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Email không hợp lệ.';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    return null;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');  // Reset any previous errors
    setSuccessMessage(''); // Reset previous success message

    // Validate form inputs
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Prepare the data for the request
    const { firstName, lastName, gender, dob, email, password } = formData;
    const registerData = {
      userFirstName: firstName,
      userLastName: lastName,
      userDateOfBirth: new Date(dob).toISOString(), // Format date to ISO string
      userGender: gender,
      email: email,
      password: password
    };

    try {
      // Make the POST request to the register API
      const response = await axios.post('http://localhost:8080/api/auth/register', registerData);

      // Handle success response
      if (response.status === 200) {
        setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        // Optionally, redirect to login page or clear form
      }
    } catch (error) {
      // Handle error response
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
        <h2 className='text-center'>Đăng ký</h2>

        {/* Error and success message display */}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="lastName">Họ</label>
            <input 
              type="text" 
              className="form-control" 
              id="lastName" 
              placeholder="Họ của bạn" 
              value={formData.lastName}
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="firstName">Tên</label>
            <input 
              type="text" 
              className="form-control" 
              id="firstName" 
              placeholder="Tên của bạn" 
              value={formData.firstName}
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="gender">Giới tính</label>
            <select 
              className="form-control" 
              id="gender" 
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="dob">Ngày sinh</label>
            <input 
              type="date" 
              className="form-control" 
              id="dob" 
              value={formData.dob}
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              placeholder="your@email.com" 
              value={formData.email}
              onChange={handleInputChange} 
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
              value={formData.password}
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group pt-2 pb-2">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              id="confirmPassword" 
              placeholder="••••••" 
              value={formData.confirmPassword}
              onChange={handleInputChange} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary pt-2 pb-2 w-100 bg-success bg-gradient">Đăng ký</button>
        </form>

        <a href="" className='mt-2 text-center d-block'>Quên mật khẩu?</a>
        <div className="d-flex align-items-center">
          <hr className="flex-grow-1" />
          <span className="mx-3">hoặc</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="d-flex justify-content-center">
          <p>Đã có tài khoản?</p>
          <div className='p-1'></div>
          <a href="/login">Đăng nhập</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
