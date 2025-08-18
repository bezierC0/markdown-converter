# Markdown Converter

A cross-platform desktop application for bidirectional conversion between Markdown and Word documents, built with Tauri (Rust + React).

## Features

- **Bidirectional Conversion**: Convert between Markdown (.md) and Word (.docx) formats
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Cross-Platform**: Supports macOS, Windows, and Linux
- **Drag & Drop**: Easy file selection with drag-and-drop support
- **Progress Tracking**: Real-time conversion progress indicators
- **Error Handling**: Comprehensive error reporting with troubleshooting tips
- **Strategy Pattern**: Extensible architecture for future format support

## Technology Stack

- **Framework**: Tauri (Rust backend + React frontend)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust with Tauri
- **Conversion Engine**: markitdown (Microsoft's open-source tool)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v16 or later)
2. **Rust** (latest stable version)
3. **markitdown** - Install via pip:
   ```bash
   pip install markitdown
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd markdown-converter
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install Rust dependencies (handled automatically by Cargo)

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the Vite development server and the Tauri application.

## Building

To build the application for production:

```bash
npm run build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle/` directory.

## Project Structure

```
markdown-converter/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── utils/             # Utility functions
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── src-tauri/             # Rust backend source
│   ├── src/
│   │   ├── converter.rs   # Conversion strategy implementations
│   │   ├── commands.rs    # Tauri command handlers
│   │   ├── error.rs       # Error handling
│   │   └── main.rs        # Rust application entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies and scripts
└── README.md             # This file
```

## Architecture

The application follows a modular, extensible architecture:

### Strategy Pattern
The conversion logic uses the Strategy pattern to encapsulate different conversion algorithms:

- `MarkdownToWordConverter`: Handles .md → .docx conversion
- `WordToMarkdownConverter`: Handles .docx → .md conversion
- `ConverterFactory`: Creates appropriate converter instances

### Frontend-Backend Communication
- Frontend communicates with Rust backend via Tauri's `invoke` API
- All file operations and conversions are handled securely in the Rust backend
- Error handling provides structured feedback to the UI

## Supported Formats

Currently supported file formats:

| Input Format | Output Format | Description |
|-------------|---------------|-------------|
| Markdown (.md) | Word (.docx) | Convert Markdown to Word document |
| Word (.docx) | Markdown (.md) | Convert Word document to Markdown |

## Error Handling

The application provides comprehensive error handling:

- File validation (format, existence, permissions)
- Conversion process errors
- User-friendly error messages
- Collapsible error details panel
- Troubleshooting tips

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Testing

Run the test suite:

```bash
# Frontend tests
npm test

# Rust tests
cd src-tauri && cargo test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [markitdown](https://github.com/microsoft/markitdown) - Microsoft's document conversion tool
- [Tauri](https://tauri.app/) - Framework for building desktop applications
- [Lucide](https://lucide.dev/) - Beautiful icon library
