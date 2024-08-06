// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/http/guest-js/index.ts
var ERROR_REQUEST_CANCELLED = "Request canceled";
async function fetch(input, init) {
  const signal = init?.signal;
  if (signal?.aborted) {
    throw new Error(ERROR_REQUEST_CANCELLED);
  }
  const maxRedirections = init?.maxRedirections;
  const connectTimeout = init?.connectTimeout;
  const proxy = init?.proxy;
  if (init) {
    delete init.maxRedirections;
    delete init.connectTimeout;
    delete init.proxy;
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
      proxy
    }
  });
  const abort = () => invoke("plugin:http|fetch_cancel", { rid });
  if (signal?.aborted) {
    abort();
    throw new Error(ERROR_REQUEST_CANCELLED);
  }
  signal?.addEventListener("abort", () => abort);
  const {
    status,
    statusText,
    url,
    headers: responseHeaders,
    rid: responseRid
  } = await invoke("plugin:http|fetch_send", {
    rid
  });
  const body = await invoke(
    "plugin:http|fetch_read_body",
    {
      rid: responseRid
    }
  );
  const res = new Response(
    body instanceof ArrayBuffer && body.byteLength !== 0 ? body : body instanceof Array && body.length > 0 ? new Uint8Array(body) : null,
    {
      status,
      statusText
    }
  );
  Object.defineProperty(res, "url", { value: url });
  Object.defineProperty(res, "headers", {
    value: new Headers(responseHeaders)
  });
  return res;
}
export {
  fetch
};
