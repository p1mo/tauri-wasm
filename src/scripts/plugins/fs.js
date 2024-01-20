// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  id;
  // @ts-expect-error field used by the IPC serializer
  __TAURI_CHANNEL_MARKER__ = true;
  #onmessage = () => {
  };
  constructor() {
    this.id = transformCallback((response) => {
      this.#onmessage(response);
    });
  }
  set onmessage(handler) {
    this.#onmessage = handler;
  }
  get onmessage() {
    return this.#onmessage;
  }
  toJSON() {
    return `__CHANNEL__:${this.id}`;
  }
};
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
var Resource = class {
  #rid;
  get rid() {
    return this.#rid;
  }
  constructor(rid) {
    this.#rid = rid;
  }
  /**
   * Destroys and cleans up this resource from memory.
   * **You should not call any method on this object anymore and should drop any reference to it.**
   */
  async close() {
    return invoke("plugin:resources|close", {
      rid: this.rid
    });
  }
};

// tauri-v2/tooling/api/src/path.ts
var BaseDirectory = /* @__PURE__ */ ((BaseDirectory2) => {
  BaseDirectory2[BaseDirectory2["Audio"] = 1] = "Audio";
  BaseDirectory2[BaseDirectory2["Cache"] = 2] = "Cache";
  BaseDirectory2[BaseDirectory2["Config"] = 3] = "Config";
  BaseDirectory2[BaseDirectory2["Data"] = 4] = "Data";
  BaseDirectory2[BaseDirectory2["LocalData"] = 5] = "LocalData";
  BaseDirectory2[BaseDirectory2["Document"] = 6] = "Document";
  BaseDirectory2[BaseDirectory2["Download"] = 7] = "Download";
  BaseDirectory2[BaseDirectory2["Picture"] = 8] = "Picture";
  BaseDirectory2[BaseDirectory2["Public"] = 9] = "Public";
  BaseDirectory2[BaseDirectory2["Video"] = 10] = "Video";
  BaseDirectory2[BaseDirectory2["Resource"] = 11] = "Resource";
  BaseDirectory2[BaseDirectory2["Temp"] = 12] = "Temp";
  BaseDirectory2[BaseDirectory2["AppConfig"] = 13] = "AppConfig";
  BaseDirectory2[BaseDirectory2["AppData"] = 14] = "AppData";
  BaseDirectory2[BaseDirectory2["AppLocalData"] = 15] = "AppLocalData";
  BaseDirectory2[BaseDirectory2["AppCache"] = 16] = "AppCache";
  BaseDirectory2[BaseDirectory2["AppLog"] = 17] = "AppLog";
  BaseDirectory2[BaseDirectory2["Desktop"] = 18] = "Desktop";
  BaseDirectory2[BaseDirectory2["Executable"] = 19] = "Executable";
  BaseDirectory2[BaseDirectory2["Font"] = 20] = "Font";
  BaseDirectory2[BaseDirectory2["Home"] = 21] = "Home";
  BaseDirectory2[BaseDirectory2["Runtime"] = 22] = "Runtime";
  BaseDirectory2[BaseDirectory2["Template"] = 23] = "Template";
  return BaseDirectory2;
})(BaseDirectory || {});

