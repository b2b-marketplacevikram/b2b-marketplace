import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '../context/MessagingContext';
import '../styles/MessageButton.css';

const MessageButton = ({ userId, userName, className = '' }) => {
    const navigate = useNavigate();
    const { startConversation, selectConversation, conversations } = useMessaging();

    const handleMessageClick = async () => {
        // Check if conversation already exists
        const existingConv = conversations.find(
            conv => conv.buyerId === userId || conv.supplierId === userId
        );

        if (existingConv) {
            selectConversation(existingConv);
            navigate('/messages');
        } else {
            // Create new conversation
            const newConv = await startConversation(userId);
            if (newConv) {
                // Reload and select
                setTimeout(() => {
                    navigate('/messages');
                }, 500);
            }
        }
    };

    return (
        <button 
            className={`message-button ${className}`}
            onClick={handleMessageClick}
            title={`Message ${userName}`}
        >
            <span className="message-icon">💬</span>
            <span className="message-text">Message</span>
        </button>
    );
};

export default MessageButton;
