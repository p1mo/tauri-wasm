// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/biometric/guest-js/index.ts
var BiometryType = /* @__PURE__ */ ((BiometryType2) => {
  BiometryType2[BiometryType2["None"] = 0] = "None";
  BiometryType2[BiometryType2["TouchID"] = 1] = "TouchID";
  BiometryType2[BiometryType2["FaceID"] = 2] = "FaceID";
  BiometryType2[BiometryType2["Iris"] = 3] = "Iris";
  return BiometryType2;
})(BiometryType || {});
async function checkStatus() {
  return invoke("plugin:biometric|status");
}
async function authenticate(reason, options) {
  return invoke("plugin:biometric|authenticate", {
    reason,
    ...options
  });
}
export {
  BiometryType,
  authenticate,
  checkStatus
};
