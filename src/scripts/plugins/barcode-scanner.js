// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/barcode-scanner/guest-js/index.ts
var Format = /* @__PURE__ */ ((Format2) => {
  Format2["QRCode"] = "QR_CODE";
  Format2["UPC_A"] = "UPC_A";
  Format2["UPC_E"] = "UPC_E";
  Format2["EAN8"] = "EAN_8";
  Format2["EAN13"] = "EAN_13";
  Format2["Code39"] = "CODE_39";
  Format2["Code93"] = "CODE_93";
  Format2["Code128"] = "CODE_128";
  Format2["Codabar"] = "CODABAR";
  Format2["ITF"] = "ITF";
  Format2["Aztec"] = "AZTEC";
  Format2["DataMatrix"] = "DATA_MATRIX";
  Format2["PDF417"] = "PDF_417";
  return Format2;
})(Format || {});
async function scan(options) {
  return await invoke("plugin:barcodeScanner|scan", { ...options });
}
async function cancel() {
  return await invoke("plugin:barcodeScanner|cancel");
}
async function checkPermissions() {
  return await invoke(
    "plugin:barcodeScanner|checkPermissions"
  ).then((r) => r.camera);
}
async function requestPermissions() {
  return await invoke(
    "plugin:barcodeScanner|requestPermissions"
  ).then((r) => r.camera);
}
async function openAppSettings() {
  return await invoke("plugin:barcodeScanner|openAppSettings");
}
export {
  Format,
  cancel,
  checkPermissions,
  openAppSettings,
  requestPermissions,
  scan
};
