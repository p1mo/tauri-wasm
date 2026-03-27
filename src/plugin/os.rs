//! 
//! Version: **os-v2.0.0-rc.0**
//! 
//! link to plugin: [tauri-plugin-os](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/os)
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

impl Arch {
    pub fn as_str(&self) -> &str {
        match self {
            Arch::X86 => "x86",
            Arch::X86_64 => "x86_64",
            Arch::Arm => "arm",
            Arch::Aarch64 => "aarch64",
            Arch::Mips => "mips",
            Arch::Mips64 => "mips64",
            Arch::Powerpc => "powerpc",
            Arch::Powerpc64 => "powerpc64",
            Arch::Riscv64 => "riscv64",
            Arch::S390x => "s390x",
            Arch::Sparc64 => "sparc64",
        }
    }
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

impl Platform {
    pub fn as_str(&self) -> &str {
        match self {
            Platform::Linux => "linux",
            Platform::Macos => "macos",
            Platform::Ios => "ios",
            Platform::Freebsd => "freebsd",
            Platform::Dragonfly => "dragonfly",
            Platform::Netbsd => "netbsd",
            Platform::Openbsd => "openbsd",
            Platform::Solaris => "solaris",
            Platform::Android => "android",
            Platform::Windows => "windows",
        }
    }
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

impl OsKind {
    pub fn as_str(&self) -> &str {
        match self {
            OsKind::Linux => "linux",
            OsKind::Windows => "windows",
            OsKind::Macos => "macos",
            OsKind::Ios => "ios",
            OsKind::Android => "android",
        }
    }
}

/// Returns the operating system eol.
#[inline(always)]
pub fn eol() -> crate::Result<String> {
    let raw = base::eol()?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a string identifying the operating system platform. The value is set at compile time.
#[inline(always)]
pub fn platform() -> crate::Result<Platform> {
    let raw = base::platform()?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a string identifying the kernel version.
#[inline(always)]
pub fn version() -> crate::Result<String> {
    let raw = base::version()?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system Family.
#[inline(always)]
pub fn family() -> crate::Result<String> {
    let raw = base::family()?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns [`OsKind::Linux`] on Linux, [`OsKind::Darwin`] on macOS, and [`OsKind::WindowsNT`] on Windows.
#[inline(always)]
pub fn kind() -> crate::Result<OsKind> {
    let raw = base::kind()?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system CPU architecture for which the tauri app was compiled.
#[inline(always)]
pub fn arch() -> crate::Result<Arch> {
    let raw = base::arch()?;
    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the binary extension.
#[inline(always)]
pub fn exe_extension() -> crate::Result<String> {
    let raw = base::exe_extension()?;

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

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/os.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub fn eol() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub fn platform() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub fn version() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub fn family() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "type")]
        pub fn kind() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub fn arch() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "exeExtension")]
        pub fn exe_extension() -> Result<JsValue, JsValue>;
        
        #[wasm_bindgen(catch)]
        pub async fn locale() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn hostname() -> Result<JsValue, JsValue>;
    }
}