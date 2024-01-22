<h1 align="center">
    <code>tauri-wasm</code>
</h1>

<h3 align="center">
    <font>Raw bindings to the </font>
    <a href="https://beta.tauri.app/references/v2/js">Tauri v2</a>
    <font> API & Plugins </font>
</h3>

<div align="center">
    <a href="https://p1mo.github.io/tauri-wasm/tauri_wasm"><img src="https://img.shields.io/badge/docs-main-0084ff"></a>
    <img src="https://img.shields.io/badge/API_Version-2.0.0--alpha--20-24c620">
    <a href="/LICENSE"><img src="https://img.shields.io/badge/license-MIT-0084ff"></a>
    <a href="https://github.com/JonasKruckenberg/tauri-sys"><img src="https://img.shields.io/badge/v1_bindings-tauri__sys-d81fcd"></a>
</div>

### Cargo.toml

```toml
[dependencies]
tauri-wasm = { git = "https://github.com/p1mo/tauri-wasm", features = [
        "all", # for all api bindings
        "plugin-all" # for all plugin bindings. should you do this? no.
] }
```

### Usage

```rust
use tauri_wasm::api::app::{get_name, get_version};
use wasm_bindgen_futures::spawn_local;

fn main() {

    spawn_local(async move {

        let name: String = get_name().await.unwrap();
        let version: String = get_version().await.unwrap();

        println!("name: {}, version: {}", name, version);

    });

}
```

---

## Features

<table>
    <thead>
        <tr>
            <th width="500px">&nbsp;</th>
            <th width="500px">Feature</th>
            <th width="500px">Type</th>
            <th width="500px">Platform</th>
            <th width="500px">Tested</th>
            <th width="500px">Full</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>app</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>core</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>dpi</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>event</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>menu</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>mocks</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>path</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>tray</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>window</code></td>
            <td align="center"><code>api</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        <!-- PLUGINS -->
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>authenticator</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>autostart</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>barcode-scanner</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>biometric</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>cli</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>clipboard-manager</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>deep-link</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>dialog</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>fs</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>global-shortcut</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>http</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>log</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>nfc</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>notification</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>os</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>positioner</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>process</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>shell</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>sql</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>store</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>stronghold</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>updater</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>upload</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>websocket</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr>
            <td align="center"><ul><li> [ ] </li></ul></td>
            <td><code>window-state</code></td>
            <td align="center"><code>plugin</code></td>
            <td align="center"><code>desktop</code></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
        <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        <!-- JS CORE -->
        <tr>
            <td align="center"><ul><li> [x] </li></ul></td>
            <td><code>console</code></td>
            <td align="center"><code>core</code></td>
            <td align="center"><code>desktop</code>&nbsp;<code>mobile</code></td>
            <td align="center"><img src="https://img.shields.io/badge/YES-24C620"></td>
            <td align="center"><img src="https://img.shields.io/badge/NO-526D82"></td>
        </tr>
    </tbody>
</table>

### `console` Example

```rust
use tauri_wasm::js::console;
    
fn main() {

    console::log("Something to log.");

}
```

---

## Tauri v1 API

go to: https://github.com/JonasKruckenberg/tauri-sys