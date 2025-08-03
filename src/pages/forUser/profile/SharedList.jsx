import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GetUserSharedPosts } from '../../../service/PostService';
import PostLists from '../../../components/post/PostList';

const SharedList = () => {
  const { userID } = useParams(); // Lấy userID từ URL params
  const [sharedPosts, setSharedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Fetch shared posts khi component mount hoặc page thay đổi
  useEffect(() => {
    const fetchSharedPosts = async () => {
      try {
        setIsLoading(true);
        const response = await GetUserSharedPosts(userID, page);
        
        const newPosts = response.data.content;
        setSharedPosts(prev => page === 0 ? newPosts : [...prev, ...newPosts]);
        setHasMore(!response.data.last); // Sửa lại truy cập last
        
      } catch (error) {
        console.error('Error fetching shared posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedPosts();
  }, [userID, page]);

  // Xử lý load more khi scroll
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="shared-posts-container">
      <PostLists
        posts={sharedPosts}
        setPosts={setSharedPosts}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        showCreatePost={false}
      />

      {isLoading && (
        <div className="text-center my-3">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!hasMore && sharedPosts.length > 0 && (
        <p className="text-center text-muted mt-3">
          Không còn bài viết nào để hiển thị
        </p>
      )}

      {!isLoading && sharedPosts.length === 0 && (
        <div className="text-center mt-4">
          <i className="bi bi-share text-muted" style={{ fontSize: '2rem' }}></i>
          <p className="text-muted mt-2">Chưa có bài viết nào được chia sẻ</p>
        </div>
      )}
    </div>
  );
};



export default SharedList;
