// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/event.ts
var TauriEvent = /* @__PURE__ */ ((TauriEvent2) => {
  TauriEvent2["WINDOW_RESIZED"] = "tauri://resize";
  TauriEvent2["WINDOW_MOVED"] = "tauri://move";
  TauriEvent2["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
  TauriEvent2["WINDOW_CREATED"] = "tauri://window-created";
  TauriEvent2["WINDOW_DESTROYED"] = "tauri://destroyed";
  TauriEvent2["WINDOW_FOCUS"] = "tauri://focus";
  TauriEvent2["WINDOW_BLUR"] = "tauri://blur";
  TauriEvent2["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
  TauriEvent2["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
  TauriEvent2["WINDOW_FILE_DROP"] = "tauri://file-drop";
  TauriEvent2["WINDOW_FILE_DROP_HOVER"] = "tauri://file-drop-hover";
  TauriEvent2["WINDOW_FILE_DROP_CANCELLED"] = "tauri://file-drop-cancelled";
  return TauriEvent2;
})(TauriEvent || {});
async function _unlisten(event, eventId) {
  await invoke("plugin:event|unlisten", {
    event,
    eventId
  });
}
async function listen(event, handler, options) {
  return invoke("plugin:event|listen", {
    event,
    windowLabel: options?.target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}
async function once(event, handler, options) {
  return listen(
    event,
    (eventData) => {
      handler(eventData);
      _unlisten(event, eventData.id).catch(() => {
      });
    },
    options
  );
}
async function emit(event, payload, options) {
  await invoke("plugin:event|emit", {
    event,
    windowLabel: options?.target,
    payload
  });
}
export {
  TauriEvent,
  emit,
  listen,
  once
};
