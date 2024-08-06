//! 
//! Version: **barcode-scanner-v2.0.0-rc.0**
//! 
//! link to plugin: [tauri-plugin-barcode-scanner](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/barcode-scanner)
//!

use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum PermissionState {
    #[serde(rename = "granted")]
    Granted,
    #[serde(rename = "denied")]
    Denied,
    #[serde(rename = "prompt")]
    Prompt,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Format {
    #[serde(rename = "QR_CODE")]
    QRCode,
    #[serde(rename = "UPC_A")]
    UPCA,
    #[serde(rename = "UPC_E")]
    UPCE,
    #[serde(rename = "EAN_8")]
    EAN8,
    #[serde(rename = "EAN_13")]
    EAN13,
    #[serde(rename = "CODE_39")]
    Code39,
    #[serde(rename = "CODE_93")]
    Code93,
    #[serde(rename = "CODE_128")]
    Code128,
    #[serde(rename = "CODABAR")]
    Codabar,
    #[serde(rename = "ITF")]
    ITF,
    #[serde(rename = "AZTEC")]
    Aztec,
    #[serde(rename = "DATA_MATRIX")]
    DataMatrix,
    #[serde(rename = "PDF_417")]
    PDF417,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CameraDirection {
    #[serde(rename = "back")]
    Back,
    #[serde(rename = "front")]
    Front,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub struct ScanOptions {
    camera_direction: Option<CameraDirection>,
    formats: Option<Format>,
    windowed: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Scanned {
    content: String,
    format: Format,
    //bounds: unimplemented!(),
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn cancel() -> crate::Result<()> {
    let raw = base::cancel().await?;

    Ok(raw)
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn check_permissions() -> crate::Result<()> {
    let raw = base::check_permissions().await?;

    Ok(raw)
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn open_app_settings() -> crate::Result<bool> {
    let raw = base::open_app_settings().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn request_permissions() -> crate::Result<bool> {
    let raw = base::request_permissions().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns a bool checking if autostart is enabled.
//#[inline(always)]
//pub async fn scan() -> crate::Result<bool> {
//    let raw = base::scan().await?;
//
//    Ok(serde_wasm_bindgen::from_value(raw)?)
//}

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/barcode-scanner.js")]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "cancel")]
        pub async fn cancel() -> Result<(), JsValue>;
        #[wasm_bindgen(catch, js_name = "checkPermissions")]
        pub async fn check_permissions() -> Result<(), JsValue>;
        #[wasm_bindgen(catch, js_name = "openAppSettings")]
        pub async fn open_app_settings() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "requestPermissions")]
        pub async fn request_permissions() -> Result<JsValue, JsValue>;
        //#[wasm_bindgen(catch, js_name = "scan")]
        //pub async fn scan(options : ScanOptions) -> Result<JsValue, JsValue>;
    }
}