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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="chat-container">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading messages…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="chat-container">
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Unable to load messages</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
        } 
      });
      setText('');
      inputRef.current?.focus();
    } catch (e) {
      console.error('Failed to send message:', e);
      // You could add a toast notification here
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
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isCurrentUser = (messageAuthor) => {
    return messageAuthor === author;
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h2>💬 GraphPulse Live Chat</h2>
          <span className="online-indicator">
            <span className="pulse"></span>
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* User Setup */}
      {!author && (
        <div className="user-setup">
          <div className="setup-content">
            <h3>Welcome to the chat!</h3>
            <p>Please enter your name to start chatting</p>
            <div className="name-input-group">
              <input
                type="text"
                placeholder="Enter your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && inputRef.current?.focus()}
                autoFocus
              />
              <button 
                onClick={() => inputRef.current?.focus()}
                disabled={!author.trim()}
              >
                Join Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${isCurrentUser(message.author) ? 'own-message' : 'other-message'}`}
            >
              <div className="message-bubble">
                {!isCurrentUser(message.author) && (
                  <div className="message-author">{message.author}</div>
                )}
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatTime(message.createdAt)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {author && (
        <div className="message-input-container">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              className="message-input"
            />
            <button
              onClick={send}
              disabled={!text.trim() || isTyping}
              className={`send-button ${text.trim() ? 'active' : ''}`}
            >
              {isTyping ? (
                <div className="sending-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      )}
    </div>
  );
}
