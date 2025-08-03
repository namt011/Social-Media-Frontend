import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const EditPostMediaUpload = forwardRef(({ onMediaChange }, ref) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length === 0) return;
    
    const newFiles = Array.from(event.target.files);
    const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== newFiles.length) {
      alert('Một số file vượt quá kích thước tối đa (10MB)');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    const previews = validFiles.map(file => ({
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      file: file
    }));
    
    setPreviewFiles(prev => [...prev, ...previews]);
    if (onMediaChange) {
      onMediaChange([...previews]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return [];
    }

    setIsUploading(true);
    const uploadedFiles = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'test_upload');
        formData.append('folder', 'social_uploads');

        const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/dc0b0ffa8/${file.type.startsWith('image/') ? 'image' : 'video'}/upload`;
        
        setProgress(Math.round((i / selectedFiles.length) * 100));
        
        const response = await axios.post(cloudinaryEndpoint, formData);
        
        uploadedFiles.push({
          url: response.data.secure_url,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        });
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
      setSelectedFiles([]);
      setPreviewFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewFiles[index].previewUrl);
    
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    if (onMediaChange) {
      onMediaChange(previewFiles.filter((_, i) => i !== index));
    }
  };

  useImperativeHandle(ref, () => ({
    handleUpload
  }));

  return (
    <div className="edit-media-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
      />
      
      <div
        className="upload-area"
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #28a745',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '15px'
        }}
      >
        <FontAwesomeIcon icon={faCloudUploadAlt} className="mb-2" />
        <p className="mb-0">Thêm ảnh hoặc video mới</p>
      </div>

      {isUploading && (
        <div className="upload-progress mb-3">
          <div className="progress">
            <div 
              className="progress-bar bg-success" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="d-flex align-items-center mt-2">
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            <small>Đang tải lên... ({progress}%)</small>
          </div>
        </div>
      )}

      {previewFiles.length > 0 && (
        <div className="media-previews">
          <div className="row g-2">
            {previewFiles.map((file, index) => (
              <div key={index} className="col-4 col-md-3">
                <div className="preview-item position-relative">
                  {file.type === 'image' ? (
                    <img 
                      src={file.previewUrl} 
                      alt="" 
                      className="img-fluid rounded"
                    />
                  ) : (
                    <video className="img-fluid rounded">
                      <source src={file.previewUrl} type="video/mp4" />
                    </video>
                  )}
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={() => removeFile(index)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default EditPostMediaUpload;