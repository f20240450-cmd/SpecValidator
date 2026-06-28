# Contributing to SpecValidator

Thank you for your interest in contributing to SpecValidator! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://code.swecha.org/saimanikanta777/specvalidator/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

1. Check existing issues for similar suggestions
2. Create a new issue with:
   - Clear title and description
   - Use case and motivation
   - Proposed solution (if any)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting (see below)
5. Commit with conventional commit messages
6. Push to your fork and submit a PR

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- llama.cpp (for local inference)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -e .[dev]
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Code Quality Standards

### Python

- Format: `ruff format .`
- Lint: `ruff check .`
- Type check: `mypy .`
- Test: `pytest`

### JavaScript/React

- Format: `npm run format`
- Lint: `npm run lint`
- Test: `npm test`

### Pre-commit Hooks

Install pre-commit hooks:

```bash
pre-commit install
```

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): add PDF parsing support
fix(frontend): resolve file upload issue
docs: update API documentation
```

## Testing

### Backend Tests

```bash
cd backend
pytest -v --cov=backend --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test -- --coverage --watchAll=false
```

## Documentation

- Update README.md for user-facing changes
- Update API docs for backend changes
- Add docstrings to new Python functions
- Update USER_MANUAL.md for new features

## License

By contributing, you agree that your contributions will be licensed under the AGPLv3 License.