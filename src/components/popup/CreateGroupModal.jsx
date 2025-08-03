import React, { useState } from 'react';
import groupService from '../../service/GroupService';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'PUBLIC'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await groupService.createGroup(formData);
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <h4 className="mb-4">Tạo nhóm mới</h4>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tên nhóm</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Quyền riêng tư</label>
          <select
            className="form-select"
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
          >
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn w-100"
          style={{ backgroundColor: '#C0FFD1', color: '#2c5e39' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Đang tạo...
            </>
          ) : (
            'Tạo nhóm'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateGroupModal;