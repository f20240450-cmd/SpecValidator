# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Spec Kit integration for specification-driven development
- opencode slash commands for SDD workflow
- CONTRIBUTING.md and USER_MANUAL.md documentation
- .editorconfig for consistent code style
- SECURITY.md with responsible disclosure policy
- CODE_OF_CONDUCT.md for community standards
- .env.example for environment configuration
- Dockerfile and .dockerignore for containerization
- AGPLv3 LICENSE file
- .pre-commit-config.yaml for automated quality checks
- GitLab CI pipeline for continuous integration
- pyproject.toml with quality tool configurations

## [1.0.0] - 2026-06-28

### Added
- Initial release of SpecValidator
- Offline-first AI pipeline for markdown to OpenAPI conversion
- Microsoft Phi-4-mini-instruct integration via llama.cpp
- Grammar-constrained JSON generation (GBNF)
- Parallel section processing with ThreadPoolExecutor
- FastAPI backend with SSE streaming
- React frontend with real-time progress
- Support for Markdown, Text, PDF, and DOCX inputs
- OpenAPI JSON and Swagger YAML output
- JSON Schema validation

### Fixed
- N/A (initial release)

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Security
- N/A (initial release)

---

## Release Format

Each release follows this structure:

```markdown
## [VERSION] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes
```

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

## Contributing to Changelog

When submitting a PR, add an entry under the appropriate section in `[Unreleased]`.
The maintainers will move entries to the appropriate version on release.