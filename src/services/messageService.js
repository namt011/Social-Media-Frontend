import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axiosInstance from '../service/axiosInstance';
import Cookies from 'js-cookie';

// Global reference to stompClient
let stompClient = null;
let isConnecting = false;

const messageService = {
  // REST API Methods
  getUserConversations: async (type = 'inbox', page = 0) => {
    try {
      const response = await axiosInstance.get('/api/conversations', {
        params: {
          type: type,
          page: page,
          size: 20
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
    }
  },

  getMessages: async (conversationId, page = 0) => {
    try {
      const response = await axiosInstance.get(`/api/messages/conversation/${conversationId}`, {
        params: {
          page: page,
          size: 20
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch messages');
    }
  },

  sendMessage: async (content, conversationId) => {
    try {
      const response = await axiosInstance.post('/api/messages', {
        content: content,
        conversationId: conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axiosInstance.put(`/api/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking as read:', error.response?.data?.message || error.message);
    }
  },
  
  // WebSocket Methods
  connect: (userId, onMessageReceived, onTypingUpdate) => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting || (stompClient && stompClient.connected)) {
      return stompClient;
    }

    isConnecting = true;
    
    // Clean up any existing client
    if (stompClient) {
      try {
        stompClient.deactivate();
      } catch (e) {
        console.warn('Error deactivating existing STOMP client:', e);
      }
      stompClient = null;
    }

    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      isConnecting = false; 
      return null;
    }

    const socket = new SockJS(`${axiosInstance.defaults.baseURL}/ws`);
    
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: msg => {
        if (process.env.NODE_ENV !== 'production') {
        }
      }
    });

    // Set up handlers before activation
    stompClient.onConnect = (frame) => {
      isConnecting = false;
      
      // Use a small delay to ensure connection is fully established
      setTimeout(() => {
        if (stompClient && stompClient.connected) {
          try {
            // Subscribe to personal message queue
            stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
              try {
                const newMessage = JSON.parse(message.body);
                onMessageReceived(newMessage);
              } catch (error) {
                console.error('Error parsing incoming message:', error);
              }
            });

            // Đăng ký kênh topic cho tất cả các cuộc trò chuyện
stompClient.subscribe(`/topic/conversation/+`, (message) => {
  try {
    const newMessage = JSON.parse(message.body);
    onMessageReceived(newMessage);
  } catch (error) {
    console.error('Error parsing incoming message from topic:', error);
  }
});
            
        
          } catch (error) {
            console.error('Error setting up WebSocket subscriptions:', error);
          }
        }
      }, 500);
    };

    stompClient.onStompError = (frame) => {
      isConnecting = false;
    };

    stompClient.onWebSocketError = (error) => {
      isConnecting = false;
    };

    stompClient.onDisconnect = () => {
      isConnecting = false;
    };

    // Activate the connection
    try {
      stompClient.activate();
    } catch (e) {
      console.error('Error activating STOMP client:', e);
      isConnecting = false;
      stompClient = null;
    }

    return stompClient;
  },

  disconnect: () => {
    isConnecting = false;
    if (stompClient) {
      try {
        stompClient.deactivate();
      } catch (e) {
      } finally {
        stompClient = null;
      }
    }
  },

// Trong hàm sendTypingStatus của messageService
sendTypingStatus: (conversationId, isTyping) => {
  if (stompClient && stompClient.connected) {
    try {
      const endpoint = isTyping ? 'typing.start' : 'typing.stop';
      stompClient.publish({
        destination: `/app/${endpoint}/${conversationId}`,
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.warn('Error sending typing status:', error);
    }
  } else {
    console.warn('Cannot send typing status: WebSocket not connected');
  }
},


  isConnected: () => stompClient && stompClient.connected,

  // Helper to reconnect if connection is lost
  ensureConnection: (userId, onMessageReceived, onTypingUpdate) => {
    if (!stompClient || !stompClient.connected) {
      return messageService.connect(userId, onMessageReceived, onTypingUpdate);
    }
    return stompClient;
  }
};

export default messageService;