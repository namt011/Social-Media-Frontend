import React, { useState, useEffect, useRef } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import PostList from '../../../components/post/PostList';
import Cookie from 'js-cookie';
import { getSharedPosts, CheckReaction } from '../../../service/PostService';
import { GetUserById } from '../../../service/UserService';

const Shared = () => {
  const [user, setUser] = useState(null);
  const userID = Cookie.get('c_user');
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await GetUserById(userID);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (userID) {
      fetchUser();
    }
  }, [userID]);

  const fetchPosts = async (page) => {
    try {
      setIsLoading(true);
      const response = await getSharedPosts(page);

      const postsWithLikeStatus = await Promise.all(
        response.data.content.map(async (post) => {
          try {
            const checkResponse = await CheckReaction({
              postId: post.postID
            });
            return {
              ...post,
              isLiked: checkResponse.data.isLiked
            };
          } catch (error) {
            console.error('Error checking reaction:', error);
            return {
              ...post,
              isLiked: false
            };
          }
        })
      );

      if (page === 0) {
        setPosts(postsWithLikeStatus);
      } else {
        setPosts(prevPosts => {
          const uniquePosts = new Set([...prevPosts, ...postsWithLikeStatus].map(post => post.postID));
          return Array.from(uniquePosts).map(
            postID => [...prevPosts, ...postsWithLikeStatus].find(post => post.postID === postID)
          );
        });
      }

      setHasMore(!response.data.last);
      setCurrentPage(page + 1);
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts(currentPage);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [currentPage, hasMore, isLoading]);

  useEffect(() => {
    fetchPosts(0);
  }, []);

  return (
    <>
      <CustomScrollbar />
      <PostList 
        posts={posts}
        setPosts={setPosts}
        showCreatePost={false} // Don't show create post box in Liked view
        user={user}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMoreRef={loadMoreRef}
      />
    </>
  );
};

export default Shared;
