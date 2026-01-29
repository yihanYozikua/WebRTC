// public/js/chat.js
// ES module
const URL = '/';
let socket = null;

// keep track of handlers so we can remove them if needed
const _handlers = new Map();

/**
 * Connect (idempotent)
 */
function connect() {
  if (!socket) {
    socket = io(URL);
  }
  return socket;
}

/**
 * Disconnect and clear handlers
 */
function disconnect() {
  if (!socket) {
    return;
  }
  socket.disconnect();
  socket = null;
  _handlers.clear();
}

/**
 * Register a handler and keep a reference so we can off() later
 * @param {string} event
 * @param {function} cb
 */
function on(event, cb) {
  connect().on(event, cb);
  if (!_handlers.has(event)) _handlers.set(event, new Set());
  _handlers.get(event).add(cb);
}

/**
 * Register a once handler
 */
function once(event, cb) {
  connect().once(event, cb);
  // do not add to _handlers (it's once)
}

/**
 * Remove a single handler or all handlers for an event
 */
function off(event, cb) {
  if (!socket) return;
  if (cb) {
    socket.off(event, cb);
    const s = _handlers.get(event);
    if (s) {
      s.delete(cb);
      if (s.size === 0) _handlers.delete(event);
    }
  } else {
    // remove all handlers for event
    const s = _handlers.get(event);
    if (s) {
      for (const fn of s) {
        socket.off(event, fn);
      }
      _handlers.delete(event);
    }
  }
}

/**
 * Emit wrapper
 */
function emit(event, payload) {
  connect().emit(event, payload);
}

/**
 * Bulk register: accept an object { eventName: handlerFn, ... }
 */
function registerHandlers(obj = {}) {
  Object.entries(obj).forEach(([event, fn]) => on(event, fn));
}

/**
 * Utility to get raw socket if needed (but prefer the wrapper methods)
 */
function getRawSocket() {
  return socket;
}

export default {
  connect,
  disconnect,
  on,
  once,
  off,
  emit,
  registerHandlers,
  getRawSocket
};
