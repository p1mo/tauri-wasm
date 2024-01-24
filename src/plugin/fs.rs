//! Access the file system.
//!
//! The APIs must be added to `plugins.fs` in `tauri.conf.json`:
//! ```json
//! {
//!   "plugins": {
//!     "fs": {
//!       "all": true, // enable all FS APIs
//!       "readFile": true,
//!       "writeFile": true,
//!       "readDir": true,
//!       "copyFile": true,
//!       "createDir": true,
//!       "removeDir": true,
//!       "removeFile": true,
//!       "renameFile": true,
//!       "exists": true
//!     }
//!   }
//! }
//! ```
//!
use crate::Error;
use js_sys::ArrayBuffer;
use serde::{Deserialize, Serialize};
use serde_repr::*;
use std::path::{Path, PathBuf};
use std::str;

#[derive(Serialize_repr, Clone, PartialEq, Eq, Debug)]
#[repr(u16)]
pub enum BaseDirectory {
    Audio = 1,
    Cache = 2,
    Config = 3,
    Data = 4,
    LocalData = 5,
    Desktop = 6,
    Document = 7,
    Download = 8,
    Executable = 9,
    Font = 10,
    Home = 11,
    Picture = 12,
    Public = 13,
    Runtime = 14,
    Template = 15,
    Video = 16,
    Resource = 17,
    App = 18,
    Log = 19,
    Temp = 20,
    AppConfig = 21,
    AppData = 22,
    AppLocalData = 23,
    AppCache = 24,
    AppLog = 25,
}

#[derive(Deserialize, Clone, PartialEq, Debug)]
pub struct FileEntry {
    pub path: PathBuf,
    pub name: Option<String>,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Serialize, Clone, PartialEq, Debug)]
struct FsDirOptions {
    pub dir: Option<BaseDirectory>,
    pub recursive: Option<bool>,
}

#[derive(Serialize, Clone, PartialEq, Debug)]
struct FsOptions {
    pub dir: Option<BaseDirectory>,
}

#[derive(Serialize, Clone, PartialEq, Debug)]
struct FsTextFileOption {
    pub contents: String,
    path: PathBuf,
}

/// Copies a file to a destination.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::copy_file(source, destination, BaseDirectory::Download).expect("could not copy file");
/// ```
///
/// Requires [`plugins > fs > copyFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn copy_file(source: &Path, destination: &Path, dir: BaseDirectory) -> crate::Result<()> {
    let Some(source) = source.to_str() else {
        return Err(Error::Utf8(source.to_path_buf()));
    };

    let Some(destination) = destination.to_str() else {
        return Err(Error::Utf8(destination.to_path_buf()));
    };

    let raw = inner::copyFile(
        source,
        destination,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Creates a directory.
/// If one of the path's parent components doesn't exist the promise will be rejected.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::create_dir(dir, BaseDirectory::Download).expect("could not create directory");
/// ```
///
/// Requires [`plugins > fs > createDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn create_dir(dir: &Path, base_dir: BaseDirectory) -> crate::Result<()> {
    let recursive = Some(false);

    let Some(dir) = dir.to_str() else {
        return Err(Error::Utf8(dir.to_path_buf()));
    };

    Ok(inner::createDir(
        dir,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(base_dir),
            recursive,
        })?,
    )
    .await?)
}

/// Creates a directory recursively.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::create_dir_all(dir, BaseDirectory::Download).expect("could not create directory");
/// ```
///
/// Requires [`plugins > fs > createDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn create_dir_all(dir: &Path, base_dir: BaseDirectory) -> crate::Result<()> {
    let recursive = Some(true);

    let Some(dir) = dir.to_str() else {
        return Err(Error::Utf8(dir.to_path_buf()));
    };

    Ok(inner::createDir(
        dir,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(base_dir),
            recursive,
        })?,
    )
    .await?)
}

/// Checks if a path exists.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// let file_exists = fs::exists(path, BaseDirectory::Download).expect("could not check if path exists");
/// ```
///
/// Requires [`plugins > fs > exists`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn exists(path: &Path, dir: BaseDirectory) -> crate::Result<bool> {
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    let raw = inner::exists(
        path,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Reads a file as a byte array.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// let contents = fs::read_binary_file(filePath, BaseDirectory::Download).expect("could not read file contents");
/// ```
///
/// Requires [`plugins > fs > readBinaryFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn read_binary_file(path: &Path, dir: BaseDirectory) -> crate::Result<Vec<u8>> {
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    let raw = inner::readBinaryFile(
        path,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// List directory files.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// let files = fs::read_dir(path, BaseDirectory::Download).expect("could not read directory");
/// ```
///
/// Requires [`plugins > fs > readDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn read_dir(path: &Path, dir: BaseDirectory) -> crate::Result<Vec<FileEntry>> {
    let recursive = Some(false);
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    let raw = inner::readDir(
        path,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(dir),
            recursive,
        })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// List directory files recursively.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// let files = fs::read_dir_all(path, BaseDirectory::Download).expect("could not read directory");
/// ```
///
/// Requires [`plugins > fs > readDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn read_dir_all(path: &Path, dir: BaseDirectory) -> crate::Result<Vec<FileEntry>> {
    let recursive = Some(true);
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    let raw = inner::readDir(
        path,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(dir),
            recursive,
        })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Read a file as an UTF-8 encoded string.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// let contents = fs::readTextFile(path, BaseDirectory::Download).expect("could not read file as text");
