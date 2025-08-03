import React, { useState, useEffect, useRef } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import PostLists from '../../../components/post/PostList';
import Cookie from 'js-cookie';
import { loadMorePosts } from '../../../service/PostService';
import { GetUserById } from '../../../service/UserService';

const Newfeeds = () => {
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
      const userID = Cookie.get('c_user');
      const response = await loadMorePosts(page, userID);

      if (page === 0) {
        setPosts(response.data.content);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...response.data.content]);
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
      <PostLists
        posts={posts}
        setPosts={setPosts}
        showCreatePost={true}
        user={user}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMoreRef={loadMoreRef}
      />
    </>
  );
};

export default Newfeeds;