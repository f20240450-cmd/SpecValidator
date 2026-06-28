# SpecValidator
### Legacy Markdown Specifications → Structured API Schemas

## Overview

SpecValidator is an offline-first AI engineering assistant that converts loosely written markdown specifications into structured API schemas such as OpenAPI (Swagger) and dependency JSON files.

Many organizations still maintain software requirements inside Markdown documents, Word files, or plain text. These documents are difficult to validate and frequently contain inconsistent API descriptions.

SpecValidator automatically analyzes these documents section by section and generates syntactically valid machine-readable specifications without requiring cloud services.

---

## Problem Statement

Engineering teams often receive documentation written by product managers or analysts in natural language.

Example:

- API descriptions
- Feature specifications
- Product requirement documents
- Legacy markdown documentation

These files usually lack:

- proper schema validation
- standardized API definitions
- structured configuration files

Manual conversion into OpenAPI specifications is slow and error-prone.

---

## Solution

SpecValidator transforms documentation into structured schemas by using a fully offline AI pipeline.

Workflow:

Markdown File
↓
Header-based Document Splitter
↓
Parallel Section Processing
↓
Phi-4-mini-instruct
↓
Grammar-Constrained JSON Generation
↓
Schema Validator
↓
Merged OpenAPI Specification

---

## Key Features

- Offline-first architecture
- CPU optimized inference
- Multi-threaded document processing
- Header-aware markdown parsing
- Grammar-constrained JSON generation (.gbnf)
- Automatic OpenAPI generation
- Dependency configuration generation
- JSON Schema validation

---

## Technical Stack

Frontend
- React

Backend
- Python
- FastAPI

AI
- Microsoft Phi-4-mini-instruct (3.8B)

Inference
- llama.cpp

Validation
- JSON Schema
- OpenAPI

Parser
- Markdown Parser
- Python AST

Deployment
- Local Desktop Application

---

## Architecture

Input Markdown

↓

Markdown Parser

↓

Section Splitter

↓

Parallel Workers

↓

Phi-4-mini

↓

Grammar Validator

↓

JSON Output

↓

Swagger Generator

---

## Example Output

Input

## User Registration

Create a POST endpoint for user registration.

Fields:
- email
- age

Output

```json
{
  "endpoint": "/v1/users/register",
  "http_method": "POST",
  "expected_parameters": [
    {
      "name": "email",
      "type": "string",
      "required": true
    },
    {
      "name": "age",
      "type": "integer",
      "required": false
    }
  ],
  "inferred_rate_limit": "100 requests/min"
}
```

---

## CPU Optimizations

- Section-wise inference
- Parallel processing
- Small context windows
- Quantized Phi-4 model
- Grammar constrained decoding
- Local inference only

---

## Future Enhancements

- Swagger UI generation
- YAML export
- GraphQL schema generation
- VS Code Extension
- CI/CD integration

---