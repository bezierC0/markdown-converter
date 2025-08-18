use crate::error::{ConverterError, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileFormat {
    Markdown,
    Word,
}

impl FileFormat {
    pub fn from_extension(ext: &str) -> Result<Self> {
        match ext.to_lowercase().as_str() {
            "md" | "markdown" => Ok(FileFormat::Markdown),
            "docx" => Ok(FileFormat::Word),
            _ => Err(ConverterError::UnsupportedFormat {
                format: ext.to_string(),
            }),
        }
    }

    pub fn to_extension(&self) -> &'static str {
        match self {
            FileFormat::Markdown => "md",
            FileFormat::Word => "docx",
        }
    }
}

#[cfg(test)]
mod tests;

/// Strategy pattern trait for different conversion implementations
pub trait Converter {
    fn convert(&self, input_path: &Path, output_path: &Path) -> Result<()>;
    fn supported_input_format(&self) -> FileFormat;
    fn supported_output_format(&self) -> FileFormat;
}

/// Converter from Markdown to Word using markitdown
pub struct MarkdownToWordConverter;

impl Converter for MarkdownToWordConverter {
    fn convert(&self, input_path: &Path, output_path: &Path) -> Result<()> {
        // Validate input file exists
        if !input_path.exists() {
            return Err(ConverterError::FileNotFound {
                path: input_path.to_string_lossy().to_string(),
            });
        }

        // Ensure output directory exists
        if let Some(parent) = output_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| ConverterError::IoError {
                message: format!("Failed to create output directory: {}", e),
            })?;
        }

        // Execute markitdown command
        let output = Command::new("markitdown")
            .arg(input_path.to_string_lossy().as_ref())
            .arg("--format")
            .arg("docx")
            .arg("-o")
            .arg(output_path.to_string_lossy().as_ref())
            .output()
            .map_err(|e| ConverterError::MarkitdownError {
                message: format!("Failed to execute markitdown: {}. Make sure markitdown is installed and available in PATH.", e),
            })?;

        if !output.status.success() {
            let error_msg = String::from_utf8_lossy(&output.stderr);
            let stdout_msg = String::from_utf8_lossy(&output.stdout);
            return Err(ConverterError::ConversionFailed {
                message: format!(
                    "Markitdown conversion failed.\nStderr: {}\nStdout: {}",
                    error_msg,
                    stdout_msg
                ),
            });
        }

        // Verify output file was created
        if !output_path.exists() {
            return Err(ConverterError::ConversionFailed {
                message: "Output file was not created successfully".to_string(),
            });
        }

        Ok(())
    }

    fn supported_input_format(&self) -> FileFormat {
        FileFormat::Markdown
    }

    fn supported_output_format(&self) -> FileFormat {
        FileFormat::Word
    }
}

/// Converter from Word to Markdown using markitdown
pub struct WordToMarkdownConverter;

impl Converter for WordToMarkdownConverter {
    fn convert(&self, input_path: &Path, output_path: &Path) -> Result<()> {
        // Validate input file exists
        if !input_path.exists() {
            return Err(ConverterError::FileNotFound {
                path: input_path.to_string_lossy().to_string(),
            });
        }

        // Ensure output directory exists
        if let Some(parent) = output_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| ConverterError::IoError {
                message: format!("Failed to create output directory: {}", e),
            })?;
        }

        // Execute markitdown command
        let output = Command::new("markitdown")
            .arg(input_path.to_string_lossy().as_ref())
            .arg("--format")
            .arg("markdown")
            .arg("-o")
            .arg(output_path.to_string_lossy().as_ref())
            .output()
            .map_err(|e| ConverterError::MarkitdownError {
                message: format!("Failed to execute markitdown: {}. Make sure markitdown is installed and available in PATH.", e),
            })?;

        if !output.status.success() {
            let error_msg = String::from_utf8_lossy(&output.stderr);
            let stdout_msg = String::from_utf8_lossy(&output.stdout);
            return Err(ConverterError::ConversionFailed {
                message: format!(
                    "Markitdown conversion failed.\nStderr: {}\nStdout: {}",
                    error_msg,
                    stdout_msg
                ),
            });
        }

        // Verify output file was created
        if !output_path.exists() {
            return Err(ConverterError::ConversionFailed {
                message: "Output file was not created successfully".to_string(),
            });
        }

        Ok(())
    }

    fn supported_input_format(&self) -> FileFormat {
        FileFormat::Word
    }

    fn supported_output_format(&self) -> FileFormat {
        FileFormat::Markdown
    }
}

/// Factory for creating appropriate converters
pub struct ConverterFactory;

impl ConverterFactory {
    pub fn create_converter(
        input_format: FileFormat,
        output_format: FileFormat,
    ) -> Result<Box<dyn Converter>> {
        match (input_format, output_format) {
            (FileFormat::Markdown, FileFormat::Word) => {
                Ok(Box::new(MarkdownToWordConverter))
            }
            (FileFormat::Word, FileFormat::Markdown) => {
                Ok(Box::new(WordToMarkdownConverter))
            }
            _ => Err(ConverterError::UnsupportedFormat {
                format: format!("{:?} to {:?}", input_format, output_format),
            }),
        }
    }

    pub fn get_supported_conversions() -> Vec<(FileFormat, FileFormat)> {
        vec![
            (FileFormat::Markdown, FileFormat::Word),
            (FileFormat::Word, FileFormat::Markdown),
        ]
    }
}