/// ```
///
/// Requires [`plugins > fs > readTextFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn read_text_file(path: &Path, dir: BaseDirectory) -> crate::Result<String> {
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    let raw = inner::readTextFile(
        path,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Removes a directory.
/// If the directory is not empty the promise will be rejected.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::remove_dir(path, BaseDirectory::Download).expect("could not remove directory");
/// ```
///
/// Requires [`plugins > fs > removeDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn remove_dir(dir: &Path, base_dir: BaseDirectory) -> crate::Result<()> {
    let recursive = Some(false);
    let Some(dir) = dir.to_str() else {
        return Err(Error::Utf8(dir.to_path_buf()));
    };

    Ok(inner::removeDir(
        dir,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(base_dir),
            recursive,
        })?,
    )
    .await?)
}

/// Removes a directory and its contents.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::remove_dir_all(path, BaseDirectory::Download).expect("could not remove directory");
/// ```
///
/// Requires [`plugins > fs > removeDir`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn remove_dir_all(dir: &Path, base_dir: BaseDirectory) -> crate::Result<()> {
    let recursive = Some(true);
    let Some(dir) = dir.to_str() else {
        return Err(Error::Utf8(dir.to_path_buf()));
    };

    Ok(inner::removeDir(
        dir,
        serde_wasm_bindgen::to_value(&FsDirOptions {
            dir: Some(base_dir),
            recursive,
        })?,
    )
    .await?)
}

/// Removes a file.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::remove_file(path, BaseDirectory::Download).expect("could not remove file");
/// ```
///
/// Requires [`plugins > fs > removeFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn remove_file(file: &Path, dir: BaseDirectory) -> crate::Result<()> {
    let Some(file) = file.to_str() else {
        return Err(Error::Utf8(file.to_path_buf()));
    };

    Ok(inner::removeFile(
        file,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?)
}

/// Renames a file.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::rename_file(old_path, new_path, BaseDirectory::Download).expect("could not rename file");
/// ```
///
/// Requires [`plugins > fs > renameFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn rename_file(
    old_path: &Path,
    new_path: &Path,
    dir: BaseDirectory,
) -> crate::Result<()> {
    let Some(old_path) = old_path.to_str() else {
        return Err(Error::Utf8(old_path.to_path_buf()));
    };

    let Some(new_path) = new_path.to_str() else {
        return Err(Error::Utf8(new_path.to_path_buf()));
    };

    Ok(inner::renameFile(
        old_path,
        new_path,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?)
}

/// Writes a byte array content to a file.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::write_binary_file(path, contents, BaseDirectory::Download).expect("could not writes binary file");
/// ```
///
/// Requires [`plugins > fs > writeBinaryFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn write_binary_file(
    path: &Path,
    contents: ArrayBuffer,
    dir: BaseDirectory,
) -> crate::Result<()> {
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    Ok(inner::writeBinaryFile(
        path,
        contents,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?)
}

/// Writes a UTF-8 text file.
///
/// # Example
///
/// ```rust,no_run
/// use tauri_wasm::plugin::fs;
///
/// fs::write_text_file(path, contents, BaseDirectory::Download).expect("could not writes binary file");
/// ```
///
/// Requires [`plugins > fs > writeTextFile`](https://beta.tauri.app/features/file-system) to be enabled.
pub async fn write_text_file(path: &Path, contents: &str, dir: BaseDirectory) -> crate::Result<()> {
    let Some(path) = path.to_str() else {
        return Err(Error::Utf8(path.to_path_buf()));
    };

    Ok(inner::writeTextFile(
        path,
        &contents,
        serde_wasm_bindgen::to_value(&FsOptions { dir: Some(dir) })?,
    )
    .await?)
}

mod inner {
    use super::ArrayBuffer;
    use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

    #[wasm_bindgen(module = "/src/scripts/plugins/fs.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn copyFile(
            source: &str,
            destination: &str,
            options: JsValue,
        ) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn createDir(dir: &str, options: JsValue) -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn exists(path: &str, options: JsValue) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn readBinaryFile(filePath: &str, options: JsValue) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn readTextFile(filePath: &str, options: JsValue) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn readDir(dir: &str, options: JsValue) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn removeDir(dir: &str, options: JsValue) -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn removeFile(source: &str, options: JsValue) -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn renameFile(
            oldPath: &str,
            newPath: &str,
            options: JsValue,
        ) -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn writeBinaryFile(
            filePath: &str,
            contents: ArrayBuffer,
            options: JsValue,
        ) -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn writeTextFile(
            filePath: &str,
            contents: &str,
            options: JsValue,
        ) -> Result<(), JsValue>;
    }
}