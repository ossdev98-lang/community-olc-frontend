import { io } from 'socket.io-client';

let socket = null;
const joinedConversations = new Set();

const socketOrigin = (import.meta.env.VITE_API_BASE || 'https://community-olc-backend.onrender.com/api')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

export const socketService = {
  connect: (token, onConnect, onDisconnect, onNewMessage, onNewInquiry, onNewQuotation, onContactShared, onTyping, onStopTyping, onPresence) => {
    if (socket) return socket;
    socket = io(socketOrigin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('connect', () => {
      joinedConversations.forEach((conversationId) => socket.emit('join_conversation', { conversationId }));
      onConnect && onConnect();
    });
    socket.on('disconnect', () => { onDisconnect && onDisconnect(); });
    socket.on('presence', (data) => onPresence && onPresence(data));
    socket.on('new_message', (data) => onNewMessage && onNewMessage(data));
    socket.on('new_inquiry', (data) => onNewInquiry && onNewInquiry(data));
    socket.on('new_quotation', (data) => onNewQuotation && onNewQuotation(data));
    socket.on('contact_shared', (data) => onContactShared && onContactShared(data));
    socket.on('typing', (data) => onTyping && onTyping(data));
    socket.on('stop_typing', (data) => onStopTyping && onStopTyping(data));
    return socket;
  },
  joinConversation: (conversationId) => {
    joinedConversations.add(conversationId);
    if (socket?.connected) socket.emit('join_conversation', { conversationId });
  },
  leaveConversation: (conversationId) => {
    joinedConversations.delete(conversationId);
    if (socket?.connected) socket.emit('leave_conversation', { conversationId });
  },
  typing: (conversationId, userId, userName) => { if (socket) socket.emit('typing', { conversationId, userId, userName }); },
  stopTyping: (conversationId, userId) => { if (socket) socket.emit('stop_typing', { conversationId, userId }); },
  disconnect: () => { joinedConversations.clear(); if (socket) { socket.disconnect(); socket = null; } },
  getSocket: () => socket,
};
