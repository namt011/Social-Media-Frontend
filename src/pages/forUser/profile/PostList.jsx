import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PostLists from '../../../components/post/PostList';
import { GetPostByUserId } from '../../../service/PostService';

const PostList = () => {
  const { userID } = useParams();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);

  

  useEffect(() => {
    fetchPosts(0);
  }, [userID]);

  const fetchPosts = async (page) => {
    try {
      setIsLoading(true);
      const response = await GetPostByUserId(userID, page, 10);
      
      const newPosts = response.data.content;
      const isLastPage = response.data.last;

      setPosts(prevPosts => {
        const combinedPosts = page === 0 
          ? newPosts
          : [...prevPosts, ...newPosts];
        
        const uniquePosts = combinedPosts.reduce((acc, current) => {
          if (!acc.some(post => post.postID === current.postID)) {
            acc.push(current);
          }
          return acc;
        }, []);

        return uniquePosts;
      });

      setHasMore(!isLastPage);
      setCurrentPage(page + 1);
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PostLists
      posts={posts}
      setPosts={setPosts}
      showCreatePost={false}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMoreRef={loadMoreRef}
    />
  );
};

export default PostList;
