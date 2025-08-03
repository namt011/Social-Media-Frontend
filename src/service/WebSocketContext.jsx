// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Cookies from 'js-cookie';
import axiosInstance from './axiosInstance';

// Create context
const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const userId = Cookies.get('c_user');
  
  // Collection of message handlers
  const messageHandlersRef = useRef({
    messages: [],
    typing: []
  });

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (connecting || (stompClientRef.current && stompClientRef.current.connected)) {
      return;
    }

    setConnecting(true);
    
    // Clean up any existing connection
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (e) {
        console.warn('Error deactivating STOMP client:', e);
      }
    }

    const accessToken = Cookies.get('accessToken');
    if (!accessToken || !userId) {
      console.error('No access token or user ID available');
      setConnecting(false);
      return;
    }

    const socket = new SockJS(`${axiosInstance.defaults.baseURL}/ws`);
    
    stompClientRef.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {}
    });

    stompClientRef.current.onConnect = (frame) => {
      console.log('WebSocket Connected');
      setConnected(true);
      setConnecting(false);
      
      // Subscribe to personal message queue
      stompClientRef.current.subscribe(`/user/${userId}/queue/messages`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          messageHandlersRef.current.messages.forEach(handler => handler(newMessage));
        } catch (error) {
          console.error('Error parsing incoming message:', error);
        }
      });
      
      // Subscribe to typing indicators
      stompClientRef.current.subscribe(`/topic/conversation/+/typing`, (message) => {
        try {
          const data = JSON.parse(message.body);
          messageHandlersRef.current.typing.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing typing update:', error);
        }
      });
    };

    stompClientRef.current.onStompError = (frame) => {
      console.error('STOMP Protocol Error:', frame);
      setConnected(false);
      setConnecting(false);
      scheduleReconnect();
    };

    stompClientRef.current.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      setConnected(false);
      setConnecting(false);
      scheduleReconnect();
    };

    stompClientRef.current.onDisconnect = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      setConnecting(false);
    };

    try {
      stompClientRef.current.activate();
    } catch (e) {
      console.error('Error activating STOMP client:', e);
      setConnected(false);
      setConnecting(false);
      scheduleReconnect();
    }
  }, [userId, connecting]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000);
  }, [connect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
        console.log('WebSocket disconnected intentionally');
      } catch (e) {
        console.warn('Error during WebSocket disconnect:', e);
      } finally {
        stompClientRef.current = null;
        setConnected(false);
      }
    }
  }, []);

  // Add message handler
  const addMessageHandler = useCallback((type, handler) => {
    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = [];
    }
    messageHandlersRef.current[type].push(handler);
    
    // Return function to remove this handler
    return () => {
      messageHandlersRef.current[type] = messageHandlersRef.current[type].filter(h => h !== handler);
    };
  }, []);

  // Send typing status
  const sendTypingStatus = useCallback((conversationId, isTyping) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        const endpoint = isTyping ? 'typing.start' : 'typing.stop';
        stompClientRef.current.publish({
          destination: `/app/${endpoint}/${conversationId}`,
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.warn('Error sending typing status:', error);
      }
    }
  }, []);

  // Subscribe to specific conversation
  const subscribeToConversation = useCallback((conversationId, onMessageReceived) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const subscription = stompClientRef.current.subscribe(
        `/topic/conversation/${conversationId}`, 
        (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessageReceived(data);
          } catch (error) {
            console.error('Error parsing conversation message:', error);
          }
        }
      );
      
      // Return unsubscribe function
      return () => {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing:', e);
        }
      };
    }
    
    return () => {}; // Return empty function if not connected
  }, []);

  // Check connection on mount and setup auto-reconnect
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    // Setup connection health check
    const checkInterval = setInterval(() => {
      if (userId && !connecting && (!stompClientRef.current || !stompClientRef.current.connected)) {
        connect();
      }
    }, 30000);
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(checkInterval);
      disconnect();
    };
  }, [userId, connect, disconnect, connecting]);

  // Value to provide through context
  const value = {
    connected,
    connecting,
    addMessageHandler,
    sendTypingStatus,
    subscribeToConversation,
    reconnect: connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;