// tauri-plugins/plugins/fs/guest-js/index.ts
var SeekMode = /* @__PURE__ */ ((SeekMode2) => {
  SeekMode2[SeekMode2["Start"] = 0] = "Start";
  SeekMode2[SeekMode2["Current"] = 1] = "Current";
  SeekMode2[SeekMode2["End"] = 2] = "End";
  return SeekMode2;
})(SeekMode || {});
function parseFileInfo(r) {
  return {
    isFile: r.isFile,
    isDirectory: r.isDirectory,
    isSymlink: r.isSymlink,
    size: r.size,
    mtime: r.mtime != null ? new Date(r.mtime) : null,
    atime: r.atime != null ? new Date(r.atime) : null,
    birthtime: r.birthtime != null ? new Date(r.birthtime) : null,
    readonly: r.readonly,
    fileAttributes: r.fileAttributes,
    dev: r.dev,
    ino: r.ino,
    mode: r.mode,
    nlink: r.nlink,
    uid: r.uid,
    gid: r.gid,
    rdev: r.rdev,
    blksize: r.blksize,
    blocks: r.blocks
  };
}
var FileHandle = class extends Resource {
  constructor(rid) {
    super(rid);
  }
  /**
   * Reads up to `p.byteLength` bytes into `p`. It resolves to the number of
   * bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
   * encountered. Even if `read()` resolves to `n` < `p.byteLength`, it may
   * use all of `p` as scratch space during the call. If some data is
   * available but not `p.byteLength` bytes, `read()` conventionally resolves
   * to what is available instead of waiting for more.
   *
   * When `read()` encounters end-of-file condition, it resolves to EOF
   * (`null`).
   *
   * When `read()` encounters an error, it rejects with an error.
   *
   * Callers should always process the `n` > `0` bytes returned before
   * considering the EOF (`null`). Doing so correctly handles I/O errors that
   * happen after reading some bytes and also both of the allowed EOF
   * behaviors.
   *
   * @example
   * ```typescript
   * import { open, read, close, BaseDirectory } from "@tauri-apps/plugin-fs"
   * // if "$APP/foo/bar.txt" contains the text "hello world":
   * const file = await open("foo/bar.txt", { dir: BaseDirectory.App });
   * const buf = new Uint8Array(100);
   * const numberOfBytesRead = await file.read(buf); // 11 bytes
   * const text = new TextDecoder().decode(buf);  // "hello world"
   * await close(file.rid);
   * ```
   *
   * @since 2.0.0
   */
  async read(buffer) {
    if (buffer.byteLength === 0) {
      return 0;
    }
    const [data, nread] = await invoke("plugin:fs|read", {
      rid: this.rid,
      len: buffer.byteLength
    });
    buffer.set(data);
    return nread === 0 ? null : nread;
  }
  /**
   * Seek sets the offset for the next `read()` or `write()` to offset,
   * interpreted according to `whence`: `Start` means relative to the
   * start of the file, `Current` means relative to the current offset,
   * and `End` means relative to the end. Seek resolves to the new offset
   * relative to the start of the file.
   *
   * Seeking to an offset before the start of the file is an error. Seeking to
   * any positive offset is legal, but the behavior of subsequent I/O
   * operations on the underlying object is implementation-dependent.
   * It returns the number of cursor position.
   *
   * @example
   * ```typescript
   * import { open, seek, write, SeekMode, BaseDirectory } from '@tauri-apps/plugin-fs';
   *
   * // Given hello.txt pointing to file with "Hello world", which is 11 bytes long:
   * const file = await open('hello.txt', { read: true, write: true, truncate: true, create: true, dir: BaseDirectory.App });
   * await file.write(new TextEncoder().encode("Hello world"), { dir: BaseDirectory.App });
   *
   * // Seek 6 bytes from the start of the file
   * console.log(await file.seek(6, SeekMode.Start)); // "6"
   * // Seek 2 more bytes from the current position
   * console.log(await file.seek(2, SeekMode.Current)); // "8"
   * // Seek backwards 2 bytes from the end of the file
   * console.log(await file.seek(-2, SeekMode.End)); // "9" (e.g. 11-2)
   * ```
   *
   * @since 2.0.0
   */
  async seek(offset, whence) {
    return invoke("plugin:fs|seek", {
      rid: this.rid,
      offset,
      whence
    });
  }
  /**
   * Returns a {@linkcode FileInfo } for this file.
   *
   * @example
   * ```typescript
   * import { open, fstat, BaseDirectory } from '@tauri-apps/plugin-fs';
   * const file = await open("file.txt", { read: true, dir: BaseDirectory.App });
   * const fileInfo = await fstat(file.rid);
   * console.log(fileInfo.isFile); // true
   * ```
   *
   * @since 2.0.0
   */
  async stat() {
    const res = await invoke("plugin:fs|fstat", {
      rid: this.rid
    });
    return parseFileInfo(res);
  }
  /**
   * Truncates or extends this file, to reach the specified `len`.
   * If `len` is not specified then the entire file contents are truncated.
   *
   * @example
   * ```typescript
   * import { ftruncate, open, write, read, BaseDirectory } from '@tauri-apps/plugin-fs';
   *
   * // truncate the entire file
   * const file = await open("my_file.txt", { read: true, write: true, create: true, dir: BaseDirectory.App });
   * await ftruncate(file.rid);
   *
   * // truncate part of the file
   * const file = await open("my_file.txt", { read: true, write: true, create: true, dir: BaseDirectory.App });
   * await write(file.rid, new TextEncoder().encode("Hello World"));
   * await ftruncate(file.rid, 7);
   * const data = new Uint8Array(32);
   * await read(file.rid, data);
   * console.log(new TextDecoder().decode(data)); // Hello W
   * ```
   *
   * @since 2.0.0
   */
  async truncate(len) {
    return invoke("plugin:fs|ftruncate", {
      rid: this.rid,
      len
    });
  }
  /**
   * Writes `p.byteLength` bytes from `p` to the underlying data stream. It
   * resolves to the number of bytes written from `p` (`0` <= `n` <=
   * `p.byteLength`) or reject with the error encountered that caused the
   * write to stop early. `write()` must reject with a non-null error if
   * would resolve to `n` < `p.byteLength`. `write()` must not modify the
   * slice data, even temporarily.
   *
   * @example
   * ```typescript
   * import { open, write, close, BaseDirectory } from '@tauri-apps/plugin-fs';
   * const encoder = new TextEncoder();
   * const data = encoder.encode("Hello world");
   * const file = await open("bar.txt", { write: true, dir: BaseDirectory.App });
   * const bytesWritten = await write(file.rid, data); // 11
   * await close(file.rid);
   * ```
   *
   * @since 2.0.0
   */
  async write(data) {
    return invoke("plugin:fs|write", {
      rid: this.rid,
      data: Array.from(data)
    });
  }
};
async function create(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  const rid = await invoke("plugin:fs|create", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
  return new FileHandle(rid);
}
async function open(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  const rid = await invoke("plugin:fs|open", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
  return new FileHandle(rid);
}
async function copyFile(fromPath, toPath, options) {
  if (fromPath instanceof URL && fromPath.protocol !== "file:" || toPath instanceof URL && toPath.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|copy_file", {
    fromPath: fromPath instanceof URL ? fromPath.toString() : fromPath,
    toPath: toPath instanceof URL ? toPath.toString() : toPath,
    options
  });
}
async function mkdir(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|mkdir", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
}
async function readDir(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|read_dir", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
}
async function readFile(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  const arr = await invoke("plugin:fs|read_file", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
  return Uint8Array.from(arr);
}
async function readTextFile(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|read_text_file", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
}
async function readTextFileLines(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  const pathStr = path instanceof URL ? path.toString() : path;
  return Promise.resolve({
    path: pathStr,
    rid: null,
    async next() {
      if (!this.rid) {
        this.rid = await invoke("plugin:fs|read_text_file_lines", {
          path: pathStr,
          options
        });
      }
      const [line, done] = await invoke(
        "plugin:fs|read_text_file_lines_next",
        { rid: this.rid }
      );
      if (done)
        this.rid = null;
      return {
        value: done ? "" : line,
        done
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  });
}
async function remove(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|remove", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
}
async function rename(oldPath, newPath, options) {
  if (oldPath instanceof URL && oldPath.protocol !== "file:" || newPath instanceof URL && newPath.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|rename", {
    oldPath: oldPath instanceof URL ? oldPath.toString() : oldPath,
    newPath: newPath instanceof URL ? newPath.toString() : newPath,
    options
  });
}
async function stat(path, options) {
  const res = await invoke("plugin:fs|stat", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
  return parseFileInfo(res);
}
async function lstat(path, options) {
  const res = await invoke("plugin:fs|lstat", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
  return parseFileInfo(res);
}
async function truncate(path, len, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|truncate", {
    path: path instanceof URL ? path.toString() : path,
    len,
    options
  });
}
async function writeFile(path, data, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|write_file", {
    path: path instanceof URL ? path.toString() : path,
    data: Array.from(data),
    options
  });
}
async function writeTextFile(path, data, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|write_text_file", {
    path: path instanceof URL ? path.toString() : path,
    data,
    options
  });
}
async function exists(path, options) {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return invoke("plugin:fs|exists", {
    path: path instanceof URL ? path.toString() : path,
    options
  });
}
async function unwatch(rid) {
  await invoke("plugin:fs|unwatch", { rid });
}
async function watch(paths, cb, options) {
  const opts = {
    recursive: false,
    delayMs: 2e3,
    ...options
  };
  const watchPaths = Array.isArray(paths) ? paths : [paths];
  for (const path of watchPaths) {
    if (path instanceof URL && path.protocol !== "file:") {
      throw new TypeError("Must be a file URL.");
    }
  }
  const onEvent = new Channel();
  onEvent.onmessage = cb;
  const rid = await invoke("plugin:fs|watch", {
    paths: watchPaths.map((p) => p instanceof URL ? p.toString() : p),
    options: opts,
    onEvent
  });
  return () => {
    void unwatch(rid);
  };
}
async function watchImmediate(paths, cb, options) {
  const opts = {
    recursive: false,
    ...options,
    delayMs: null
  };
  const watchPaths = Array.isArray(paths) ? paths : [paths];
  for (const path of watchPaths) {
    if (path instanceof URL && path.protocol !== "file:") {
      throw new TypeError("Must be a file URL.");
    }
  }
  const onEvent = new Channel();
  onEvent.onmessage = cb;
  const rid = await invoke("plugin:fs|watch", {
    paths: watchPaths.map((p) => p instanceof URL ? p.toString() : p),
    options: opts,
    onEvent
  });
  return () => {
    void unwatch(rid);
  };
}
export {
  BaseDirectory,
  FileHandle,
  SeekMode,
  copyFile,
  create,
  exists,
  lstat,
  mkdir,
  open,
  readDir,
  readFile,
  readTextFile,
  readTextFileLines,
  remove,
  rename,
  stat,
  truncate,
  watch,
  watchImmediate,
  writeFile,
  writeTextFile
};
