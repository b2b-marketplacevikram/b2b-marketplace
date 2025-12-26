import React, { useState } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Messages.css';

const Messages = () => {
    const { user, isBuyer } = useAuth();
    const {
        conversations,
        currentConversation,
        messages,
        isConnected,
        typingUsers,
        selectConversation,
        sendMessage,
        sendTypingIndicator,
        clearConversation
    } = useMessaging();

    const [messageInput, setMessageInput] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(null);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageInput.trim() || !currentConversation) return;

        const receiverId = String(user.id) === String(currentConversation.buyerId)
            ? currentConversation.supplierId
            : currentConversation.buyerId;

        await sendMessage(messageInput, receiverId);
        setMessageInput('');
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        if (currentConversation && e.target.value.length > 0) {
            const receiverId = String(user.id) === String(currentConversation.buyerId)
                ? currentConversation.supplierId
                : currentConversation.buyerId;
            
            sendTypingIndicator(currentConversation.id, receiverId);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatLastMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    const getOtherUserName = (conversation) => {
        if (!conversation) return 'Unknown';
        const name = String(user.id) === String(conversation.buyerId)
            ? conversation.supplierName
            : conversation.buyerName;
        return name || 'Unknown';
    };

    const isTyping = currentConversation && typingUsers.has(
        String(user.id) === String(currentConversation.buyerId)
            ? currentConversation.supplierId
            : currentConversation.buyerId
    );

    return (
        <div className="messages-page">
            <div className="messages-header">
                <h1>Messages</h1>
                <div className="connection-status">
                    <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>
            </div>

            <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-list">
                    <h2>Conversations</h2>
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                            <p className="hint">Start chatting with suppliers or buyers!</p>
                        </div>
                    ) : (
                        <div className="conversation-items">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className={`conversation-item ${
                                        currentConversation?.id === conversation.id ? 'active' : ''
                                    }`}
                                    onClick={() => selectConversation(conversation)}
                                >
                                    <div className="conversation-avatar">
                                        {getOtherUserName(conversation).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-header-row">
                                            <h3>{getOtherUserName(conversation)}</h3>
                                            <span className="conversation-time">
                                                {formatLastMessageTime(conversation.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="conversation-preview-row">
                                            <p className="last-message">
                                                {conversation.lastMessage || 'No messages yet'}
                                            </p>
                                            {conversation.unreadCount > 0 && (
                                                <span className="unread-badge">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Window */}
                <div className="chat-window">
                    {currentConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-avatar">
                                    {getOtherUserName(currentConversation).charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-header-info">
                                    <h3>{getOtherUserName(currentConversation)}</h3>
                                    <p className="chat-user-type">
                                        {isBuyer ? 'Seller' : 'Buyer'}
                                    </p>
                                </div>
                                <button 
                                    className="clear-chat-btn"
                                    onClick={() => {
                                        console.log('Clear button clicked, conversation:', currentConversation.id);
                                        setShowClearConfirm(currentConversation.id);
                                    }}
                                    title="Clear conversation"
                                >
                                    🗑️ Clear Chat
                                </button>
                            </div>

                            {/* Clear confirmation modal */}
                            {showClearConfirm === currentConversation.id && (
                                <div className="clear-confirm-modal">
                                    <div className="clear-confirm-content">
                                        <h4>Clear this conversation?</h4>
                                        <p>This will remove the conversation from your view. The chat history will be kept for 6 months for compliance purposes.</p>
                                        <p className="clear-note">If the other party sends a new message, the conversation will reappear.</p>
                                        <div className="clear-confirm-actions">
                                            <button 
                                                className="btn-cancel"
                                                onClick={() => setShowClearConfirm(null)}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                className="btn-clear"
                                                onClick={async () => {
                                                    console.log('Clearing conversation:', currentConversation.id);
                                                    const result = await clearConversation(currentConversation.id);
                                                    console.log('Clear result:', result);
                                                    setShowClearConfirm(null);
                                                    if (result.success) {
                                                        // Force refresh - select first remaining conversation or show empty
                                                        window.location.reload();
                                                    }
                                                }}
                                            >
                                                Clear Conversation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`message ${
                                                message.senderId === user.id ? 'sent' : 'received'
                                            }`}
                                        >
                                            <div className="message-bubble">
                                                <p>{message.content}</p>
                                                <div className="message-meta">
                                                    <span className="message-time">
                                                        {formatTime(message.sentAt)}
                                                    </span>
                                                    {message.senderId === user.id && (
                                                        <span className="message-status">
                                                            {message.read ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                )}
                            </div>

                            <form className="chat-input-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    className="chat-input"
                                />
                                <button type="submit" className="send-button" disabled={!messageInput.trim()}>
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <div className="chat-placeholder-icon">💬</div>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
