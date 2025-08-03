import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Badge,
  Tooltip,
  Zoom,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  Send as SendIcon, 
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ReadIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import { Forum as NoChatIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CustomScrollbar from '../../../components/CustomScrollbar';
import messageService from '../../../services/messageService';
import useAuth from '../../../hooks/useAuth';
import Cookies from 'js-cookie';

// Create a theme with the new primary color
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // A darker green for interactive elements
      light: '#E8F5E9', // Lighter green for backgrounds
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784', // Medium green
      light: '#F1F8F2',
      dark: '#388E3C',
    },
    background: {
      default: '#F8FBFA',
      paper: '#FFFFFF',
    },
    divider: '#E0E0E0',
    success: {
      main: '#4CAF50',
      light: '#E8F5E9',
    },
    error: {
      main: '#F44336',
      light: '#FFEBEE',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#E8F5E9',
            transition: 'all 0.2s ease',
          },
          '&:hover': {
            backgroundColor: '#F1F8F2',
          },
          transition: 'background-color 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const RootStyle = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  display: 'flex',
  backgroundColor: theme.palette.background.default,
  height: '95vh',
  transition: 'all 0.3s ease',
}));

const ConversationListStyle = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.breakpoints.values.md * 0.4,
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 0 10px rgba(0,0,0,0.03)',
  margin: theme.spacing(1, 0, 1, 1),
  overflow: 'hidden',
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 2, 1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '1.5px',
  },
  minHeight: '42px',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  minHeight: '42px',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  transition: 'all 0.2s ease',
}));

const ConversationBoxStyle = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 0 10px rgba(0,0,0,0.03)',
  margin: theme.spacing(1, 1, 1, 0),
  overflow: 'hidden',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.light,
  transition: 'all 0.3s ease',
}));

const MessageInputBoxStyle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
}));

const MessageListStyle = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'linear-gradient(rgba(233, 245, 233, 0.2) 1px, transparent 1px)',
  backgroundSize: '100% 20px',
  scrollBehavior: 'smooth',
  display: 'flex',
  flexDirection: 'column',
}));

const MessageBubble = styled(Box)(({ theme, isCurrentUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: isCurrentUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  backgroundColor: isCurrentUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  border: isCurrentUser ? 'none' : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
}));

const LoadingProgress = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  backgroundColor: selected ? theme.palette.primary.light : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.secondary.light,
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease',
  boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
}));

const StyledNoChat = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
}));

const StyledMessageInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: theme.palette.background.default,
    transition: 'all 0.2s ease',
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.2)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
      },
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const MessageStatus = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: theme.spacing(0.5),
  color: status === 'sent' ? theme.palette.success.main : 
         status === 'failed' ? theme.palette.error.main : 
         theme.palette.text.secondary,
  fontSize: '0.75rem',
}));

const UnreadBadge = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(1),
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > span': {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    margin: '0 2px',
    opacity: 0.7,
    animation: 'typing-animation 1s infinite ease-in-out',
    '&:nth-of-type(1)': {
      animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
  '@keyframes typing-animation': {
    '0%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-4px)',
    },
    '100%': {
      transform: 'translateY(0px)',
    },
  },
}));

const Message = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);
  const listRef = useRef(null);
  // Thêm state để theo dõi người dùng đang nhập
  const [typingUsers, setTypingUsers] = useState({});
  const [messagePageNumber, setMessagePageNumber] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [typingStatus, setTypingStatus] = useState({});
  const stompClientRef = useRef(null);
  const connectionCheckIntervalRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const [showNoMoreMessages, setShowNoMoreMessages] = useState(false);
  const c_user = Cookies.get('c_user');

  // Kiểm tra kích thước màn hình
  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Xử lý cuộn đến tin nhắn mới nhất
