// tauri-v2/tooling/api/src/mocks.ts
function mockInternals() {
  window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ ?? {};
}
function mockIPC(cb) {
  mockInternals();
  window.__TAURI_INTERNALS__.transformCallback = function transformCallback(callback, once = false) {
    const identifier = window.crypto.getRandomValues(new Uint32Array(1))[0];
    const prop = `_${identifier}`;
    Object.defineProperty(window, prop, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: (result) => {
        if (once) {
          Reflect.deleteProperty(window, prop);
        }
        return callback && callback(result);
      },
      writable: false,
      configurable: true
    });
    return identifier;
  };
  window.__TAURI_INTERNALS__.invoke = function(cmd, args, options) {
    return cb(cmd, args);
  };
}
function mockWindows(current, ...additionalWindows) {
  mockInternals();
  window.__TAURI_INTERNALS__.metadata = {
    windows: [current, ...additionalWindows].map((label) => ({ label })),
    currentWindow: { label: current },
    webviews: [current, ...additionalWindows].map((label) => ({
      windowLabel: label,
      label
    })),
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
  if (window.__TAURI_INTERNALS__?.convertFileSrc)
    delete window.__TAURI_INTERNALS__.convertFileSrc;
  if (window.__TAURI_INTERNALS__?.invoke)
    delete window.__TAURI_INTERNALS__.invoke;
  if (window.__TAURI_INTERNALS__?.metadata)
    delete window.__TAURI_INTERNALS__.metadata;
}
export {
  clearMocks,
  mockConvertFileSrc,
  mockIPC,
  mockWindows
};
