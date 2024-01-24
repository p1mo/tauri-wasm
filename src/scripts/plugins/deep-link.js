// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/event.ts
async function _unlisten(event, eventId) {
  await invoke("plugin:event|unlisten", {
    event,
    eventId
  });
}
async function listen(event, handler, options) {
  return invoke("plugin:event|listen", {
    event,
    target: options?.target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}

// tauri-plugins/plugins/deep-link/guest-js/index.ts
async function getCurrent() {
  return await invoke("plugin:deep-link|get_current");
}
async function onOpenUrl(handler) {
  const current = await getCurrent();
  if (current != null) {
    handler(current);
  }
  return await listen(
    "deep-link://new-url",
    (event) => handler(event.payload)
  );
}
export {
  getCurrent,
  onOpenUrl
};
