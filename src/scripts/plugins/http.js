// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/http/guest-js/index.ts
async function fetch(input, init) {
  const maxRedirections = init?.maxRedirections;
  const connectTimeout = init?.connectTimeout;
  const proxy = init?.proxy;
  if (init) {
    delete init.maxRedirections;
    delete init.connectTimeout;
    delete init.proxy;
  }
  const signal = init?.signal;
  const req = new Request(input, init);
  const buffer = await req.arrayBuffer();
  const reqData = buffer.byteLength ? Array.from(new Uint8Array(buffer)) : null;
  const rid = await invoke("plugin:http|fetch", {
    clientConfig: {
      method: req.method,
      url: req.url,
      headers: Array.from(req.headers.entries()),
      data: reqData,
      maxRedirections,
      connectTimeout,
      proxy
    }
  });
  signal?.addEventListener("abort", () => {
    invoke("plugin:http|fetch_cancel", {
      rid
    });
  });
  const {
    status,
    statusText,
    url,
    headers,
    rid: responseRid
  } = await invoke("plugin:http|fetch_send", {
    rid
  });
  const body = await invoke("plugin:http|fetch_read_body", {
    rid: responseRid
  });
  const res = new Response(new Uint8Array(body), {
    headers,
    status,
    statusText
  });
  Object.defineProperty(res, "url", { value: url });
  return res;
}
export {
  fetch
};
