# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Do not** create a public issue for security vulnerabilities.

Instead, please report security issues by emailing:
- **Email**: momulasaimanikanta6@gmail.com
- **Subject**: `[SECURITY] SpecValidator - Brief Description`

Include the following information:
1. **Description** of the vulnerability
2. **Steps to reproduce** (if applicable)
3. **Potential impact** assessment
4. **Suggested fix** (if you have one)
5. Your **contact information** for follow-up

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Development**: Within 30 days (for critical issues)
- **Public Disclosure**: After fix is released (coordinated)

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   ```bash
   # Python
   pip install --upgrade -r backend/requirements.txt
   
   # Node.js
   cd frontend && npm audit fix
   ```

2. **Use Official Releases**
   - Download only from official repository
   - Verify checksums when available

3. **Run in Isolated Environment**
   - Use virtual environments (venv/conda)
   - Consider Docker for production
   - Limit network access if not needed

4. **Model Security**
   - Only use trusted GGUF models
   - Verify model checksums
   - Do not load models from untrusted sources

### For Developers

1. **Dependency Scanning**
   - Run `pip-audit` or `uv audit` regularly
   - Run `npm audit` for frontend
   - Monitor GitLab/GitHub security advisories

2. **Code Review**
   - All changes require review
   - Security-focused review for auth/input handling
   - No secrets in code (use .env.example)

3. **Static Analysis**
   - Run Bandit for Python security issues
   - Run Semgrep for pattern-based detection
   - ESLint security rules for frontend

4. **Secrets Management**
   - Never commit API keys, tokens, passwords
   - Use `.env` files (not committed)
   - Rotate secrets regularly

## Known Security Considerations

### Local AI Model Execution

- Model runs locally via llama.cpp (no network calls)
- Model file must be trusted (supply chain risk)
- CPU-only inference by default (no GPU attack surface)

### File Upload Handling

- Maximum file size: 10 MB
- Allowed extensions: .md, .txt, .pdf, .docx, .doc
- Temporary files cleaned up after processing
- No executable content execution

### API Security

- CORS configured for local development only
- No authentication in current version (local-first)
- Rate limiting not implemented (single-user local app)
- SSE endpoints for progress streaming only

### Data Privacy

- All processing happens locally
- No telemetry or analytics
- No data leaves the machine
- Temporary files deleted after processing

## Security Checklist for Releases

- [ ] Dependency audit passed
- [ ] Static analysis (Bandit, Semgrep) clean
- [ ] No secrets in codebase
- [ ] File upload validation tested
- [ ] Model integrity verified
- [ ] Changelog includes security notes

## Disclosure Policy

1. **Private Disclosure**: Report via email
2. **Coordination**: We work with reporter on fix timeline
3. **Public Disclosure**: After fix released (typically 30-90 days)
4. **Credit**: Reporters credited in security advisory (if desired)

## Contact

- **Security Email**: momulasaimanikanta6@gmail.com
- **PGP Key**: Available on request
- **Response Time**: 48 hours acknowledgment

---

*This security policy is based on best practices and may be updated. Last updated: 2026-06-28*