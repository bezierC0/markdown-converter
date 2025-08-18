// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod converter;
mod error;
mod commands;

use commands::{
    convert_file,
    get_supported_formats,
    save_uploaded_file,
    cleanup_temp_files,
    check_markitdown_availability
};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            convert_file,
            get_supported_formats,
            save_uploaded_file,
            cleanup_temp_files,
            check_markitdown_availability
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
