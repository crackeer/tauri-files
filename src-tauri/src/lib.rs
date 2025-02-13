use tauri::Error as TauriError;
use std::{fmt::Debug, fs::File, io};
use serde::Serialize;
use std::{fs::read_dir, path::Path};
use readable::byte::Byte;
use std::io::{Read, Write};
use chrono::{DateTime, Utc};
#[cfg_attr(mobile, tauri::mobile_entry_point)]

#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    file_type: String,
    size : u64,
    human_size: String,
    create_at: String,
    modify_at: String,
    path : String,
}

#[tauri::command]
fn simple_read_dir(dir: String) -> Vec<FileInfo> {
    let mut list: Vec<FileInfo> = Vec::new();
    let entry = read_dir(dir);
    if entry.is_err() {
        return list;
    }
    for item in entry.unwrap().into_iter() {
        if let Err(_) = item {
            continue;
        }
       
        if let Ok(ref file) = item {
            let meta = file.metadata().unwrap();
            let mut tmp_file_info = FileInfo {
                name: String::from(""),
                file_type: String::from("file"),
                size: meta.len(),
                human_size: Byte::from(meta.len()).to_string(),
                create_at: String::from(""),
                modify_at: String::from(""),
                path : file.path().to_str().unwrap().to_string(),
            };
            
            if let Ok(value) = file.file_name().into_string() {
                tmp_file_info.name = value;
            }

            if meta.is_dir() {
                tmp_file_info.file_type = String::from("directory");
            }
            if let Ok(value) = meta.created() {
                let datetime: DateTime<Utc> = value.into();
                tmp_file_info.create_at = datetime.format("%Y-%m-%d %H:%M:%S").to_string();
            }
            if let Ok(value) = meta.modified() {
                let datetime: DateTime<Utc> = value.into();
                tmp_file_info.modify_at = datetime.format("%Y-%m-%d %H:%M:%S").to_string(); 
            }
            list.push(tmp_file_info);
        }
    }
    list
}

#[tauri::command]
fn delete_file_or_dir(path: &str) -> Result<(), TauriError> {
    let path = Path::new(path);
    let  result : io::Result<()>;
    if path.is_dir() {
        result = std::fs::remove_dir_all(path);
    } else {
        result = std::fs::remove_file(path);
    }
    if result.is_err() {
        return Err(TauriError::Io(result.err().unwrap())); 
    }
    Ok(())
}


pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![simple_read_dir, delete_file_or_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


