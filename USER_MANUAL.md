# SpecValidator User Manual

## Overview

SpecValidator is an offline-first AI engineering assistant that converts loosely written markdown specifications into structured API schemas such as OpenAPI (Swagger) and dependency JSON files.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Supported Input Formats](#supported-input-formats)
4. [Output Formats](#output-formats)
5. [Using the Web Interface](#using-the-web-interface)
6. [Using the CLI](#using-the-cli)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Installation

### System Requirements

- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **RAM**: Minimum 8 GB (16 GB recommended)
- **Disk**: 5 GB free space (for model weights)

### Backend Installation

```bash
# Clone the repository
git clone https://code.swecha.org/saimanikanta777/specvalidator.git
cd specvalidator

# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download the Phi-4-mini model (required for AI inference)
python download_model.py
```

### Frontend Installation

```bash
cd frontend
npm install
```

---

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 2. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The web interface will open at `http://localhost:3000`

### 3. Process Your First Document

1. Open `http://localhost:3000` in your browser
2. Click "Choose File" and select a markdown specification file
3. Click "Validate & Convert"
4. Watch the real-time progress as sections are processed
5. Download the generated OpenAPI JSON or Swagger YAML

---

## Supported Input Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| Markdown | `.md` | Primary format, best results |
| Plain Text | `.txt` | Basic parsing |
| PDF | `.pdf` | Text extraction via pypdf |
| Word Document | `.docx`, `.doc` | Text extraction via python-docx |

### Input File Guidelines

For best results, structure your markdown with clear headers:

```markdown
# API Specification: User Management

## User Registration
Create a POST endpoint for user registration.

Fields:
- email (string, required)
- password (string, required)
- name (string, optional)

## User Login
Create a POST endpoint for user authentication.

Fields:
- email (string, required)
- password (string, required)
```

Each `##` header becomes a separate section processed in parallel.

---

## Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| OpenAPI JSON | Machine-readable API specification | CI/CD, tooling integration |
| Swagger YAML | Human-readable YAML format | Documentation, review |
| Dependency JSON | Internal dependency mapping | Architecture analysis |

### Example Output

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "User Management API",
    "version": "1.0.0"
  },
  "paths": {
    "/v1/users/register": {
      "post": {
        "summary": "User Registration",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": { "type": "string", "format": "email" },
                  "password": { "type": "string", "minLength": 8 },
                  "name": { "type": "string" }
                },
                "required": ["email", "password"]
              }
            }
          }
        },
        "responses": {
          "201": { "description": "User created" }
        }
      }
    }
  }
}
```

---

## Using the Web Interface

### Upload Page

1. **Drag & drop** or click to select a file
2. Supported formats: `.md`, `.txt`, `.pdf`, `.docx`, `.doc`
3. Maximum file size: 10 MB
4. Click "Validate & Convert" to start processing

### Progress Page

- Real-time SSE (Server-Sent Events) stream
- Shows per-section processing status
- Displays validation results (valid/invalid)
- Progress bar with section count

### Results Page

- **OpenAPI JSON** - Download complete specification
- **Swagger YAML** - Download YAML format
- **Statistics** - Sections processed, valid, failed
- **Endpoints List** - Summary of all generated endpoints

### Error Handling

- Invalid sections are skipped (not fatal)
- Errors shown per-section with details
- Partial results still available for download

---

## Using the CLI

### Process a File

```bash
cd backend
source venv/bin/activate
python cli.py --input ../specs/my-api.md --output ./output
```

### CLI Options

```bash
python cli.py --help

Options:
  --input PATH      Input file path (required)
  --output PATH     Output directory (default: ./output)
  --format FORMAT   Output format: json, yaml, both (default: both)
  --model PATH      Custom model path (default: auto-detect)
  --threads INT     Number of parallel workers (default: CPU cores / 2)
  --timeout INT     Per-section timeout in seconds (default: 120)
```

### Example

```bash
python cli.py \
  --input ../docs/api-spec.md \
  --output ./generated \
  --format both \
  --threads 4
```

---

## Configuration

### Model Configuration (`.specify/model-config.md`)

```markdown
Model: Microsoft Phi-4-mini-instruct
Runtime: llama.cpp
Quantization: Q4_K_M
Threads: 8
Context: 2048
Temperature: 0.2
Top_p: 0.9
Grammar: GBNF
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Model settings
MODEL_PATH=./models/phi-4-mini-instruct-q4_k_m.gguf
MODEL_THREADS=8
MODEL_CONTEXT=2048
MODEL_TEMPERATURE=0.2

# Server settings
HOST=0.0.0.0
PORT=8000
WORKERS=4

# File upload
MAX_FILE_SIZE=10485760  # 10 MB
ALLOWED_EXTENSIONS=.md,.txt,.pdf,.docx,.doc

# Logging
LOG_LEVEL=INFO
```

### Grammar Files

Custom GBNF grammars in `grammars/` directory:
- `endpoint.gbnf` - Default endpoint schema
- Add custom grammars for specific output formats

---

## Troubleshooting

### Model Not Found

```
Error: Model file not found at ./models/phi-4-mini-instruct-q4_k_m.gguf
```

**Solution**: Run `python download_model.py` in the backend directory.

### Out of Memory

```
Error: CUDA out of memory / llama.cpp allocation failed
```

**Solutions**:
- Reduce `MODEL_CONTEXT` to 1024
- Reduce `MODEL_THREADS` to 4
- Close other applications

### Port Already in Use

```
Error: [Errno 98] Address already in use
```

**Solution**: Change PORT in `.env` or kill existing process:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Frontend Build Errors

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### PDF/DOCX Parsing Issues

- Ensure file is not password-protected
- Try converting to `.md` or `.txt` first
- Check file size < 10 MB

---

## FAQ

### General

**Q: Does SpecValidator require internet access?**
A: No, it's fully offline-first. The model runs locally via llama.cpp.

**Q: What model does it use?**
A: Microsoft Phi-4-mini-instruct (3.8B parameters, Q4_K_M quantization).

**Q: Can I use a different model?**
A: Yes, any GGUF model compatible with llama.cpp. Update `MODEL_PATH` in `.env`.

**Q: What's the maximum document size?**
A: 10 MB upload limit. Large documents are split by headers and processed in parallel.

### Output Quality

**Q: Some endpoints are missing from output.**
A: Sections that fail validation are skipped. Check the progress page for errors.

**Q: Generated schema doesn't match my expectations.**
A: Ensure markdown uses clear headers (`##`) and explicit field descriptions.

**Q: Can I customize the output schema?**
A: Yes, modify `grammars/endpoint.gbnf` or create custom grammar files.

### Performance

**Q: Processing is slow.**
A: Increase `MODEL_THREADS` (up to CPU cores), reduce context size, or use smaller documents.

**Q: Can I run on GPU?**
A: Yes, install `llama-cpp-python` with GPU support: `pip install llama-cpp-python[cu121]`

### Integration

**Q: How do I integrate with CI/CD?**
A: Use the CLI in your pipeline:
```yaml
- name: Generate OpenAPI Spec
  run: |
    cd backend
    python cli.py --input docs/spec.md --output ./openapi --format json
```

**Q: Does it support GraphQL?**
A: Not yet. Planned for future release.

---

## Support

- **Issues**: [GitLab Issues](https://code.swecha.org/saimanikanta777/specvalidator/issues)
- **Documentation**: [README.md](README.md)
- **License**: AGPLv3

---

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.