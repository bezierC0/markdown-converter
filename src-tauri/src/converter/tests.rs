#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;
    use tempfile::TempDir;

    fn create_test_markdown_file(content: &str) -> (TempDir, PathBuf) {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.md");
        fs::write(&file_path, content).unwrap();
        (temp_dir, file_path)
    }

    fn create_test_word_file() -> (TempDir, PathBuf) {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.docx");
        // Create a minimal docx file (this would need actual docx content in real tests)
        fs::write(&file_path, b"fake docx content").unwrap();
        (temp_dir, file_path)
    }

    #[test]
    fn test_file_format_from_extension() {
        assert_eq!(FileFormat::from_extension("md").unwrap(), FileFormat::Markdown);
        assert_eq!(FileFormat::from_extension("markdown").unwrap(), FileFormat::Markdown);
        assert_eq!(FileFormat::from_extension("docx").unwrap(), FileFormat::Word);
        
        assert!(FileFormat::from_extension("txt").is_err());
        assert!(FileFormat::from_extension("pdf").is_err());
    }

    #[test]
    fn test_file_format_to_extension() {
        assert_eq!(FileFormat::Markdown.to_extension(), "md");
        assert_eq!(FileFormat::Word.to_extension(), "docx");
    }

    #[test]
    fn test_converter_factory_create_converter() {
        let converter = ConverterFactory::create_converter(
            FileFormat::Markdown,
            FileFormat::Word,
        );
        assert!(converter.is_ok());

        let converter = ConverterFactory::create_converter(
            FileFormat::Word,
            FileFormat::Markdown,
        );
        assert!(converter.is_ok());

        // Test unsupported conversion
        let converter = ConverterFactory::create_converter(
            FileFormat::Markdown,
            FileFormat::Markdown,
        );
        assert!(converter.is_err());
    }

    #[test]
    fn test_converter_factory_supported_conversions() {
        let conversions = ConverterFactory::get_supported_conversions();
        assert_eq!(conversions.len(), 2);
        assert!(conversions.contains(&(FileFormat::Markdown, FileFormat::Word)));
        assert!(conversions.contains(&(FileFormat::Word, FileFormat::Markdown)));
    }

    #[test]
    fn test_markdown_to_word_converter_supported_formats() {
        let converter = MarkdownToWordConverter;
        assert_eq!(converter.supported_input_format(), FileFormat::Markdown);
        assert_eq!(converter.supported_output_format(), FileFormat::Word);
    }

    #[test]
    fn test_word_to_markdown_converter_supported_formats() {
        let converter = WordToMarkdownConverter;
        assert_eq!(converter.supported_input_format(), FileFormat::Word);
        assert_eq!(converter.supported_output_format(), FileFormat::Markdown);
    }

    #[test]
    fn test_converter_file_not_found() {
        let converter = MarkdownToWordConverter;
        let non_existent_path = PathBuf::from("non_existent_file.md");
        let output_path = PathBuf::from("output.docx");
        
        let result = converter.convert(&non_existent_path, &output_path);
        assert!(result.is_err());
        
        if let Err(ConverterError::FileNotFound { path }) = result {
            assert!(path.contains("non_existent_file.md"));
        } else {
            panic!("Expected FileNotFound error");
        }
    }

    #[test]
    fn test_converter_creates_output_directory() {
        let (_temp_dir, input_path) = create_test_markdown_file("# Test\n\nHello world!");
        let temp_output_dir = TempDir::new().unwrap();
        let output_path = temp_output_dir.path().join("subdir").join("output.docx");
        
        let converter = MarkdownToWordConverter;
        
        // This test would fail in CI without markitdown installed, so we just test the directory creation logic
        // In a real test environment, you'd mock the Command execution
        assert!(!output_path.parent().unwrap().exists());
        
        // The converter should create the parent directory even if the conversion fails
        let _result = converter.convert(&input_path, &output_path);
        assert!(output_path.parent().unwrap().exists());
    }

    // Integration tests would go here, but they require markitdown to be installed
    // In a real project, you'd use mocking or have separate integration test suites
}
