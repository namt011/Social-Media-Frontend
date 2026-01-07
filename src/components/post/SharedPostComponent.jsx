// components/SharedPostComponent.js
import React from 'react';
import MediaSection from './MediaSection';

const SharedPostComponent = ({ sharedPost }) => {
  if (!sharedPost) return null;

  const defaultImg = "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1743004500/social_uploads/social_post_1743004498854_0.jpg";

  return (
    <div className="mt-3 p-3" style={{ backgroundColor: '#EAFFF0', borderRadius: '10px', border: '1px solid #A4D2B9' }}>
      <div className="d-flex align-items-start mb-3">
        <img
          src={sharedPost.user.userImageAvatar || defaultImg}
          alt="Avatar"
          className="rounded-circle"
          style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
        />
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between">
            <span style={{ fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
              <a
                className="link-offset-2 link-underline link-underline-opacity-0 text-reset"
                href={`/profile/${sharedPost.user.userID}`}
              >
                {`${sharedPost.user.userLastName} ${sharedPost.user.userFirstName} `}
              </a>
            </span>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {new Date(sharedPost.postCreateAt).toLocaleTimeString()}
            </span>
          </div>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>{sharedPost.postContent}</p>
        </div>
      </div>

      <MediaSection media={sharedPost.media} isSharedPost={true} />
    </div>
  );
};

export default SharedPostComponent;
