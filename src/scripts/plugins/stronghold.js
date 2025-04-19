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
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/stronghold/guest-js/index.ts
var Location = class _Location {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
  static generic(vault, record) {
    return new _Location("Generic", {
      vault,
      record
    });
  }
  static counter(vault, counter) {
    return new _Location("Counter", {
      vault,
      counter
    });
  }
};
var ProcedureExecutor = class {
  constructor(procedureArgs) {
    this.procedureArgs = procedureArgs;
  }
  /**
   * Generate a SLIP10 seed for the given location.
   * @param outputLocation Location of the record where the seed will be stored.
   * @param sizeBytes The size in bytes of the SLIP10 seed.
   * @param hint The record hint.
   * @returns
   */
  async generateSLIP10Seed(outputLocation, sizeBytes) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "SLIP10Generate",
        payload: {
          output: outputLocation,
          sizeBytes
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
  /**
   * Derive a SLIP10 private key using a seed or key.
   * @param chain The chain path.
   * @param source The source type, either 'Seed' or 'Key'.
   * @param sourceLocation The source location, must be the `outputLocation` of a previous call to `generateSLIP10Seed` or `deriveSLIP10`.
   * @param outputLocation Location of the record where the private key will be stored.
   * @param hint The record hint.
   * @returns
   */
  async deriveSLIP10(chain, source, sourceLocation, outputLocation) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "SLIP10Derive",
        payload: {
          chain,
          input: {
            type: source,
            payload: sourceLocation
          },
          output: outputLocation
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
  /**
   * Store a BIP39 mnemonic.
   * @param mnemonic The mnemonic string.
   * @param outputLocation The location of the record where the BIP39 mnemonic will be stored.
   * @param passphrase The optional mnemonic passphrase.
   * @param hint The record hint.
   * @returns
   */
  async recoverBIP39(mnemonic, outputLocation, passphrase) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "BIP39Recover",
        payload: {
          mnemonic,
          passphrase,
          output: outputLocation
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
  /**
   * Generate a BIP39 seed.
   * @param outputLocation The location of the record where the BIP39 seed will be stored.
   * @param passphrase The optional mnemonic passphrase.
   * @param hint The record hint.
   * @returns
   */
  async generateBIP39(outputLocation, passphrase) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "BIP39Generate",
        payload: {
          output: outputLocation,
          passphrase
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
  /**
   * Gets the Ed25519 public key of a SLIP10 private key.
   * @param privateKeyLocation The location of the private key. Must be the `outputLocation` of a previous call to `deriveSLIP10`.
   * @returns A promise resolving to the public key hex string.
   *
   * @since 2.0.0
   */
  async getEd25519PublicKey(privateKeyLocation) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "PublicKey",
        payload: {
          type: "Ed25519",
          privateKey: privateKeyLocation
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
  /**
   * Creates a Ed25519 signature from a private key.
   * @param privateKeyLocation The location of the record where the private key is stored. Must be the `outputLocation` of a previous call to `deriveSLIP10`.
   * @param msg The message to sign.
   * @returns A promise resolving to the signature hex string.
   *
   * @since 2.0.0
   */
  async signEd25519(privateKeyLocation, msg) {
    return await invoke("plugin:stronghold|execute_procedure", {
      ...this.procedureArgs,
      procedure: {
        type: "Ed25519Sign",
        payload: {
          privateKey: privateKeyLocation,
          msg
        }
      }
    }).then((n) => Uint8Array.from(n));
  }
};
var Client = class {
  constructor(path, name) {
    this.path = path;
    this.name = name;
  }
  /**
   * Get a vault by name.
   * @param name
   * @param flags
   * @returns
   */
  getVault(name) {
    return new Vault(this.path, this.name, name);
  }
  getStore() {
    return new Store(this.path, this.name);
  }
};
var Store = class {
  constructor(path, client) {
    this.path = path;
    this.client = client;
  }
  async get(key) {
    return await invoke("plugin:stronghold|get_store_record", {
      snapshotPath: this.path,
      client: this.client,
      key
    }).then((v) => v && Uint8Array.from(v));
  }
  async insert(key, value, lifetime) {
    await invoke("plugin:stronghold|save_store_record", {
      snapshotPath: this.path,
      client: this.client,
      key,
      value,
      lifetime
    });
  }
  async remove(key) {
    return await invoke(
      "plugin:stronghold|remove_store_record",
      {
        snapshotPath: this.path,
        client: this.client,
        key
      }
    ).then((v) => v && Uint8Array.from(v));
  }
};
var Vault = class extends ProcedureExecutor {
  constructor(path, client, name) {
    super({
      snapshotPath: path,
      client,
      vault: name
    });
    this.path = path;
    this.client = client;
    this.name = name;
  }
  /**
   * Insert a record to this vault.
   * @param location The record location.
   * @param record  The record data.
   * @param recordHint The record hint.
   * @returns
   */
  async insert(recordPath, secret) {
    await invoke("plugin:stronghold|save_secret", {
      snapshotPath: this.path,
      client: this.client,
      vault: this.name,
      recordPath,
      secret
    });
  }
  /**
   * Remove a record from the vault.
   * @param location The record location.
   * @param gc Whether to additionally perform the gargage collection or not.
   * @returns
   */
  async remove(location) {
    await invoke("plugin:stronghold|remove_secret", {
      snapshotPath: this.path,
      client: this.client,
      vault: this.name,
      recordPath: location.payload.record
    });
  }
};
var Stronghold = class _Stronghold {
  /**
   * Initializes a stronghold.
   * If the snapshot path located at `path` exists, the password must match.
   * @param path
   * @param password
   */
  constructor(path) {
    this.path = path;
  }
  /**
   * Load the snapshot if it exists (password must match), or start a fresh stronghold instance otherwise.
   * @param password
   * @returns
   */
  static async load(path, password) {
    return await invoke("plugin:stronghold|initialize", {
      snapshotPath: path,
      password
    }).then(() => new _Stronghold(path));
  }
  /**
   * Remove this instance from the cache.
   */
  async unload() {
    await invoke("plugin:stronghold|destroy", {
      snapshotPath: this.path
    });
  }
  async loadClient(client) {
    return await invoke("plugin:stronghold|load_client", {
      snapshotPath: this.path,
      client
    }).then(() => new Client(this.path, client));
  }
  async createClient(client) {
    return await invoke("plugin:stronghold|create_client", {
      snapshotPath: this.path,
      client
    }).then(() => new Client(this.path, client));
  }
  /**
   * Persists the stronghold state to the snapshot.
   * @returns
   */
  async save() {
    await invoke("plugin:stronghold|save", {
      snapshotPath: this.path
    });
  }
};
export {
  Client,
  Location,
  Store,
  Stronghold,
  Vault
};
