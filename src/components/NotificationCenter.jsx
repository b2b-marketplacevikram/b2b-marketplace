import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
    const notificationContext = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    
    // Safely destructure with defaults
    const { 
        notifications = [], 
        unreadCount = 0, 
        markAsRead = () => {}, 
        markAllAsRead = () => {} 
    } = notificationContext || {};

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate to order if order-related
        if (notification.orderId) {
            setIsOpen(false);
            navigate(`/buyer/orders`);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getSeverityIcon = (severity) => {
        const iconMap = {
            SUCCESS: '✓',
            INFO: 'ℹ',
            WARNING: '⚠',
            ERROR: '✕'
        };
        return iconMap[severity] || 'ℹ';
    };

    return (
        <div className="notification-center">
            <button 
                className="notification-bell" 
                onClick={() => setIsOpen(!isOpen)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="notification-overlay" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    className="mark-all-read"
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifications">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={`notification-severity-icon severity-${notification.severity.toLowerCase()}`}>
                                            {getSeverityIcon(notification.severity)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {notification.title}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-time">
                                                {formatTimestamp(notification.timestamp)}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="unread-dot"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
