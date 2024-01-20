// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/authenticator/guest-js/index.ts
var Authenticator = class {
  async init() {
    return await invoke("plugin:authenticator|init_auth");
  }
  async register(challenge, application) {
    return await invoke("plugin:authenticator|register", {
      timeout: 1e4,
      challenge,
      application
    });
  }
  async verifyRegistration(challenge, application, registerData, clientData) {
    return await invoke("plugin:authenticator|verify_registration", {
      challenge,
      application,
      registerData,
      clientData
    });
  }
  async sign(challenge, application, keyHandle) {
    return await invoke("plugin:authenticator|sign", {
      timeout: 1e4,
      challenge,
      application,
      keyHandle
    });
  }
  async verifySignature(challenge, application, signData, clientData, keyHandle, pubkey) {
    return await invoke("plugin:authenticator|verify_signature", {
      challenge,
      application,
      signData,
      clientData,
      keyHandle,
      pubkey
    });
  }
};
export {
  Authenticator
};
