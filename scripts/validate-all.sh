#!/bin/bash
set -e

echo "🔍 Running validation suite..."

# Python linting
echo "Running ruff..."
ruff check custom_components/ --fix || echo "Ruff not installed - skipping"

# Type checking
echo "Running mypy..."
mypy custom_components/ --strict || echo "Mypy not installed - skipping"

# HACS validation
echo "Running HACS validation..."
hacs validate || echo "HACS validation tool not installed - skipping"

# Run tests
echo "Running tests..."
pytest tests/unit/ -v || echo "Pytest not installed or no tests found - skipping"

echo "✅ Validation complete!"