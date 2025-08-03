import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faCheckCircle, faExclamationTriangle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const CloudinaryUpload = forwardRef(({ onFileUpload, showPreview = true, maxFiles = 10, onRemoveFile, initialFiles = [] }, ref) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length === 0) return;
    
    const newFiles = Array.from(event.target.files);
    
    // Check file size (limit to 10MB per file)
    const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Một số file vượt quá kích thước tối đa (10MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
      setSelectedFiles(validFiles);
      if (onFileUpload) {
        onFileUpload(validFiles); // Call the callback with selected files
      }
      
      // Create preview URLs for valid files
      const previews = validFiles.map(file => ({
        previewUrl: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        file: file
      }));
      
      setPreviewFiles(prev => [...prev, ...previews]);
    } else {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      if (onFileUpload) {
        onFileUpload([...selectedFiles, ...newFiles]); // Call the callback with all files
      }
      
      // Create preview URLs
      const previews = newFiles.map(file => ({
        previewUrl: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        file: file
      }));
      
      setPreviewFiles(prev => [...prev, ...previews]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return [];
    }

    setIsUploading(true);
    setUploadStatus('Đang tải lên...');
    const uploadedFiles = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'test_upload');
        formData.append('folder', 'social_uploads');
        formData.append('public_id', `social_post_${Date.now()}_${i}`);

        let cloudinaryEndpoint = 'https://api.cloudinary.com/v1_1/dc0b0ffa8';
        cloudinaryEndpoint += file.type.startsWith('image/') ? '/image/upload' : '/video/upload';

        setProgress(Math.round((i / selectedFiles.length) * 100));
        
        const response = await axios.post(cloudinaryEndpoint, formData);
        const transformedUrl = response.data.secure_url.replace('/upload/', '/upload/f_auto/');
        
        uploadedFiles.push({
          url: transformedUrl,
          type: file.type,
          name: file.name,
          publicId: response.data.public_id
        });
      }

      setUploadStatus('Tải lên thành công!');
      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('Tải lên thất bại!');
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(100);
      setSelectedFiles([]);
      setPreviewFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setPreviewFiles(prev => {
      const newPreviews = [...prev];
      // Cleanup preview URL to prevent memory leaks
      URL.revokeObjectURL(newPreviews[index].previewUrl);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      previewFiles.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [previewFiles]);

  // Return the handleUpload function to be called by parent
  useImperativeHandle(ref, () => ({
    handleUpload
  }));

  return (
    <div className="cloudinary-upload-container">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        style={{ display: 'none' }}
      />
      
      {/* Upload button */}
      <div
        className="upload-area" 
        onClick={() => fileInputRef.current.click()}
        style={{
          backgroundColor: '#C0FFD1',
          border: '2px dashed #28a745',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '15px',
          transition: 'all 0.3s ease'
        }}
      >
        <FontAwesomeIcon 
          icon={faCloudUploadAlt} 
          style={{ fontSize: '2rem', color: '#218838', marginBottom: '10px' }} 
        />
        <p style={{ margin: '0', color: '#218838', fontWeight: 'bold' }}>
          Nhấp để chọn ảnh hoặc video
        </p>
        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#6c757d' }}>
          Hỗ trợ JPEG, PNG, GIF, MP4, MOV (Tối đa 10MB mỗi file)
        </p>
      </div>

      {/* Progress and status */}
      {isUploading && (
        <div className="upload-progress" style={{ marginBottom: '15px' }}>
          <div className="progress" style={{ height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex align-items-center mt-2">
            <FontAwesomeIcon icon={faSpinner} spin className="me-2 text-secondary" />
            <small className="text-secondary">{uploadStatus} ({progress}%)</small>
          </div>
        </div>
      )}

      {/* Success message */}
      {!isUploading && uploadStatus === 'Tải lên thành công!' && (
        <div className="alert alert-success d-flex align-items-center py-2" role="alert">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <small>{uploadStatus}</small>
        </div>
      )}

      {/* Error message */}
      {!isUploading && uploadStatus === 'Tải lên thất bại!' && (
        <div className="alert alert-danger d-flex align-items-center py-2" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <small>{uploadStatus}</small>
        </div>
      )}

      {/* Previews */}
      {showPreview && previewFiles.length > 0 && (
        <div className="uploaded-files mt-3">
          <div className="row g-2">
            {previewFiles.map((file, index) => (
              <div key={index} className="col-4 col-md-3 position-relative">
                <div className="file-preview" style={{ height: '120px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.previewUrl} 
                      alt={file.name || `Uploaded ${index}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : file.type.startsWith('video/') ? (
                    <video 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      preload="metadata"
                    >
                      <source src={file.previewUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      backgroundColor: '#f8f9fa', 
                      flexDirection: 'column',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '2rem' }}>📁</div>
                      <div style={{ fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                        {file.name || `File ${index+1}`}
                      </div>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-0"
                    style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} size="xs" />
                  </button>

                  {/* Play button for videos */}
                  {file.type.startsWith('video/') && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ▶️
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default CloudinaryUpload;