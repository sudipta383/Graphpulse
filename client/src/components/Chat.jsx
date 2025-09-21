// client/src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import './Chat.css';

const GET_MESSAGES = gql`
  query { messages { id content author createdAt } }
`;

const POST_MESSAGE = gql`
  mutation ($content: String!, $author: String) {
    postMessage(content: $content, author: $author) { id content author createdAt }
  }
`;

const MESSAGE_SUB = gql`
  subscription { messagePosted { id content author createdAt } }
`;

export default function Chat() {
  const { data, loading, error } = useQuery(GET_MESSAGES);
  const [postMessage] = useMutation(POST_MESSAGE);
  const { data: subData } = useSubscription(MESSAGE_SUB);

  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    if (subData?.messagePosted) {
      setMessages((prev) => [...prev, subData.messagePosted]);
    }
  }, [subData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll monitoring
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollTop + clientHeight < scrollHeight - 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="chat-container">
      <div className="loading-state">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Loading messages...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="chat-container">
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Unable to load messages</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  );

  const send = async () => {
    if (!text.trim() || !author.trim()) return;
    
    setIsTyping(true);
    try {
      await postMessage({ 
        variables: { 
          content: text.trim(), 
          author: author.trim() 
        },
        refetchQueries: [{ query: GET_MESSAGES }]
      });
      setText('');
      inputRef.current?.focus();
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = (now - messageTime) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return messageTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isCurrentUser = (messageAuthor) => {
    return messageAuthor === author;
  };

  const getAvatarColor = (author) => {
    const colors = [
      '#6C5CE7', '#A29BFE', '#FD79A8', '#00B894', '#00CEC9',
      '#55A3FF', '#FF7675', '#74B9FF', '#E17055', '#0984E3'
    ];
    const index = author.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleNameChange = (e) => {
    // Allow up to 50 characters for names
    if (e.target.value.length <= 50) {
      setAuthor(e.target.value);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <div className="chat-bubble-icon">💬</div>
          <div className="chat-info">
            <h1 className="chat-title">GraphPulse</h1>
            <div className="chat-status">
              <span className="status-dot"></span>
              <span className="status-text">Live chat • {messages.length} messages</span>
            </div>
          </div>
        </div>
        <button className="settings-btn" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* User Setup */}
      {!author && (
        <div className="user-setup">
          <div className="setup-card">
            <div className="setup-icon">👋</div>
            <h2 className="setup-title">Welcome to GraphPulse</h2>
            <p className="setup-description">Enter your name to join the conversation</p>
            
            <div className="setup-input-group">
              <div className="name-input-wrapper">
                <input
                  type="text"
                  className="name-input"
                  placeholder="Enter your full name (max 50 characters)"
                  value={author}
                  onChange={handleNameChange}
                  onKeyPress={(e) => e.key === 'Enter' && inputRef.current?.focus()}
                  autoFocus
                  maxLength={50}
                />
                <div className="name-counter">
                  {author.length}/50
                </div>
              </div>
              <button 
                className={`join-btn ${author.trim() ? 'active' : ''}`}
                onClick={() => inputRef.current?.focus()}
                disabled={!author.trim()}
              >
                Start Chatting
              </button>
            </div>
            <div className="name-hint">
              Your display name will be visible to all chat participants
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      {author && (
        <>
          <main className="messages-container" ref={messagesContainerRef}>
            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💭</div>
                  <h3 className="empty-title">No messages yet</h3>
                  <p className="empty-description">Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${isCurrentUser(message.author) ? 'own-message' : 'other-message'}`}
                  >
                    <div 
                      className="message-avatar" 
                      style={{ backgroundColor: getAvatarColor(message.author) }}
                    >
                      {message.author.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="message-bubble-container">
                      {!isCurrentUser(message.author) && (
                        <div className="message-header">
                          <span className="message-author" title={message.author}>
                            {message.author.length > 15 ? message.author.substring(0, 12) + '...' : message.author}
                          </span>
                          <span className="message-time">{formatTime(message.createdAt)}</span>
                        </div>
                      )}
                      
                      <div className={`message-bubble ${isCurrentUser(message.author) ? 'own' : 'other'}`}>
                        <div className="message-content" title={message.content}>
                          {message.content}
                        </div>
                        {isCurrentUser(message.author) && (
                          <div className="message-time own-time">
                            {formatTime(message.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {showScrollButton && (
              <button 
                className="scroll-to-bottom-btn"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
              >
                ↓
              </button>
            )}
          </main>

          {/* Input Area */}
          <footer className="input-container">
            <div className="input-wrapper">
              <div className="input-field">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="message-input"
                  rows={1}
                  maxLength={1000}
                  style={{ resize: 'none' }}
                />
                <div className="input-tail"></div>
              </div>
              
              {text.length > 0 && (
                <div className="input-counter">
                  {text.length}/1000
                </div>
              )}
              
              <button
                className={`send-button ${text.trim() ? 'active' : ''}`}
                onClick={send}
                disabled={!text.trim() || isTyping}
              >
                {isTyping ? (
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <svg className="send-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="input-hints">
              <span>Press Enter to send</span>
              <span>Shift + Enter for new line</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}