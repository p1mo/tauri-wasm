// tauri-v2/packages/api/src/mocks.ts
function mockInternals() {
  window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ ?? {};
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = window.__TAURI_EVENT_PLUGIN_INTERNALS__ ?? {};
}
function mockIPC(cb, options) {
  mockInternals();
  function isEventPluginInvoke(cmd) {
    return cmd.startsWith("plugin:event|");
  }
  function handleEventPlugin(cmd, args) {
    switch (cmd) {
      case "plugin:event|listen":
        return handleListen(args);
      case "plugin:event|emit":
        return handleEmit(args);
      case "plugin:event|unlisten":
        return handleRemoveListener(args);
    }
  }
  const listeners = /* @__PURE__ */ new Map();
  function handleListen(args) {
    if (!listeners.has(args.event)) {
      listeners.set(args.event, []);
    }
    listeners.get(args.event).push(args.handler);
    return args.handler;
  }
  function handleEmit(args) {
    const eventListeners = listeners.get(args.event) || [];
    for (const handler of eventListeners) {
      runCallback(handler, args);
    }
    return null;
  }
  function handleRemoveListener(args) {
    const eventListeners = listeners.get(args.event);
    if (eventListeners) {
      const index = eventListeners.indexOf(args.id);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  async function invoke(cmd, args, _options) {
    if (options?.shouldMockEvents && isEventPluginInvoke(cmd)) {
      return handleEventPlugin(cmd, args);
    }
    return cb(cmd, args);
  }
  const callbacks = /* @__PURE__ */ new Map();
  function registerCallback(callback, once = false) {
    const identifier = window.crypto.getRandomValues(new Uint32Array(1))[0];
    callbacks.set(identifier, (data) => {
      if (once) {
        unregisterCallback(identifier);
      }
      return callback && callback(data);
    });
    return identifier;
  }
  function unregisterCallback(id) {
    callbacks.delete(id);
  }
  function runCallback(id, data) {
    const callback = callbacks.get(id);
    if (callback) {
      callback(data);
    } else {
      console.warn(
        `[TAURI] Couldn't find callback id ${id}. This might happen when the app is reloaded while Rust is running an asynchronous operation.`
      );
    }
  }
  function unregisterListener(event, id) {
    unregisterCallback(id);
  }
  window.__TAURI_INTERNALS__.invoke = invoke;
  window.__TAURI_INTERNALS__.transformCallback = registerCallback;
  window.__TAURI_INTERNALS__.unregisterCallback = unregisterCallback;
  window.__TAURI_INTERNALS__.runCallback = runCallback;
  window.__TAURI_INTERNALS__.callbacks = callbacks;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener = unregisterListener;
}
function mockWindows(current, ..._additionalWindows) {
  mockInternals();
  window.__TAURI_INTERNALS__.metadata = {
    currentWindow: { label: current },
    currentWebview: { windowLabel: current, label: current }
  };
}
function mockConvertFileSrc(osName) {
  mockInternals();
  window.__TAURI_INTERNALS__.convertFileSrc = function(filePath, protocol = "asset") {
    const path = encodeURIComponent(filePath);
    return osName === "windows" ? `http://${protocol}.localhost/${path}` : `${protocol}://localhost/${path}`;
  };
}
function clearMocks() {
  if (typeof window.__TAURI_INTERNALS__ !== "object") {
    return;
  }
  delete window.__TAURI_INTERNALS__.invoke;
  delete window.__TAURI_INTERNALS__.transformCallback;
  delete window.__TAURI_INTERNALS__.unregisterCallback;
  delete window.__TAURI_INTERNALS__.runCallback;
  delete window.__TAURI_INTERNALS__.callbacks;
  delete window.__TAURI_INTERNALS__.convertFileSrc;
  delete window.__TAURI_INTERNALS__.metadata;
  if (typeof window.__TAURI_EVENT_PLUGIN_INTERNALS__ !== "object") {
    return;
  }
  delete window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener;
}
export {
  clearMocks,
  mockConvertFileSrc,
  mockIPC,
  mockWindows
};
