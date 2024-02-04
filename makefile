tauri:
	git submodule add -f -b dev https://github.com/tauri-apps/tauri tauri-v2 && cd tauri-v2 && git checkout tags/tauri-v2.0.0-beta.1
plugins:
	git submodule add -f -b v2 https://github.com/tauri-apps/plugins-workspace tauri-plugins


sync:
	git submodule sync
update:
	git submodule update --init --recursive --remote


build:
	npm run build