const scrollToBottom = useCallback(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, []);

  // Duy trì vị trí cuộn khi tải thêm tin nhắn cũ
  const maintainScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      messagesContainerRef.current.scrollTop = prevScrollTopRef.current + heightDifference;
    }
  }, []);

  // Xử lý scroll cho danh sách hội thoại
  const handleScroll = useCallback((e) => {
    if (!listRef.current.throttleTimeout) {
      listRef.current.throttleTimeout = setTimeout(() => {
        const element = e.target;
        const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

        if (isNearBottom && !loading && hasMore) {
          setPageNumber(prev => prev + 1);
        }
        listRef.current.throttleTimeout = null;
      }, 200);
    }
  }, [loading, hasMore]);

  // Load danh sách hội thoại
  const loadConversations = useCallback(async () => {
    if (!c_user) return;

    try {
      if (pageNumber === 0) setLoading(true);
      const response = await messageService.getUserConversations(activeTab, pageNumber);

      // Xử lý dữ liệu trả về để đảm bảo tương thích
      const processedConversations = response.content.map(conv => {
        // Đảm bảo các trường cần thiết tồn tại
        return {
          ...conv,
          participants: conv.participants.map(p => ({
            ...p,
            // Đảm bảo các trường cũ vẫn hoạt động nếu cần
            avatarUrl: p.userAvatar,
            username: p.userName
          }))
        };
      });

      setConversations(prev =>
        pageNumber === 0 ? processedConversations : [...prev, ...processedConversations]
      );
      setHasMore(!response.last);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [activeTab, pageNumber, c_user]);

  // Load tin nhắn khi chọn hội thoại
  const loadMessages = useCallback(async (conversationId, page = 0) => {
    try {
      setIsLoadingMoreMessages(true);
      const response = await messageService.getMessages(conversationId, page);

      return {
        messages: response.data.content.reverse(),
        hasMore: !response.last
      };
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      return { messages: [], hasMore: false };
    } finally {
      setIsLoadingMoreMessages(false);
    }
  }, []);

  // Xử lý tin nhắn mới từ WebSocket
  const handleNewMessage = useCallback((message) => {
    // Update conversation list
    setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === message.conversationId);

        if (existingIndex >= 0) {
            // Update existing conversation
            const updatedConvs = [...prev];
            
            // Đảm bảo tin nhắn có đầy đủ thông tin
            const enhancedMessage = {
                ...message,
                // Nếu tin nhắn không có thông tin người gửi, thêm từ danh sách người tham gia
                senderName: message.senderName || 
                    updatedConvs[existingIndex].participants?.find(p => 
                        p.userId?.toString() === message.senderId?.toString()
                    )?.userName || 'Unknown',
                senderAvatar: message.senderAvatar || 
                    updatedConvs[existingIndex].participants?.find(p => 
                        p.userId?.toString() === message.senderId?.toString()
                    )?.userAvatar || null
            };
            
            updatedConvs[existingIndex] = {
                ...updatedConvs[existingIndex],
                lastMessage: enhancedMessage,
                updatedAt: new Date().toISOString()
            };

            // Move conversation to top if needed
            if (existingIndex > 0) {
                const [movedConv] = updatedConvs.splice(existingIndex, 1);
                updatedConvs.unshift(movedConv);
            }

            return updatedConvs;
        }

        // If conversation not found, reload the list
        setTimeout(loadConversations, 300);
        return prev;
    });

    // Update selected chat if message belongs to it
    if (selectedChat?.id === message.conversationId) {
        setSelectedChat(prev => {
            // Check if this message is already in the list or if it's a temp message
            const isExistingMessage = prev.messages.some(msg => {
                // Check if msg.id equals message.id
                if (msg.id === message.id) return true;
                
                // Check if msg.id is a string and starts with 'temp-'
                const isTempId = typeof msg.id === 'string' && msg.id.startsWith('temp-');
                
                // Check if it's a temp message with the same content
                return isTempId && msg.content === message.content;
            });
            
            // If it's already there, just update the status (don't add it again)
            if (isExistingMessage) {
                return {
                    ...prev,
                    messages: prev.messages.map(msg => {
                        // If it's the same message ID, return the new message
                        if (msg.id === message.id) return message;
                        
                        // If it's a temp message with the same content, replace it
                        if (typeof msg.id === 'string' && 
                            msg.id.startsWith('temp-') && 
                            msg.content === message.content) {
                            return message;
                        }
                        
                        // Otherwise return the original message
                        return msg;
                    })
                };
            }
            
            // Otherwise add the new message
            return {
                ...prev,
                messages: [...(prev.messages || []), message]
            };
        });

        // Mark as read if from another user
        if (message.senderId?.toString() !== c_user) {
            messageService.markAsRead(message.id);
        }

        setTimeout(scrollToBottom, 100);
    }
}, [selectedChat, c_user, loadConversations, scrollToBottom]);

  // Xử lý trạng thái đang gõ
  // Xử lý trạng thái đang gõ
