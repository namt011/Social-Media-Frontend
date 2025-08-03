import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PhotoList = ({ photos }) => {
  return (
    <div className="container" style={{ position: 'relative', zIndex: 0 }}>
      <div className="row">
        {photos.map((photo, index) => (
          <div key={index} className="col-12 col-md-4 mb-4">
            <div className="position-relative overflow-hidden" style={{ height: '300px', borderRadius: '10px' }}>
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="img-fluid w-100 h-100"
                style={{ objectFit: 'cover', borderRadius: '10px' }}
              />
              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <span className="text-white">{photo.likes} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoList;
