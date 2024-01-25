//! Provides operating system-related utility methods and properties.
//! 

use serde::{Deserialize, Serialize};
//use std::path::PathBuf;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Arch {
    #[serde(rename = "x86")]
    X86,
    #[serde(rename = "x86_64")]
    X86_64,
    #[serde(rename = "arm")]
    Arm,
    #[serde(rename = "aarch64")]
    Aarch64,
    #[serde(rename = "mips")]
    Mips,
    #[serde(rename = "mips64")]
    Mips64,
    #[serde(rename = "powerpc")]
    Powerpc,
    #[serde(rename = "powerpc64")]
    Powerpc64,
    #[serde(rename = "riscv64")]
    Riscv64,
    #[serde(rename = "s390x")]
    S390x,
    #[serde(rename = "sparc64")]
    Sparc64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Platform {
    #[serde(rename = "linux")]
    Linux,
    #[serde(rename = "macos")]
    Macos,
    #[serde(rename = "ios")]
    Ios,
    #[serde(rename = "freebsd")]
    Freebsd,
    #[serde(rename = "dragonfly")]
    Dragonfly,
    #[serde(rename = "netbsd")]
    Netbsd,
    #[serde(rename = "openbsd")]
    Openbsd,
    #[serde(rename = "solaris")]
    Solaris,
    #[serde(rename = "android")]
    Android,
    #[serde(rename = "windows")]
    Windows,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum OsKind {
    #[serde(rename = "linux")]
    Linux,
    #[serde(rename = "windows")]
    Windows,
    #[serde(rename = "macos")]
    Macos,
    #[serde(rename = "ios")]
    Ios,
    #[serde(rename = "android")]
    Android,
}

/// Returns the operating system CPU architecture for which the tauri app was compiled.
#[inline(always)]
pub async fn arch() -> crate::Result<Arch> {
    let raw = base::arch().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system eol.
#[inline(always)]
pub async fn eol() -> crate::Result<String> {
    let raw = base::eol().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the binary extension.
#[inline(always)]
pub async fn exe_extension() -> crate::Result<String> {
    let raw = base::exe_extension().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system Family.
#[inline(always)]
pub async fn family() -> crate::Result<String> {
    let raw = base::family().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system Hostname.
#[inline(always)]
pub async fn hostname() -> crate::Result<String> {
    let raw = base::hostname().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system Local.
#[inline(always)]
pub async fn locale() -> crate::Result<String> {
    let raw = base::locale().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a string identifying the operating system platform. The value is set at compile time.
#[inline(always)]
pub async fn platform() -> crate::Result<Platform> {
    let raw = base::platform().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns [`OsKind::Linux`] on Linux, [`OsKind::Darwin`] on macOS, and [`OsKind::WindowsNT`] on Windows.
#[inline(always)]
pub async fn kind() -> crate::Result<OsKind> {
    let raw = base::kind().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a string identifying the kernel version.
#[inline(always)]
pub async fn version() -> crate::Result<String> {
    let raw = base::version().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/os.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn arch() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn eol() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "exeExtension")]
        pub async fn exe_extension() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn family() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn hostname() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn locale() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn platform() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "type")]
        pub async fn kind() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn version() -> Result<JsValue, JsValue>;
    }
}