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
    window.__TAURI_INTERNALS__.unregisterCallback(this.id);
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

// tauri-plugins/plugins/http/guest-js/index.ts
var ERROR_REQUEST_CANCELLED = "Request cancelled";
async function fetch(input, init) {
  const signal = init?.signal;
  if (signal?.aborted) {
    throw new Error(ERROR_REQUEST_CANCELLED);
  }
  const maxRedirections = init?.maxRedirections;
  const connectTimeout = init?.connectTimeout;
  const proxy = init?.proxy;
  const danger = init?.danger;
  if (init) {
    delete init.maxRedirections;
    delete init.connectTimeout;
    delete init.proxy;
    delete init.danger;
  }
  const headers = init?.headers ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
  const req = new Request(input, init);
  const buffer = await req.arrayBuffer();
  const data = buffer.byteLength !== 0 ? Array.from(new Uint8Array(buffer)) : null;
  for (const [key, value] of req.headers) {
    if (!headers.get(key)) {
      headers.set(key, value);
    }
  }
  const headersArray = headers instanceof Headers ? Array.from(headers.entries()) : Array.isArray(headers) ? headers : Object.entries(headers);
  const mappedHeaders = headersArray.map(
    ([name, val]) => [
      name,
      // we need to ensure we have all header values as strings
      // eslint-disable-next-line
      typeof val === "string" ? val : val.toString()
    ]
  );
  if (signal?.aborted) {
    throw new Error(ERROR_REQUEST_CANCELLED);
  }
  const rid = await invoke("plugin:http|fetch", {
    clientConfig: {
      method: req.method,
      url: req.url,
      headers: mappedHeaders,
      data,
      maxRedirections,
      connectTimeout,
      proxy,
      danger
    }
  });
  const abort = () => invoke("plugin:http|fetch_cancel", { rid });
  if (signal?.aborted) {
    abort();
    throw new Error(ERROR_REQUEST_CANCELLED);
  }
  signal?.addEventListener("abort", () => void abort());
  const {
    status,
    statusText,
    url,
    headers: responseHeaders,
    rid: responseRid
  } = await invoke("plugin:http|fetch_send", {
    rid
  });
  const dropBody = () => {
    return invoke("plugin:http|fetch_cancel_body", { rid: responseRid });
  };
  const readChunk = async (controller) => {
    let data2;
    try {
      data2 = await invoke("plugin:http|fetch_read_body", {
        rid: responseRid
      });
    } catch (e) {
      controller.error(e);
      void dropBody();
      return;
    }
    const dataUint8 = new Uint8Array(data2);
    const lastByte = dataUint8[dataUint8.byteLength - 1];
    const actualData = dataUint8.slice(0, dataUint8.byteLength - 1);
    if (lastByte === 1) {
      controller.close();
      return;
    }
    controller.enqueue(actualData);
  };
  const body = [101, 103, 204, 205, 304].includes(status) ? null : new ReadableStream({
    start: (controller) => {
      signal?.addEventListener("abort", () => {
        controller.error(ERROR_REQUEST_CANCELLED);
        void dropBody();
      });
    },
    pull: (controller) => readChunk(controller),
    cancel: () => {
      void dropBody();
    }
  });
  const res = new Response(body, {
    status,
    statusText
  });
  Object.defineProperty(res, "url", { value: url });
  Object.defineProperty(res, "headers", {
    value: new Headers(responseHeaders)
  });
  return res;
}
export {
  fetch
};
