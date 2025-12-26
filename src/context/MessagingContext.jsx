import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs';
import axios from 'axios';

const MessagingContext = createContext();

export const useMessaging = () => {
    const context = useContext(MessagingContext);
    if (!context) {
        throw new Error('useMessaging must be used within MessagingProvider');
    }
    return context;
};

export const MessagingProvider = ({ children }) => {
    console.log('MessagingProvider rendering...')
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    
    const stompClient = useRef(null);
    const typingTimeout = useRef(null);

    const connectWebSocket = useCallback(() => {
        if (!user || isConnected) return;

        try {
            const socket = new SockJS('http://localhost:8091/ws-chat');
            const client = Stomp.over(socket);
            
            client.debug = () => {}; // Disable debug logging

            const connectionTimeout = setTimeout(() => {
                console.warn('Messaging WebSocket timeout - continuing without real-time chat');
                setIsConnected(false);
            }, 5000);

            client.connect({}, () => {
                clearTimeout(connectionTimeout);
                console.log('Connected to messaging WebSocket');
                setIsConnected(true);
                stompClient.current = client;

                // Subscribe to user's message queue
                client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
                    const chatMessage = JSON.parse(message.body);
                    handleIncomingMessage(chatMessage);
                });
            }, (error) => {
                clearTimeout(connectionTimeout);
                console.warn('Messaging WebSocket connection failed - continuing without real-time chat:', error);
                setIsConnected(false);
            });
        } catch (error) {
            console.error('Failed to connect to messaging WebSocket:', error);
            setIsConnected(false);
        }
    }, [user, isConnected]);

    const disconnectWebSocket = useCallback(() => {
        if (stompClient.current) {
            stompClient.current.disconnect();
            stompClient.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            connectWebSocket();
            loadConversations();
        } else {
            disconnectWebSocket();
        }

        return () => disconnectWebSocket();
    }, [user]);

    const handleIncomingMessage = (chatMessage) => {
        console.log('Incoming message:', chatMessage);

        if (chatMessage.type === 'CHAT') {
            // Add message to current conversation ONLY if it matches the current conversation
            if (currentConversation && chatMessage.conversationId === currentConversation.id) {
                setMessages(prev => [...prev, chatMessage]);
            }

            // Update conversation list
            loadConversations();

            // Play notification sound (optional)
            // new Audio('/notification.mp3').play();
        } else if (chatMessage.type === 'TYPING') {
            // Only show typing indicator for current conversation
            if (currentConversation && chatMessage.conversationId === currentConversation.id) {
                setTypingUsers(prev => new Set(prev).add(chatMessage.senderId));
            }
            
            // Clear typing indicator after 3 seconds
            setTimeout(() => {
                setTypingUsers(prev => {
                    const updated = new Set(prev);
                    updated.delete(chatMessage.senderId);
                    return updated;
                });
            }, 3000);
        } else if (chatMessage.type === 'READ_RECEIPT') {
            // Mark messages as read in UI
            setMessages(prev => prev.map(msg => 
                msg.conversationId === chatMessage.conversationId && 
                msg.senderId === user.id
                    ? { ...msg, read: true }
                    : msg
            ));
        }
    };

    const loadConversations = async () => {
        if (!user) return;

        try {
            const response = await axios.get(
                `http://localhost:8091/api/conversations/user/${user.id}`
            );
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadMessages = async (conversationId) => {
        if (!user) return;

        try {
            const response = await axios.get(
                `http://localhost:8091/api/conversations/${conversationId}/messages`,
                { params: { userId: user.id } }
            );
            setMessages(response.data);

            // Mark messages as read
            await markConversationAsRead(conversationId);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async (content, receiverId) => {
        if (!user || !currentConversation || !content.trim()) return;

        const chatMessage = {
            conversationId: currentConversation.id,
            senderId: user.id,
            receiverId: receiverId,
            content: content.trim(),
            type: 'CHAT'
        };

        try {
            if (isConnected && stompClient.current) {
                stompClient.current.send('/app/chat.send', {}, JSON.stringify(chatMessage));
            } else {
                // Fallback to REST API
                const response = await axios.post(
                    'http://localhost:8091/api/messages/send',
                    chatMessage
                );
                setMessages(prev => [...prev, response.data]);
            }

            // Reload conversations to update last message
            await loadConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const sendTypingIndicator = (conversationId, receiverId) => {
        if (!isConnected || !stompClient.current || !user) return;

        clearTimeout(typingTimeout.current);
        
        const payload = {
            conversationId,
            senderId: user.id,
            receiverId
        };

        stompClient.current.send('/app/chat.typing', {}, JSON.stringify(payload));
    };

    const markConversationAsRead = async (conversationId) => {
        if (!user) return;

        try {
            await axios.put(
                `http://localhost:8091/api/conversations/${conversationId}/read`,
                null,
                { params: { userId: user.id } }
            );
            await loadConversations();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const startConversation = async (otherUserId) => {
        if (!user) return null;

        try {
            const response = await axios.post(
                'http://localhost:8091/api/conversations/create',
                {
                    user1Id: user.id,
                    user2Id: otherUserId
                }
            );

            const conversation = response.data;
            await loadConversations();
            return conversation;
        } catch (error) {
            console.error('Failed to start conversation:', error);
            return null;
        }
    };

    const selectConversation = async (conversation) => {
        // Clear current messages when switching conversations
        setMessages([]);
        setCurrentConversation(conversation);
        await loadMessages(conversation.id);
    };

    const getTotalUnreadCount = () => {
        return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    };

    // Clear a conversation (soft delete - data stays in DB for 6 months)
    const clearConversation = async (conversationId) => {
        if (!user?.id) return;

        try {
            await axios.delete(
                `http://localhost:8091/api/conversations/${conversationId}/clear`,
                { params: { userId: user.id } }
            );
            
            // Remove from local state
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            
            // Clear current conversation if it's the one being cleared
            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
                setMessages([]);
            }
            
            return { success: true, message: 'Conversation cleared' };
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            return { success: false, message: 'Failed to clear conversation' };
        }
    };

    const value = {
        conversations,
        currentConversation,
        messages,
        isConnected,
        typingUsers,
        loadConversations,
        sendMessage,
        sendTypingIndicator,
        startConversation,
        selectConversation,
        markConversationAsRead,
        getTotalUnreadCount,
        clearConversation
    };

    return (
        <MessagingContext.Provider value={value}>
            {children}
        </MessagingContext.Provider>
    );
};
