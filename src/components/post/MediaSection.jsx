// components/MediaSection.js
import { useEffect, useRef, useState } from 'react';

const MediaSection = ({ media, isSharedPost = false }) => {
  const containerRef = useRef(null);
  const [localShouldShowScrollbar, setLocalShouldShowScrollbar] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const handleImageClick = (image) => {
    setFullScreenImage(image);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setFullScreenImage(null);
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const mediaItems = Array.from(containerRef.current.children);
        const totalMediaWidth = mediaItems.reduce((total, item) => total + item.offsetWidth, 0);

        setLocalShouldShowScrollbar(totalMediaWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [media]);

  if (media.videos.length === 0 && media.images.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '10px 0',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          msOverflowStyle: '-ms-autohiding-scrollbar'
        }}
      >
        {media.videos.map((video, index) => (
          <div key={index} style={{ flexShrink: 0 }}>
            <video
              controls
              src={video}
              muted
              style={{
                width: isSharedPost ? '350px' : '400px',
                height: isSharedPost ? '200px' : '200px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
        {media.images.map((image, index) => (
          <div key={index} style={{ flexShrink: 0 }}>
            <img
              src={image}
              alt={`Image ${index + 1}`}
              style={{
                width: isSharedPost ? '350px' : '400px',
                height: isSharedPost ? '200px' : '200px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
              onClick={() => handleImageClick(image)}
            />
          </div>
        ))}
      </div>
      {isFullScreen && (
        <div
          className="fullscreen-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeFullScreen}
        >
          <img
            src={fullScreenImage}
            alt="Full-Screen"
            style={{
              maxHeight: '90%',
              maxWidth: '90%',
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />
        </div>
      )}
    </>
  );
};

export default MediaSection;
