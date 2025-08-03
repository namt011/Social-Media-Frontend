import React, { useState, useEffect } from 'react';
import Modal from '../popup/Modal';

const EditGroupForm = ({ isOpen, onClose, groupInfo, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'PUBLIC',
    rules: '',
    coverImg: ''
  });
  
  const [initialData, setInitialData] = useState({});
  const [nameError, setNameError] = useState('');
  
  // Cập nhật formData khi groupInfo thay đổi hoặc modal mở
  useEffect(() => {
    if (isOpen && groupInfo) {
      const newFormData = {
        name: groupInfo.name || '',
        description: groupInfo.description || '',
        privacy: groupInfo.privacy || 'PUBLIC',
        rules: groupInfo.rules || '',
        coverImg: groupInfo.coverImg || ''
      };
      setFormData(newFormData);
      setInitialData({...newFormData});
      setNameError('');
    }
  }, [isOpen, groupInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Kiểm tra tên nhóm không chứa ký tự đặc biệt
    if (name === 'name') {
      const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
      if (specialCharsRegex.test(value)) {
        setNameError('Tên nhóm không được chứa ký tự đặc biệt');
      } else {
        setNameError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra lỗi trước khi submit
    if (nameError) {
      return;
    }
    
    // Tạo object chỉ chứa các trường đã thay đổi
    const changedData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== initialData[key]) {
        changedData[key] = formData[key];
      } else {
        changedData[key] = null;
      }
    });
    
    await onSubmit(changedData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="mb-4">Chỉnh sửa thông tin nhóm</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên nhóm</label>
            <input
              type="text"
              className={`form-control ${nameError ? 'is-invalid' : ''}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              // Cho phép giữ nguyên định dạng văn bản
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <small className="text-muted">Cho phép sử dụng ký tự đặc biệt và định dạng văn bản</small>
          </div>

          <div className="mb-3">
            <label className="form-label">Quyền riêng tư</label>
            <select
              className="form-control"
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
            >
              <option value="PUBLIC">Công khai</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Quy tắc nhóm</label>
            <textarea
              className="form-control"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="3"
              // Cho phép giữ nguyên định dạng văn bản
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <small className="text-muted">Cho phép sử dụng ký tự đặc biệt và định dạng văn bản</small>
          </div>

          <div className="mb-3">
            <label className="form-label">Ảnh bìa (URL)</label>
            <input
              type="url"
              className="form-control"
              name="coverImg"
              value={formData.coverImg}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={nameError ? true : false}
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditGroupForm;