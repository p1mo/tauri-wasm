// tauri-v2/packages/api/src/core.ts
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  /** The callback id returned from {@linkcode transformCallback} */
  id;
  #onmessage;
  // the index is used as a mechanism to preserve message order
  #nextMessageIndex = 0;
  #pendingMessages = [];
  #messageEndIndex;
  constructor(onmessage) {
    this.#onmessage = onmessage || (() => {
    });
    this.id = transformCallback((rawMessage) => {
      const index = rawMessage.index;
      if ("end" in rawMessage) {
        if (index == this.#nextMessageIndex) {
          this.cleanupCallback();
        } else {
          this.#messageEndIndex = index;
        }
        return;
      }
      const message = rawMessage.message;
      if (index == this.#nextMessageIndex) {
        this.#onmessage(message);
        this.#nextMessageIndex += 1;
        while (this.#nextMessageIndex in this.#pendingMessages) {
          const message2 = this.#pendingMessages[this.#nextMessageIndex];
          this.#onmessage(message2);
          delete this.#pendingMessages[this.#nextMessageIndex];
          this.#nextMessageIndex += 1;
        }
        if (this.#nextMessageIndex === this.#messageEndIndex) {
          this.cleanupCallback();
        }
      } else {
        this.#pendingMessages[index] = message;
      }
    });
  }
  cleanupCallback() {
    Reflect.deleteProperty(window, `_${this.id}`);
  }
  set onmessage(handler) {
    this.#onmessage = handler;
  }
  get onmessage() {
    return this.#onmessage;
  }
  [SERIALIZE_TO_IPC_FN]() {
    return `__CHANNEL__:${this.id}`;
  }
  toJSON() {
    return this[SERIALIZE_TO_IPC_FN]();
  }
};
async function checkPermissions(plugin) {
  return invoke(`plugin:${plugin}|check_permissions`);
}
async function requestPermissions(plugin) {
  return invoke(`plugin:${plugin}|request_permissions`);
}
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
  return await invoke("plugin:barcode-scanner|scan", { ...options });
}
async function cancel() {
  await invoke("plugin:barcode-scanner|cancel");
}
async function checkPermissions2() {
  return await checkPermissions(
    "barcode-scanner"
  ).then((r) => r.camera);
}
async function requestPermissions2() {
  return await requestPermissions(
    "barcode-scanner"
  ).then((r) => r.camera);
}
async function openAppSettings() {
  await invoke("plugin:barcode-scanner|open_app_settings");
}
export {
  Format,
  cancel,
  checkPermissions2 as checkPermissions,
  openAppSettings,
  requestPermissions2 as requestPermissions,
  scan
};
