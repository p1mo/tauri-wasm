// tauri-v2/tooling/api/src/mocks.ts
function mockIPC(cb) {
  window.__TAURI_INTERNALS__.ipc = async ({
    cmd,
    callback,
    error,
    payload
  }) => {
    try {
      window[`_${callback}`](await cb(cmd, payload));
    } catch (err) {
      window[`_${error}`](err);
    }
  };
}
function mockWindows(current, ...additionalWindows) {
  window.__TAURI_INTERNALS__.metadata = {
    windows: [current, ...additionalWindows].map((label) => ({ label })),
    currentWindow: { label: current }
  };
}
function mockConvertFileSrc(osName) {
  window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ ?? {};
  window.__TAURI_INTERNALS__.convertFileSrc = function(filePath, protocol = "asset") {
    const path = encodeURIComponent(filePath);
    return osName === "windows" ? `http://${protocol}.localhost/${path}` : `${protocol}://localhost/${path}`;
  };
}
function clearMocks() {
  if (typeof window.__TAURI_INTERNALS__ !== "object") {
    return;
  }
  delete window.__TAURI_INTERNALS__.convertFileSrc;
  delete window.__TAURI_INTERNALS__.ipc;
  delete window.__TAURI_INTERNALS__.metadata;
}
export {
  clearMocks,
  mockConvertFileSrc,
  mockIPC,
  mockWindows
};
