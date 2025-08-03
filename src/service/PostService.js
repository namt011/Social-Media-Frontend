import axiosInstance from "./axiosInstance";

const REST_API_URL = "/api/posts";

export const GetPostById = async (postID) => {
  return await axiosInstance.get(`${REST_API_URL}/${postID}`);
};

export const GetPostByUserId = async (userID, page = 0, size = 5) => {
  return await axiosInstance.get(`${REST_API_URL}/users/${userID}/posts`, {
    params: {
      page,
      size,
      sort: 'desc'
    }
  });
};

export const GetUserSharedPosts = async (userId, page = 0, size = 10) => {
  return await axiosInstance.get(`${REST_API_URL}/users/${userId}/shared-posts`, {
    params: {
      page,
      size
    }
  });
};

export const updatePost = async (postId, post) => {
  return await axiosInstance.put(`${REST_API_URL}/${postId}`, post);
}

export const getLikedPosts = async (page) => {
  return await axiosInstance.get(`${REST_API_URL}/liked?page=${page}&size=10`, {
  });
};

export const getFriendsPosts = async (page) => {
  return await axiosInstance.get(`${REST_API_URL}/friends?page=${page}&size=10`, {
  });
};

export const getSharedPosts = async (page) => {
  return await axiosInstance.get(`${REST_API_URL}/shared?page=${page}&size=10`, {
  });
};

export const CreatePost = async (post) => {
  return await axiosInstance.post(`${REST_API_URL}/create`, post);
};

export const loadMorePosts = async (page,userID) => {
  return await axiosInstance.get(`${REST_API_URL}?page=${page}&limit=6&userID=${userID}`);
};

export const DeletePost = async (postID) => {
  return await axiosInstance.delete(`${REST_API_URL}/${postID}`);
};


const REST_API_URL_REACTION = "/api/reacts";
export const CreateReaction = async (reaction) => {
  return await axiosInstance.post(`${REST_API_URL_REACTION}/create`, reaction);
};

export const DeleteReaction = async (reaction) => {
  return await axiosInstance.delete(`${REST_API_URL_REACTION}`, { data: reaction });
};

export const CheckReaction = async (reaction) => {
  return await axiosInstance.post(`${REST_API_URL_REACTION}/like-status`, reaction);
};

const REST_API_URL_COMMENT = "/api/comments";

export const CreateComment = async (comment) => {
  return await axiosInstance.post(`${REST_API_URL_COMMENT}`, comment);
};

export const GetCommentByPostId = async (postID) => {
  return await axiosInstance.get(`${REST_API_URL_COMMENT}/posts/${postID}/comments`);
};

export const GetCommentByCommentId = async (rootCommentID) => {
  return await axiosInstance.get(`${REST_API_URL_COMMENT}/${rootCommentID}/full-context`);
};