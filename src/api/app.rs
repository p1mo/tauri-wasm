use semver::Version;

/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::api::app::get_name;
///     
/// let name = get_name().await;
/// ```
#[inline(always)]
pub async fn get_name() -> crate::Result<String> {
    let js_val = base::getName().await?;

    Ok(serde_wasm_bindgen::from_value(js_val)?)
}

/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::api::app::get_version;
///     
/// let version = get_version().await;
/// ```
#[inline(always)]
pub async fn get_version() -> crate::Result<Version> {
    let js_val = base::getVersion().await?;

    Ok(serde_wasm_bindgen::from_value(js_val)?)
}

/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::api::app:get_tauri_version;
///
/// let version = get_tauri_version().await;
/// ```
#[inline(always)]
pub async fn get_tauri_version() -> crate::Result<Version> {
    let js_val = base::getTauriVersion().await?;

    Ok(serde_wasm_bindgen::from_value(js_val)?)
}

/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::api::app::show;
///
/// show().await;
/// ```
///
#[inline(always)]
pub async fn show() -> crate::Result<()> {
    Ok(base::show().await?)
}

/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::api::app::hide;
///
/// hide().await;
/// ```
///
#[inline(always)]
pub async fn hide() -> crate::Result<()> {
    Ok(base::hide().await?)
}




mod base {
    use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

    #[wasm_bindgen(module = "/src/scripts/api/app.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn getName() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn getTauriVersion() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn getVersion() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn hide() -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn show() -> Result<(), JsValue>;
    }
}