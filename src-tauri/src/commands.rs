use crate::converter::{ConverterFactory, FileFormat};
use crate::error::{ConverterError, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle, Manager};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionRequest {
    pub input_path: String,
    pub output_path: String,
    pub input_format: Option<String>,
    pub output_format: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUploadRequest {
    pub file_name: String,
    pub file_data: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error: Option<String>,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupportedFormat {
    pub name: String,
    pub extension: String,
    pub description: String,
}

/// Tauri command to convert files between supported formats
#[command]
pub async fn convert_file(request: ConversionRequest) -> Result<ConversionResult> {
    let input_path = Path::new(&request.input_path);
    let output_path = Path::new(&request.output_path);

    // Validate input file exists
    if !input_path.exists() {
        return Ok(ConversionResult {
            success: false,
            output_path: None,
            error: Some("Input file not found".to_string()),
            message: format!("The file '{}' does not exist", request.input_path),
        });
    }

    // Determine input format from file extension if not provided
    let input_format = if let Some(format) = request.input_format {
        FileFormat::from_extension(&format).map_err(|e| e)?
    } else {
        let ext = input_path
            .extension()
            .and_then(|s| s.to_str())
            .ok_or_else(|| ConverterError::InvalidPath {
                path: request.input_path.clone(),
            })?;
        FileFormat::from_extension(ext)?
    };

    // Determine output format from file extension if not provided
    let output_format = if let Some(format) = request.output_format {
        FileFormat::from_extension(&format).map_err(|e| e)?
    } else {
        let ext = output_path
            .extension()
            .and_then(|s| s.to_str())
            .ok_or_else(|| ConverterError::InvalidPath {
                path: request.output_path.clone(),
            })?;
        FileFormat::from_extension(ext)?
    };

    // Create appropriate converter using factory pattern
    let converter = ConverterFactory::create_converter(input_format, output_format)?;

    // Ensure output directory exists
    if let Some(parent) = output_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // Perform conversion
    match converter.convert(input_path, output_path) {
        Ok(()) => Ok(ConversionResult {
            success: true,
            output_path: Some(request.output_path.clone()),
            error: None,
            message: format!(
                "Successfully converted {} to {}",
                request.input_path, request.output_path
            ),
        }),
        Err(e) => Ok(ConversionResult {
            success: false,
            output_path: None,
            error: Some(e.to_string()),
            message: format!("Conversion failed: {}", e),
        }),
    }
}

/// Tauri command to get supported file formats and conversions
#[command]
pub async fn get_supported_formats() -> Vec<SupportedFormat> {
    vec![
        SupportedFormat {
            name: "Markdown".to_string(),
            extension: "md".to_string(),
            description: "Markdown text files".to_string(),
        },
        SupportedFormat {
            name: "Word Document".to_string(),
            extension: "docx".to_string(),
            description: "Microsoft Word documents".to_string(),
        },
    ]
}

/// Tauri command to save uploaded file to temporary location
#[command]
pub async fn save_uploaded_file(
    app_handle: AppHandle,
    file_name: String,
    file_data: Vec<u8>,
) -> Result<String> {
    let app_dir = app_handle
        .path_resolver()
        .app_cache_dir()
        .ok_or_else(|| ConverterError::IoError {
            message: "Failed to get app cache directory".to_string(),
        })?;

    let temp_dir = app_dir.join("temp");
    fs::create_dir_all(&temp_dir)?;

    let file_path = temp_dir.join(&file_name);
    fs::write(&file_path, file_data)?;

    Ok(file_path.to_string_lossy().to_string())
}

/// Tauri command to clean up temporary files
#[command]
pub async fn cleanup_temp_files(app_handle: AppHandle) -> Result<()> {
    let app_dir = app_handle
        .path_resolver()
        .app_cache_dir()
        .ok_or_else(|| ConverterError::IoError {
            message: "Failed to get app cache directory".to_string(),
        })?;

    let temp_dir = app_dir.join("temp");
    if temp_dir.exists() {
        fs::remove_dir_all(temp_dir)?;
    }

    Ok(())
}

/// Tauri command to check if markitdown is available
#[command]
pub async fn check_markitdown_availability() -> bool {
    std::process::Command::new("markitdown")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}
