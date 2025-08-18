use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ConverterError {
    #[error("File not found: {path}")]
    FileNotFound { path: String },
    
    #[error("Unsupported file format: {format}")]
    UnsupportedFormat { format: String },
    
    #[error("Conversion failed: {message}")]
    ConversionFailed { message: String },
    
    #[error("IO error: {message}")]
    IoError { message: String },
    
    #[error("Markitdown command failed: {message}")]
    MarkitdownError { message: String },
    
    #[error("Invalid file path: {path}")]
    InvalidPath { path: String },
}

impl From<std::io::Error> for ConverterError {
    fn from(error: std::io::Error) -> Self {
        ConverterError::IoError {
            message: error.to_string(),
        }
    }
}

pub type Result<T> = std::result::Result<T, ConverterError>;
