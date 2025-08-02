import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/constants';

class SocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000; // Start with 1 second
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(API_BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnect
        this.connect();
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectInterval *= 2; // Exponential backoff
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Message queued.');
      setTimeout(() => this.emit(event, data), 1000);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) return;
    
    // Store callback in listeners map
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    // Remove callback from listeners map
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    
    this.socket.off(event, callback);
  }
}

export default new SocketManager();