const handleTypingUpdate = useCallback((data) => {
  if (data.userId?.toString() !== c_user) {
    // Cập nhật trạng thái typing với thông tin người dùng
    setTypingUsers(prev => {
      const conversationTypers = prev[data.conversationId] || {};
      
      if (data.typing) {
        // Thêm người dùng vào danh sách đang gõ
        return {
          ...prev,
          [data.conversationId]: {
            ...conversationTypers,
            [data.userId]: {
              userName: data.userName || 'Ai đó',
              timestamp: new Date().getTime()
            }
          }
        };
      } else {
        // Xóa người dùng khỏi danh sách đang gõ
        const updatedTypers = { ...conversationTypers };
        delete updatedTypers[data.userId];
        return {
          ...prev,
          [data.conversationId]: updatedTypers
        };
      }
    });
    
    // Giữ lại cách xử lý cũ để tương thích
    setTypingStatus(prev => ({
      ...prev,
      [data.conversationId]: data.typing ? 'Đang soạn tin...' : false
    }));
  }
}, [c_user]);



  // Effect chính
  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Connect to WebSocket
    connectWebSocket();

    // Set interval to check connection
    connectionCheckIntervalRef.current = setInterval(() => {
      if (!messageService.isConnected()) {
        connectWebSocket();
      }
    }, 30000);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current);
      }
      messageService.disconnect();
    };
  }, [checkScreenSize]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cập nhật vị trí cuộn sau khi tải thêm tin nhắn cũ hoặc khi tin nhắn thay đổi
  useEffect(() => {
    if (isLoadingMoreMessages === false) {
      maintainScrollPosition();
    }
  }, [isLoadingMoreMessages, maintainScrollPosition]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    // Chỉ tự động cuộn khi tin nhắn mới được thêm vào và không phải đang tải tin nhắn cũ
    if (selectedChat?.messages?.length > 0 && !isLoadingMoreMessages) {
      // Luôn cuộn xuống khi chat mới được chọn
      if (selectedChat?.preventInitialLoad) {
        scrollToBottom();
      }
      // Kiểm tra xem người dùng có đang ở gần cuối cuộc trò chuyện không
      else if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        
        // Chỉ tự động cuộn nếu người dùng đang ở gần cuối
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    }
  }, [selectedChat?.messages, isLoadingMoreMessages, selectedChat?.preventInitialLoad, scrollToBottom]);

  // Các hàm xử lý tương tác
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setSelectedChat(null);
    setPageNumber(0);
    setHasMore(true);
    if (isMobile) setShowMobileList(true);
  }, [isMobile]);

