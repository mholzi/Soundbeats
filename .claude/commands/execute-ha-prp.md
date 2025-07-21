# Execute Home Assistant PRP

You are tasked with implementing a Home Assistant integration based on a PRP.

## Steps:
1. Read the PRP file: `$ARGUMENTS`
2. Create a detailed task list using TodoWrite
3. Implement each component following the PRP blueprint
4. Run validation after each major component
5. Fix any issues found during validation
6. Ensure all success criteria are met

## Validation Commands:
- Lint: `ruff check custom_components/ --fix`
- Type check: `mypy custom_components/ --strict`
- HACS: `hacs validate`
- Tests: `pytest tests/`

Execute the implementation with validation loops.