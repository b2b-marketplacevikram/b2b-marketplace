import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    console.log('NotificationProvider rendering...')
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toastNotification, setToastNotification] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Connect to WebSocket when user logs in
    useEffect(() => {
        if (user && user.id) {
            connectWebSocket();
            fetchNotifications();
        } else {
            disconnectWebSocket();
        }

        return () => {
            disconnectWebSocket();
        };
    }, [user]);

    const connectWebSocket = () => {
        try {
            console.log('Connecting to WebSocket...');
            
            // Create SockJS connection
            const socket = new SockJS('http://localhost:8086/ws');
            const client = Stomp.over(socket);

            // Disable debug logging in production
            client.debug = () => {};
            
            // Set a connection timeout
            const connectionTimeout = setTimeout(() => {
                console.warn('WebSocket connection timeout - continuing without real-time notifications');
                setIsConnected(false);
            }, 5000);

            client.connect(
                {},
                (frame) => {
                    clearTimeout(connectionTimeout);
                    console.log('Connected to notification WebSocket');
                    setIsConnected(true);
                    setStompClient(client);

                    // Subscribe to user-specific topic
                    client.subscribe(`/topic/user/${user.id}`, (message) => {
                        const notification = JSON.parse(message.body);
                        console.log('Received notification:', notification);
                        handleNewNotification(notification);
                    });

                    // Send connect message
                    client.send('/app/connect', {}, JSON.stringify({ userId: user.id }));
                },
                (error) => {
                    clearTimeout(connectionTimeout);
                    console.warn('WebSocket connection failed - continuing without real-time notifications:', error);
                    setIsConnected(false);
                }
            );
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            setIsConnected(false);
        }
    };

    const disconnectWebSocket = () => {
        if (stompClient && stompClient.connected) {
            stompClient.disconnect(() => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
                setStompClient(null);
            });
        }
    };

    const handleNewNotification = (notification) => {
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        setToastNotification(notification);
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
            setToastNotification(null);
        }, 5000);

        // Play notification sound (optional)
        playNotificationSound();
    };

    const playNotificationSound = () => {
        // You can add a notification sound here
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch (e) {
            // Sound not available, ignore
        }
    };

    const fetchNotifications = async () => {
        if (!user || !user.id) return;
        
        try {
            const response = await fetch(`http://localhost:8086/api/notifications/user/${user.id}`);
            if (!response.ok) {
                console.warn('Notification service unavailable');
                return;
            }
            const data = await response.json();
            setNotifications(data);

            // Fetch unread count
            const countResponse = await fetch(`http://localhost:8086/api/notifications/user/${user.id}/unread/count`);
            if (countResponse.ok) {
                const countData = await countResponse.json();
                setUnreadCount(countData.count);
            }
        } catch (error) {
            console.warn('Notification service unavailable:', error.message);
            // Don't throw - app should work without notifications
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`http://localhost:8086/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`http://localhost:8086/api/notifications/user/${user.id}/read-all`, {
                method: 'PUT'
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const dismissToast = () => {
        setToastNotification(null);
    };

    const value = {
        notifications,
        unreadCount,
        toastNotification,
        isConnected,
        markAsRead,
        markAllAsRead,
        dismissToast,
        refreshNotifications: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