const handleSelectMessage = useCallback(async (conversation) => {
  try {
    setMessagePageNumber(0);
    const { messages, hasMore } = await loadMessages(conversation.id, 0);

    // Đặt cờ để ngăn việc tải tin nhắn cũ khi mới chọn cuộc trò chuyện
    const preventInitialLoad = true;
    
    // Đảm bảo thông tin type được giữ lại
    setSelectedChat({
      ...conversation,
      messages,
      hasMore,
      preventInitialLoad, // Thêm cờ này vào state
      type: conversation.type // Đảm bảo type được giữ lại
    });

    if (isMobile) setShowMobileList(false);
    
    // Set a small delay to ensure DOM updates before scrolling
    setTimeout(() => {
      scrollToBottom();
      // Sau khi đã cuộn xuống dưới, xóa cờ preventInitialLoad sau một khoảng thời gian
      setTimeout(() => {
        setSelectedChat(prev => ({
          ...prev,
          preventInitialLoad: false
        }));
      }, 500);
    }, 300);
  } catch (err) {
    setError(err.message);
  }
}, [isMobile, loadMessages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const trimmedInput = messageInput.trim();
    if (!trimmedInput || !selectedChat?.id) return;

    // Create temporary message for optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
        id: tempId,
        content: trimmedInput,
        senderId: c_user,
        conversationId: selectedChat.id,
        sentAt: new Date().toISOString(),
        read: true,
        status: 'sending'
    };

    // Update UI immediately with temp message
    setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage]
    }));
    setMessageInput('');
    setTimeout(scrollToBottom, 50);

    try {
        // Check connection before sending
        if (!messageService.isConnected()) {
            await messageService.ensureConnection(c_user, handleNewMessage, handleTypingUpdate);
        }

        // Send to server
        await messageService.sendMessage(trimmedInput, selectedChat.id);
        
        // Don't update UI here - let the WebSocket handle it
        // Just mark the temporary message as sent in case there's a delay
        setSelectedChat(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
                msg.id === tempId ? {...msg, status: 'sent'} : msg
            )
        }));
    } catch (err) {
        // Mark message as failed if error
        setSelectedChat(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
                msg.id === tempId ? {...msg, status: 'failed'} : msg
            )
        }));
        setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
}, [messageInput, selectedChat, c_user, scrollToBottom, handleNewMessage]);

  // Xử lý sự kiện thay đổi input và gửi trạng thái gõ
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setMessageInput(newValue);
    
    if (selectedChat?.id) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Chỉ gửi trạng thái typing khi có nội dung
      if (newValue.trim()) {
        // Gửi trạng thái đang nhập
        messageService.sendTypingStatus(selectedChat.id, true);
        
        // Tự động hủy trạng thái typing sau một khoảng thời gian
        typingTimeoutRef.current = setTimeout(() => {
          messageService.sendTypingStatus(selectedChat.id, false);
        }, 1500); // Tăng thời gian lên 3 giây để hiển thị tốt hơn
      } else {
        // Nếu input trống, gửi trạng thái không typing
        messageService.sendTypingStatus(selectedChat.id, false);
      }
    }
  }, [selectedChat]);

  // Xử lý scroll cho tin nhắn
  const handleMessagesScroll = useCallback((e) => {
  const element = e.target;

  // Store current scroll position
  prevScrollHeightRef.current = element.scrollHeight;
  prevScrollTopRef.current = element.scrollTop;

  // Load more messages when near the top
  // Chỉ tải tin nhắn cũ khi scroll lên trên và không phải lần đầu chọn cuộc trò chuyện
  if (element.scrollTop <= 50 && !isLoadingMoreMessages && selectedChat?.hasMore && !selectedChat?.preventInitialLoad) {
    setIsLoadingMoreMessages(true);

    // Load older messages
    loadMessages(selectedChat.id, messagePageNumber + 1)
      .then(newMessagesData => {
        if (newMessagesData.messages.length > 0) {
          setSelectedChat(prevChat => ({
            ...prevChat,
            messages: [...newMessagesData.messages, ...(prevChat?.messages || [])],
            hasMore: newMessagesData.hasMore,
          }));
          setMessagePageNumber(prev => prev + 1);
          
          // If no more messages available after this load
          if (!newMessagesData.hasMore) {
            setShowNoMoreMessages(true);
            // Hide the notification after 3 seconds
            setTimeout(() => setShowNoMoreMessages(false), 3000);
          }
        } else {
          setSelectedChat(prevChat => ({
            ...prevChat,
            hasMore: false
          }));
          
          // Show notification when no more messages are available
          setShowNoMoreMessages(true);
          // Hide the notification after 3 seconds
          setTimeout(() => setShowNoMoreMessages(false), 3000);
        }
      })
      .catch(err => setError(err.message || 'Failed to load more messages'))
      .finally(() => setIsLoadingMoreMessages(false));
  }
}, [isLoadingMoreMessages, selectedChat, messagePageNumber, loadMessages]);

useEffect(() => {
  setShowNoMoreMessages(false);
}, [selectedChat?.id]);


  // Kết nối WebSocket
  const connectWebSocket = useCallback(() => {
    if (!c_user) return;

    try {
      stompClientRef.current = messageService.connect(
        c_user,
        handleNewMessage,
        handleTypingUpdate
      );
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Không thể kết nối đến máy chủ WebSocket.');
    }
  }, [c_user, handleNewMessage, handleTypingUpdate]);

