// chat-socket.service.js
class ChatSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
        this.typingHandlers = new Map();
        this.readReceiptHandlers = new Map();
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    connect(userId) {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
                return;
            }

            const socket = new SockJS('http://localhost:8080/ws');
            this.stompClient = Stomp.over(socket);
            this.stompClient.debug = null; // Disable debug logs

            this.stompClient.connect(
                {},
                () => {
                    console.log('WebSocket connected');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    
                    // Subscribe to personal channel
                    this.subscribeToUserChannel(userId);
                    
                    resolve();
                },
                (error) => {
                    console.error('WebSocket connection error:', error);
                    this.connected = false;
                    
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        setTimeout(() => {
                            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
                            this.connect(userId).then(resolve).catch(reject);
                        }, this.reconnectDelay);
                    } else {
                        reject(error);
                    }
                }
            );
        });
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            // Unsubscribe from all topics
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();

            this.stompClient.disconnect();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }

    subscribeToUserChannel(userId) {
        // Subscribe to new messages
        const userMessagesSubscription = this.stompClient.subscribe(
            `/user/${userId}/queue/messages`,
            (message) => {
                const messageData = JSON.parse(message.body);
                this.messageHandlers.forEach((handler) => {
                    handler(messageData);
                });
            }
        );
        this.subscriptions.set(`user-${userId}-messages`, userMessagesSubscription);

        // Subscribe to read receipts
        const readReceiptsSubscription = this.stompClient.subscribe(
            `/user/${userId}/queue/read-receipts`,
            (message) => {
                const messageId = JSON.parse(message.body);
                this.readReceiptHandlers.forEach((handler) => {
                    handler(messageId);
                });
            }
        );
        this.subscriptions.set(`user-${userId}-read-receipts`, readReceiptsSubscription);

        // Subscribe to new conversations
        const newConversationsSubscription = this.stompClient.subscribe(
            `/user/${userId}/queue/conversations`,
            (message) => {
                const conversationData = JSON.parse(message.body);
                // Handle new conversation notification
                if (this.newConversationHandler) {
                    this.newConversationHandler(conversationData);
                }
            }
        );
        this.subscriptions.set(`user-${userId}-conversations`, newConversationsSubscription);

        // Subscribe to removed conversations
        const removedConversationsSubscription = this.stompClient.subscribe(
            `/user/${userId}/queue/conversations/remove`,
            (message) => {
                const conversationId = JSON.parse(message.body);
                // Handle removed from conversation notification
                if (this.removedFromConversationHandler) {
                    this.removedFromConversationHandler(conversationId);
                }
            }
        );
        this.subscriptions.set(`user-${userId}-conversations-remove`, removedConversationsSubscription);
    }

    subscribeToConversation(conversationId) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        // Check if already subscribed
        if (this.subscriptions.has(`conversation-${conversationId}`)) {
            return;
        }

        // Subscribe to conversation messages
        const messageSubscription = this.stompClient.subscribe(
            `/topic/conversation/${conversationId}`,
            (message) => {
                const messageData = JSON.parse(message.body);
                this.messageHandlers.forEach((handler) => {
                    handler(messageData);
                });
            }
        );
        this.subscriptions.set(`conversation-${conversationId}`, messageSubscription);

        // Subscribe to typing indicators
        const typingSubscription = this.stompClient.subscribe(
            `/topic/conversation/${conversationId}/typing`,
            (message) => {
                const typingData = JSON.parse(message.body);
                this.typingHandlers.forEach((handler) => {
                    handler(typingData);
                });
            }
        );
        this.subscriptions.set(`conversation-${conversationId}-typing`, typingSubscription);

        // Subscribe to message deletion
        const deleteSubscription = this.stompClient.subscribe(
            `/topic/conversation/${conversationId}/delete`,
            (message) => {
                const messageId = JSON.parse(message.body);
                if (this.messageDeleteHandler) {
                    this.messageDeleteHandler(messageId);
                }
            }
        );
        this.subscriptions.set(`conversation-${conversationId}-delete`, deleteSubscription);

        // Subscribe to participant changes
        const addParticipantSubscription = this.stompClient.subscribe(
            `/topic/conversation/${conversationId}/participants/add`,
            (message) => {
                const participant = JSON.parse(message.body);
                if (this.participantAddedHandler) {
                    this.participantAddedHandler(conversationId, participant);
                }
            }
        );
        this.subscriptions.set(`conversation-${conversationId}-participants-add`, addParticipantSubscription);

        const removeParticipantSubscription = this.stompClient.subscribe(
            `/topic/conversation/${conversationId}/participants/remove`,
            (message) => {
                const participantId = JSON.parse(message.body);
                if (this.participantRemovedHandler) {
                    this.participantRemovedHandler(conversationId, participantId);
                }
            }
        );
        this.subscriptions.set(`conversation-${conversationId}-participants-remove`, removeParticipantSubscription);

        console.log(`Subscribed to conversation ${conversationId}`);
    }

    unsubscribeFromConversation(conversationId) {
        const subscriptionKeys = [
            `conversation-${conversationId}`,
            `conversation-${conversationId}-typing`,
            `conversation-${conversationId}-delete`,
            `conversation-${conversationId}-participants-add`,
            `conversation-${conversationId}-participants-remove`
        ];

        subscriptionKeys.forEach(key => {
            const subscription = this.subscriptions.get(key);
            if (subscription) {
                subscription.unsubscribe();
                this.subscriptions.delete(key);
            }
        });

        console.log(`Unsubscribed from conversation ${conversationId}`);
    }

    sendMessage(message) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.stompClient.send('/app/message.send', {}, JSON.stringify(message));
    }

    markMessageAsRead(messageId) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.stompClient.send(`/app/message.read/${messageId}`, {}, '');
    }

    sendTypingStart(conversationId) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.stompClient.send(`/app/typing.start/${conversationId}`, {}, '');
    }

    sendTypingStop(conversationId) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.stompClient.send(`/app/typing.stop/${conversationId}`, {}, '');
    }

    addMessageHandler(id, handler) {
        this.messageHandlers.set(id, handler);
    }

    removeMessageHandler(id) {
        this.messageHandlers.delete(id);
    }

    addTypingHandler(id, handler) {
        this.typingHandlers.set(id, handler);
    }

    removeTypingHandler(id) {
        this.typingHandlers.delete(id);
    }

    addReadReceiptHandler(id, handler) {
        this.readReceiptHandlers.set(id, handler);
    }

    removeReadReceiptHandler(id) {
        this.readReceiptHandlers.delete(id);
    }

    setMessageDeleteHandler(handler) {
        this.messageDeleteHandler = handler;
    }

    setParticipantAddedHandler(handler) {
        this.participantAddedHandler = handler;
    }

    setParticipantRemovedHandler(handler) {
        this.participantRemovedHandler = handler;
    }

    setNewConversationHandler(handler) {
        this.newConversationHandler = handler;
    }

    setRemovedFromConversationHandler(handler) {
        this.removedFromConversationHandler = handler;
    }
}

// Export singleton instance
const chatSocketService = new ChatSocketService();
export default chatSocketService;