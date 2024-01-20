//! # Tauri v2 wasm bindings
//! **Version:** 2.0.0-alpha-20


//use std::path::PathBuf;
use wasm_bindgen::JsValue;

/// # API bindings
/// 
/// Example
/// ```js, no_run
/// import { getName } from '@tauri-apps/api';
/// ```
/// 
pub mod api {
    /// # App bindings
    #[cfg(feature = "app")]
    pub mod app;
    /// # Core bindings
    #[cfg(feature = "core")]
    pub mod core;
    /// # Dpi bindings
    #[cfg(feature = "dpi")]
    pub mod dpi;
    /// # Event bindings
    #[cfg(feature = "event")]
    pub mod event;
    /// # Menu bindings
    #[cfg(feature = "menu")]
    pub mod menu;
    /// # Mocks bindings
    #[cfg(feature = "mocks")]
    pub mod mocks;
    /// # Path bindings
    #[cfg(feature = "path")]
    pub mod path;
    /// # Tray bindings
    #[cfg(feature = "tray")]
    pub mod tray;
    /// # Window bindings
    #[cfg(feature = "window")]
    pub mod window;
}

/// # Plugin bindings
pub mod plugin {
    /// # Authenticator bindings
    #[cfg(feature = "authenticator")]
    pub mod authenticator;
    /// # Autostart bindings
    #[cfg(feature = "autostart")]
    pub mod autostart;
    /// # Barcode Scanner bindings
    #[cfg(feature = "barcode-scanner")]
    pub mod barcode_scanner;
    /// # cli bindings
    #[cfg(feature = "cli")]
    pub mod cli;
    /// # Clipboard Manager bindings
    #[cfg(feature = "clipboard-manager")]
    pub mod clipboard_manager;
    /// # Deep Link bindings
    #[cfg(feature = "deep-link")]
    pub mod deep_link;
    /// # Dialog bindings
    #[cfg(feature = "dialog")]
    pub mod dialog;
    /// # FS bindings
    #[cfg(feature = "fs")]
    pub mod fs;
    /// # Global Shortcut bindings
    #[cfg(feature = "global-shortcut")]
    pub mod global_shortcut;
    /// # Http bindings
    #[cfg(feature = "http")]
    pub mod http;
    /// # Log bindings
    #[cfg(feature = "log")]
    pub mod log;
    /// # Notification bindings
    #[cfg(feature = "notification")]
    pub mod notification;
    /// # OS bindings
    #[cfg(feature = "os")]
    pub mod os;
    /// # Positioner bindings
    #[cfg(feature = "positioner")]
    pub mod positioner;
    /// # Process bindings
    #[cfg(feature = "process")]
    pub mod process;
    /// # Shell bindings
    #[cfg(feature = "shell")]
    pub mod shell;
    /// # Sql bindings
    #[cfg(feature = "sql")]
    pub mod sql;
    /// # Store bindings
    #[cfg(feature = "store")]
    pub mod store;
    /// # Stronghold bindings
    #[cfg(feature = "stronghold")]
    pub mod stronghold;
    /// # Updater bindings
    #[cfg(feature = "updater")]
    pub mod updater;
    /// # Upload bindings
    #[cfg(feature = "upload")]
    pub mod upload;
    /// # Websocket bindings
    #[cfg(feature = "websocket")]
    pub mod websocket;
    /// # Window State bindings
    #[cfg(feature = "window-state")]
    pub mod window_state;
}

/// # JS bindings like `console.log`, `console.error`
//#[cfg(feature = "js")]
pub mod js;



pub type Result<T> = core::result::Result<T, Error>;

#[derive(Clone, Eq, PartialEq, Debug, thiserror::Error)]
pub enum Error {
    #[error("Command returned Error: {0}")]
    Command(String),
    #[error("Failed to parse JSON: {0}")]
    Serde(String),
    #[cfg(any(feature = "event", feature = "window"))]
    #[error("Oneshot cancelled: {0}")]
    OneshotCanceled(#[from] futures::channel::oneshot::Canceled),
}

impl From<serde_wasm_bindgen::Error> for Error {
    fn from(e: serde_wasm_bindgen::Error) -> Self {
        Self::Serde(e.to_string())
    }
}

impl From<JsValue> for Error {
    fn from(e: JsValue) -> Self {
        Self::Command(format!("{:?}", e))
    }
}

#[cfg(any(feature = "dialog", feature = "window"))]
pub(crate) mod utils {
    pub struct ArrayIterator {
        pos: u32,
        arr: js_sys::Array,
    }

    impl ArrayIterator {
        pub fn new(arr: js_sys::Array) -> Self {
            Self { pos: 0, arr }
        }
    }

    impl Iterator for ArrayIterator {
        type Item = wasm_bindgen::JsValue;

        fn next(&mut self) -> Option<Self::Item> {
            let raw = self.arr.get(self.pos);

            if raw.is_undefined() {
                None
            } else {
                self.pos += 1;

                Some(raw)
            }
        }
    }
}