// Thêm đăng ký kênh typing khi chọn một cuộc trò chuyện
useEffect(() => {
  if (selectedChat?.id && stompClientRef.current?.connected) {
    // Đăng ký nhận tin nhắn mới
    const messageSubscription = stompClientRef.current.subscribe(
      `/topic/conversation/${selectedChat.id}`,
      (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          handleNewMessage(newMessage);
        } catch (error) {
          console.error('Error parsing incoming message from topic:', error);
        }
      }
    );
    
    // Đăng ký nhận thông báo typing
    const typingSubscription = stompClientRef.current.subscribe(
      `/topic/conversation/${selectedChat.id}/typing`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          handleTypingUpdate({
            ...data,
            conversationId: selectedChat.id,
            userName: selectedChat.participants?.find(p => p.userId?.toString() === data.userId?.toString())?.userName || 'Ai đó'
          });
        } catch (error) {
          console.error('Error parsing typing update:', error);
        }
      }
    );
    
    // Cleanup function
    return () => {
      if (messageSubscription) messageSubscription.unsubscribe();
      if (typingSubscription) typingSubscription.unsubscribe();
    };
  }
}, [selectedChat?.id, handleNewMessage, handleTypingUpdate]);


  // Render danh sách hội thoại
  const renderConversations = () => {
    if (!c_user) return null;

    return conversations.map(conversation => {
      // Xác định loại cuộc trò chuyện (nhóm hoặc trực tiếp)
      const isGroup = conversation.type === 'GROUP';
      
      // Lấy thông tin hiển thị dựa vào loại cuộc trò chuyện
      let displayName = '';
      let displayAvatar = '';
      
      if (isGroup) {
        // Đối với nhóm, hiển thị tên nhóm và avatar nhóm (nếu có)
        displayName = conversation.name || 'Nhóm không tên';
        displayAvatar = conversation.avatarUrl || '/default-group-avatar.png';
      } else {
        // Đối với trò chuyện trực tiếp, hiển thị thông tin người dùng khác
        const otherParticipant = conversation.participants?.find(
          p => p.userId?.toString() !== c_user
        ) || {};
        displayName = otherParticipant.userName || 'Unknown';
        displayAvatar = otherParticipant.userAvatar || '/default-avatar.png';
      }
      
      // Kiểm tra tin nhắn chưa đọc
      const hasUnread = conversation.lastMessage && 
                        conversation.lastMessage.senderId?.toString() !== c_user && 
                        !conversation.lastMessage.read;
      
      // Tính thời gian hiển thị
      const timeDisplay = conversation.lastMessage?.sentAt ? 
        formatMessageTime(new Date(conversation.lastMessage.sentAt)) : '';
        
      // Kiểm tra xem có ai đang nhập trong cuộc trò chuyện này không
      const isTypingInConversation = typingUsers[conversation.id] && 
                                    Object.keys(typingUsers[conversation.id]).length > 0;
      
      // Lấy tên người đang nhập (nếu có)
      const typingUserName = isTypingInConversation ? 
                            Object.values(typingUsers[conversation.id])[0]?.userName || 'Ai đó' : '';

      return (
        <StyledListItem
          key={conversation.id}
          button
          selected={selectedChat?.id === conversation.id}
          onClick={() => handleSelectMessage(conversation)}
        >
          <ListItemAvatar>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={displayAvatar} 
                alt={displayName}
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: hasUnread ? `2px solid ${theme.palette.primary.main}` : 'none'
                }}
              />
              {isGroup && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: theme.palette.background.paper,
                    border: `2px solid ${theme.palette.background.paper}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: theme.palette.primary.main
                  }}
                >
                  {conversation.participants?.length || 0}
                </Box>
              )}
            </Box>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hasUnread && <UnreadBadge />}
                <Typography 
                  variant="body1" 
                  fontWeight={hasUnread ? 700 : 600}
                  color={hasUnread ? 'primary.dark' : 'text.primary'}
                >
                  {displayName}
                </Typography>
              </Box>
            }
            secondary={
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography 
                  variant="body2" 
                  color={hasUnread ? 'primary.dark' : isTypingInConversation ? 'primary.main' : 'text.secondary'} 
                  noWrap 
                  sx={{ 
                    maxWidth: '70%',
                    fontWeight: hasUnread ? 600 : isTypingInConversation ? 500 : 400,
                    fontStyle: isTypingInConversation ? 'italic' : 'normal'
                  }}
                >
                  {isTypingInConversation ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TypingIndicator sx={{ mr: 0.5 }}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </TypingIndicator>
                      {typingUserName} đang nhập...
                    </Box>
                  ) : (
                    isGroup && conversation.lastMessage ? 
                    `${conversation.lastMessage.senderName}: ${conversation.lastMessage.content}` : 
                    conversation.lastMessage?.content || 'Chưa có tin nhắn'
                  )}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={hasUnread ? 'primary.dark' : 'text.secondary'}
                  fontWeight={hasUnread ? 600 : 400}
                >
                  {timeDisplay}
                </Typography>
              </Stack>
            }
          />
        </StyledListItem>
      );
    });
  };
  
  // Hàm định dạng thời gian tin nhắn
  const formatMessageTime = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Hôm nay - hiển thị giờ
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
      // Hôm qua
      return 'Hôm qua';
    } else if (diffDays < 7) {
      // Trong tuần này - hiển thị thứ
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    } else {
      // Cách đây hơn 1 tuần - hiển thị ngày/tháng
      return date.toLocaleDateString([], {day: '2-digit', month: '2-digit'});
    }
  };

  // Render tin nhắn
  // Phần code sửa lại cho hàm renderMessages()
const renderMessages = () => {
  if (!selectedChat?.messages) return null;

  // Nhóm tin nhắn theo ngày
  const messagesByDate = selectedChat.messages.reduce((groups, msg) => {
    const date = new Date(msg.sentAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  // Xác định xem đây có phải là cuộc trò chuyện nhóm không
  const isGroup = selectedChat.type === 'GROUP';

  // Render từng nhóm tin nhắn
  return Object.entries(messagesByDate).map(([date, messages]) => (
    <React.Fragment key={date}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: theme.palette.divider,
          zIndex: 0
        }
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            bgcolor: theme.palette.background.default, 
            px: 2, 
            py: 0.5, 
            borderRadius: '12px',
            color: theme.palette.text.secondary,
            fontWeight: 500,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            zIndex: 1
          }}
        >
          {new Date(date).toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>
      
      {messages.map((msg, index) => {
        const isCurrentUser = msg.senderId?.toString() === c_user;
        
        // Kiểm tra xem tin nhắn này có phải là tin nhắn cuối cùng của một chuỗi tin nhắn từ cùng một người
        const isLastInSequence = index === messages.length - 1 || 
          messages[index + 1].senderId?.toString() !== msg.senderId?.toString();
        
        // Hiển thị avatar ở tin nhắn cuối cùng của một chuỗi thay vì tin nhắn đầu tiên
        const showAvatar = !isCurrentUser && isLastInSequence;
        
        // Kiểm tra xem tin nhắn này có phải là một phần của chuỗi tin nhắn liên tiếp
        const isConsecutive = index > 0 && messages[index - 1].senderId?.toString() === msg.senderId?.toString();
        
        // Lấy thông tin người gửi
        const senderAvatar = msg.senderAvatar || 
          (isCurrentUser ? null : selectedChat.participants?.find(p => p.userId?.toString() === msg.senderId?.toString())?.userAvatar);
        
        // Trong nhóm, luôn hiển thị tên người gửi cho tin nhắn không phải của người dùng hiện tại
        const showSenderName = isGroup && !isCurrentUser && !isConsecutive;
        
        return (
          <Box
            key={msg.id}
            sx={{
              mb: isConsecutive ? 0.5 : 2,
              mt: isConsecutive ? 0.5 : 0,
              display: 'flex',
              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              opacity: msg.status === 'sending' ? 0.8 : 1,
              animation: 'fadeIn 0.3s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            {!isCurrentUser && (
              <Box sx={{ width: 32, mr: 1, display: 'flex', alignItems: 'flex-end' }}>
                {showAvatar ? (
                  <Avatar 
                    src={senderAvatar || '/default-avatar.png'} 
                    alt={msg.senderName || "Avatar"}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme.palette.primary.main,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : null}
              </Box>
            )}
            
            <MessageBubble 
              isCurrentUser={isCurrentUser}
              sx={{
                borderBottomLeftRadius: !isCurrentUser && !isLastInSequence ? '8px' : undefined,
                borderBottomRightRadius: isCurrentUser && !isLastInSequence ? '8px' : undefined,
              }}
            >
              {/* Hiển thị tên người gửi ở tin nhắn đầu tiên trong chuỗi hoặc luôn hiển thị trong nhóm */}
              {(!isCurrentUser && !isConsecutive) || (isGroup && !isCurrentUser) ? (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 0.5, 
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }}
                >
                  {msg.senderName}
                </Typography>
              ) : null}
              <Typography variant="body2">{msg.content}</Typography>
              
              {/* Hiển thị tệp đính kèm nếu có */}
              {msg.attachments && msg.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {msg.attachments.map((attachment, idx) => (
                    <Box 
                      key={idx} 
                      component="a" 
                      href={attachment.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isCurrentUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isCurrentUser ? 'rgba(255,255,255,0.9)' : theme.palette.text.primary,
                        textDecoration: 'none',
                        '&:hover': {
                          bgcolor: isCurrentUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                        }
                      }}
                    >
                      <Typography variant="body2" noWrap>
                        {attachment.fileName || 'Tệp đính kèm'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              {/* Chỉ hiển thị thời gian ở tin nhắn cuối cùng của một chuỗi */}
              {isLastInSequence && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center', 
                  mt: 0.5 
                }}>
                  <Typography
                    variant="caption"
                    color={isCurrentUser ? 'rgba(255,255,255,0.8)' : 'text.secondary'}
                  >
                    {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                  
                  {isCurrentUser && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                      {msg.status === 'sending' && (
                        <CircularProgress size={10} thickness={5} sx={{ ml: 0.5, color: 'rgba(255,255,255,0.8)' }} />
                      )}
                      {msg.status === 'sent' && (
                        <Box component="span" sx={{ 
                          fontSize: '1rem', 
                          lineHeight: 1, 
                          color: 'rgba(255,255,255,0.8)',
                          ml: 0.5
                        }}>✓</Box>
                      )}
                      {msg.status === 'failed' && (
                        <Box component="span" sx={{ 
                          fontSize: '1rem', 
                          lineHeight: 1, 
                          color: theme.palette.error.main,
                          ml: 0.5
                        }}>!</Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </MessageBubble>
          </Box>
        );
      })}
    </React.Fragment>
  ));
};
useEffect(() => {
  if (selectedChat?.messages?.length > 0 && !isLoadingMoreMessages) {
    // Luôn cuộn xuống dưới khi chat mới được chọn
    if (selectedChat?.preventInitialLoad) {
      scrollToBottom();
    }
    // Chỉ tự động cuộn khi người dùng đang ở gần cuối cuộc trò chuyện
    else if (messagesContainerRef.current && 
        messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop 
        <= messagesContainerRef.current.clientHeight + 100) {
      scrollToBottom();
    }
  }
}, [selectedChat?.messages?.length, isLoadingMoreMessages, selectedChat?.preventInitialLoad, scrollToBottom]);

  return (
    <ThemeProvider theme={theme}>
      <RootStyle>
        <CustomScrollbar />
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)} 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16, 
              right: 16,
              zIndex: 1000,
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {(!isMobile || showMobileList) && (
          <ConversationListStyle sx={{ ...(isMobile && { maxWidth: '100%', borderRight: 'none' }) }}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.palette.primary.light, 
              borderTopLeftRadius: theme.shape.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" fontWeight={700} color="primary.dark">
                Tin nhắn
              </Typography>
              <Box>
                <Tooltip title="Tìm kiếm" TransitionComponent={Zoom}>
                  <IconButton size="small" sx={{ color: theme.palette.primary.dark, mr: 1 }}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Lọc tin nhắn" TransitionComponent={Zoom}>
                  <IconButton size="small" sx={{ color: theme.palette.primary.dark }}>
                    <FilterIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TabsContainer>
              <StyledTabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="message tabs" 
                variant="fullWidth"
              >
                <StyledTab label="Hộp thư" value="inbox" />
                <StyledTab label="Đang chờ" value="pending" />
                <StyledTab label="Quan trọng" value="important" />
                <StyledTab label="Lưu trữ" value="archived" />
              </StyledTabs>
            </TabsContainer>
            
            <List ref={listRef} onScroll={handleScroll} sx={{ flexGrow: 1, overflowY: 'auto', pt: 0 }}>
              {loading && pageNumber === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  <LoadingProgress />
                </Box>
              ) : conversations.length > 0 ? (
                <>
                  {renderConversations()}
                  {loading && pageNumber > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <LoadingProgress size={20} />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Không có cuộc trò chuyện nào
                  </Typography>
                </Box>
              )}
            </List>
          </ConversationListStyle>
        )}

        {(!isMobile || !showMobileList) && (
          <ConversationBoxStyle>
            {selectedChat ? (
              <Stack direction="column" sx={{ height: '100%' }}>
                {/* Header */}
                <ChatHeader>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {isMobile && (
                      <IconButton onClick={() => setShowMobileList(true)} sx={{ color: theme.palette.primary.dark }}>
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    {selectedChat.type === 'GROUP' ? (
                      <Avatar 
                        src={selectedChat.avatarUrl || '/default-group-avatar.png'} 
                        alt={selectedChat.name || 'Nhóm'}
                        sx={{ bgcolor: theme.palette.primary.main }}
                      />
                    ) : (
                      <Avatar 
                        src={(selectedChat.participants?.find(p => p.userId?.toString() !== c_user)?.userAvatar) || '/default-avatar.png'} 
                        alt="Avatar"
                        sx={{ bgcolor: theme.palette.primary.main }}
                      />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600} color="primary.dark">
                        {selectedChat.type === 'GROUP' 
                          ? selectedChat.name || 'Nhóm không tên'
                          : selectedChat.participants?.find(p => p.userId?.toString() !== c_user)?.userName || 'Unknown'}
                      </Typography>
                      {selectedChat.type === 'GROUP' ? (
                        <Typography variant="body2" color="text.secondary">
                          {selectedChat.participants?.length || 0} thành viên
                        </Typography>
                      ) : (
                        typingUsers[selectedChat?.id] && Object.keys(typingUsers[selectedChat.id]).length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TypingIndicator sx={{ mr: 1 }}>
                              <span></span>
                              <span></span>
                              <span></span>
                            </TypingIndicator>
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              {Object.values(typingUsers[selectedChat.id])[0]?.userName || 'Ai đó'} đang soạn tin...
                            </Typography>
                          </Box>
                        ) : (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.success.main,
                                display: 'inline-block',
                                mr: 1
                              }} 
                            />
                            Trực tuyến
                          </Typography>
                        )
                      )}
                    </Box>
                    <Box>
                      <Tooltip title="Tùy chọn" TransitionComponent={Zoom}>
                        <IconButton size="small" sx={{ color: theme.palette.primary.dark }}>
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </ChatHeader>

                {/* Message List */}
                <MessageListStyle ref={messagesContainerRef} onScroll={handleMessagesScroll}>
  {showNoMoreMessages && (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        py: 1,
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}
    >
      <Alert 
        severity="info" 
        variant="filled"
        sx={{ 
          borderRadius: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.dark,
          animation: 'fadeInOut 3s forwards',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0, transform: 'translateY(-10px)' },
            '10%': { opacity: 1, transform: 'translateY(0)' },
            '80%': { opacity: 1 },
            '100%': { opacity: 0 }
          }
        }}
      >
        Đã hiển thị tất cả tin nhắn
      </Alert>
    </Box>
  )}
  {isLoadingMoreMessages && (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
      <LoadingProgress size={20} />
    </Box>
  )}
  <Box>
    {renderMessages()}
    <div ref={messagesEndRef} />
  </Box>
</MessageListStyle>

                {/* Message Input */}
                <MessageInputBoxStyle component="form" onSubmit={handleSendMessage}>
                  <StyledMessageInput
                    fullWidth
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    multiline
                    maxRows={4}
                    InputProps={{
                      endAdornment: (
                        <IconButton 
                          type="submit" 
                          disabled={!messageInput.trim()}
                          sx={{ 
                            backgroundColor: messageInput.trim() ? theme.palette.primary.main : 'transparent',
                            color: messageInput.trim() ? '#fff' : theme.palette.text.disabled,
                            width: 36,
                            height: 36,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: messageInput.trim() ? theme.palette.primary.dark : 'transparent',
                              transform: messageInput.trim() ? 'scale(1.05)' : 'none',
                            },
                            '&:disabled': {
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </MessageInputBoxStyle>
              </Stack>
            ) : (
              <StyledNoChat>
                <Box sx={{ 
                  position: 'relative',
                  mb: 3,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.light,
                    zIndex: 0,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }
                }}>
                  <NoChatIcon 
                    sx={{ 
                      fontSize: 80, 
                      color: theme.palette.primary.main, 
                      position: 'relative',
                      zIndex: 1,
                      animation: 'pulse 2s infinite ease-in-out',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.7, transform: 'scale(1)' },
                        '50%': { opacity: 0.9, transform: 'scale(1.05)' },
                        '100%': { opacity: 0.7, transform: 'scale(1)' }
                      }
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="primary.dark" fontWeight={600} gutterBottom>
                  Chưa có cuộc trò chuyện nào được chọn
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 300 }}>
                  Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                </Typography>
              </StyledNoChat>
            )}
          </ConversationBoxStyle>
        )}
      </RootStyle>
    </ThemeProvider>
  );
};

export default Message;