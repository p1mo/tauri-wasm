// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  constructor() {
    // @ts-expect-error field used by the IPC serializer
    this.__TAURI_CHANNEL_MARKER__ = true;
    this.#onmessage = () => {
    };
    this.#nextMessageId = 0;
    this.#pendingMessages = {};
    this.id = transformCallback(
      ({ message, id }) => {
        if (id === this.#nextMessageId) {
          this.#nextMessageId = id + 1;
          this.#onmessage(message);
          const pendingMessageIds = Object.keys(this.#pendingMessages);
          if (pendingMessageIds.length > 0) {
            let nextId = id + 1;
            for (const pendingId of pendingMessageIds.sort()) {
              if (parseInt(pendingId) === nextId) {
                const message2 = this.#pendingMessages[pendingId];
                delete this.#pendingMessages[pendingId];
                this.#onmessage(message2);
                nextId += 1;
              } else {
                break;
              }
            }
            this.#nextMessageId = nextId;
          }
        } else {
          this.#pendingMessages[id.toString()] = message;
        }
      }
    );
  }
  #onmessage;
  #nextMessageId;
  #pendingMessages;
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

// tauri-v2/tooling/api/src/image.ts
var Image = class _Image extends Resource {
  /**
   * Creates an Image from a resource ID. For internal use only.
   *
   * @ignore
   */
  constructor(rid) {
    super(rid);
  }
  /** Creates a new Image using RGBA data, in row-major order from top to bottom, and with specified width and height. */
  static async new(rgba, width, height) {
    return invoke("plugin:image|new", {
      rgba: transformImage(rgba),
      width,
      height
    }).then((rid) => new _Image(rid));
  }
  /**
   * Creates a new image using the provided bytes by inferring the file format.
   * If the format is known, prefer [@link Image.fromPngBytes] or [@link Image.fromIcoBytes].
   *
   * Only `ico` and `png` are supported (based on activated feature flag).
   *
   * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
   * To enable it, change your Cargo.toml file:
   * ```toml
   * [dependencies]
   * tauri = { version = "...", features = ["...", "image-png"] }
   * ```
   */
  static async fromBytes(bytes) {
    return invoke("plugin:image|from_bytes", {
      bytes: transformImage(bytes)
    }).then((rid) => new _Image(rid));
  }
  /**
   * Creates a new image using the provided path.
   *
   * Only `ico` and `png` are supported (based on activated feature flag).
   *
   * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
   * To enable it, change your Cargo.toml file:
   * ```toml
   * [dependencies]
   * tauri = { version = "...", features = ["...", "image-png"] }
   * ```
   */
  static async fromPath(path) {
    return invoke("plugin:image|from_path", { path }).then(
      (rid) => new _Image(rid)
    );
  }
  /** Returns the RGBA data for this image, in row-major order from top to bottom.  */
  async rgba() {
    return invoke("plugin:image|rgba", {
      rid: this.rid
    }).then((buffer) => new Uint8Array(buffer));
  }
  /** Returns the size of this image.  */
  async size() {
    return invoke("plugin:image|size", { rid: this.rid });
  }
};
function transformImage(image) {
  const ret = image == null ? null : typeof image === "string" ? image : image instanceof Uint8Array ? Array.from(image) : image instanceof ArrayBuffer ? Array.from(new Uint8Array(image)) : image instanceof Image ? image.rid : image;
  return ret;
}

// tauri-v2/tooling/api/src/tray.ts
var TrayIcon = class _TrayIcon extends Resource {
  constructor(rid, id) {
    super(rid);
    this.id = id;
  }
  /** Gets a tray icon using the provided id. */
  static async getById(id) {
    return invoke("plugin:tray|get_by_id", { id }).then(
      (rid) => rid ? new _TrayIcon(rid, id) : null
    );
  }
  /**
   * Removes a tray icon using the provided id from tauri's internal state.
   *
   * Note that this may cause the tray icon to disappear
   * if it wasn't cloned somewhere else or referenced by JS.
   */
  static async removeById(id) {
    return invoke("plugin:tray|remove_by_id", { id });
  }
  /**
   * Creates a new {@linkcode TrayIcon}
   *
   * #### Platform-specific:
   *
   * - **Linux:** Sometimes the icon won't be visible unless a menu is set.
   * Setting an empty {@linkcode Menu} is enough.
   */
  static async new(options) {
    if (options?.menu) {
      options.menu = [options.menu.rid, options.menu.kind];
    }
    if (options?.icon) {
      options.icon = transformImage(options.icon);
    }
    const handler = new Channel();
    if (options?.action) {
      handler.onmessage = options.action;
      delete options.action;
    }
    return invoke("plugin:tray|new", {
      options: options ?? {},
      handler
    }).then(([rid, id]) => new _TrayIcon(rid, id));
  }
  /**
   *  Sets a new tray icon. If `null` is provided, it will remove the icon.
   *
   * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
   * To enable it, change your Cargo.toml file:
   * ```toml
   * [dependencies]
   * tauri = { version = "...", features = ["...", "image-png"] }
   * ```
   */
  async setIcon(icon) {
    let trayIcon = null;
    if (icon) {
      trayIcon = transformImage(icon);
    }
    return invoke("plugin:tray|set_icon", { rid: this.rid, icon: trayIcon });
  }
  /**
   * Sets a new tray menu.
   *
   * #### Platform-specific:
   *
   * - **Linux**: once a menu is set it cannot be removed so `null` has no effect
   */
  async setMenu(menu) {
    if (menu) {
      menu = [menu.rid, menu.kind];
    }
    return invoke("plugin:tray|set_menu", { rid: this.rid, menu });
  }
  /**
   * Sets the tooltip for this tray icon.
   *
   * ## Platform-specific:
   *
   * - **Linux:** Unsupported
   */
  async setTooltip(tooltip) {
    return invoke("plugin:tray|set_tooltip", { rid: this.rid, tooltip });
  }
  /**
   * Sets the tooltip for this tray icon.
   *
   * ## Platform-specific:
   *
   * - **Linux:** The title will not be shown unless there is an icon
   * as well.  The title is useful for numerical and other frequently
   * updated information.  In general, it shouldn't be shown unless a
   * user requests it as it can take up a significant amount of space
   * on the user's panel.  This may not be shown in all visualizations.
   * - **Windows:** Unsupported
   */
  async setTitle(title) {
    return invoke("plugin:tray|set_title", { rid: this.rid, title });
  }
  /** Show or hide this tray icon. */
  async setVisible(visible) {
    return invoke("plugin:tray|set_visible", { rid: this.rid, visible });
  }
  /**
   * Sets the tray icon temp dir path. **Linux only**.
   *
   * On Linux, we need to write the icon to the disk and usually it will
   * be `$XDG_RUNTIME_DIR/tray-icon` or `$TEMP/tray-icon`.
   */
  async setTempDirPath(path) {
    return invoke("plugin:tray|set_temp_dir_path", { rid: this.rid, path });
  }
  /** Sets the current icon as a [template](https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc). **macOS only** */
  async setIconAsTemplate(asTemplate) {
    return invoke("plugin:tray|set_icon_as_template", {
      rid: this.rid,
      asTemplate
    });
  }
  /** Disable or enable showing the tray menu on left click. **macOS only**. */
  async setMenuOnLeftClick(onLeft) {
    return invoke("plugin:tray|set_show_menu_on_left_click", {
      rid: this.rid,
      onLeft
    });
  }
};
export {
  TrayIcon
};
