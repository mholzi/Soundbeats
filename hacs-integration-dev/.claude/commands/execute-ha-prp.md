---
description: Implement a feature using PRP with comprehensive testing and error resolution
argument-hint: "Path to PRP file (e.g., PRPs/feature-name.prp.md)"
---

# Execute Enhanced PRP

Implement a feature using the PRP file with comprehensive testing and error resolution.

## PRP File: $ARGUMENTS

## Enhanced Execution Process

1. **Create Feature Branch & PR**
   - Create a new feature branch: `git checkout -b feature/[prp-name]`
   - Push initial branch: `git push -u origin feature/[prp-name]`
   - Create draft PR: `gh pr create --draft --title "[PRP] [feature-name]" --body "Implementation of [PRP file]"`
   - Note the PR number for tracking

2. **Load PRP**
   - Read the specified PRP file
   - Understand all context and requirements
   - Follow all instructions in the PRP and extend the research if needed
   - Ensure you have all needed context to implement the PRP fully
   - Do more web searches and codebase exploration as needed

3. **ULTRATHINK**
   - Think hard before you execute the plan. Create a comprehensive plan addressing all requirements.
   - Break down complex tasks into smaller, manageable steps using your todos tools.
   - Use the TodoWrite tool to create and track your implementation plan.
   - Identify implementation patterns from existing code to follow.

4. **Execute the plan**
   - Execute the PRP
   - Implement all the code
   - Commit changes regularly with descriptive messages
   
   **Create Automated Test Script**:
   - After implementation, create `test_integration_automated.py`:
     ```bash
     # The script is generated from the PRP validation section
     # It includes Docker checks, deployment, HA restart, and validation
     # See the PRP template for the full script content
     ```

5. **COMPREHENSIVE VALIDATION PIPELINE**
   
   ### Stage 1: Static Analysis (Fast - ~30 seconds)
   - **Home Assistant Integration Structure Check**:
     ```bash
     # Run the structure validation from PRP
     python3 -c "
import json, os, sys
errors = []

# Check manifest.json
try:
    with open('custom_components/soundbeats/manifest.json') as f:
        manifest = json.load(f)
        if not manifest.get('domain') or not manifest.get('version'):
            errors.append('Manifest incomplete')
except Exception as e:
    errors.append(f'Manifest error: {e}')

# Check required files
required_files = [
    'custom_components/soundbeats/__init__.py',
    'custom_components/soundbeats/const.py',
    'hacs.json', 'info.md', 'README.md'
]

for file in required_files:
    if not os.path.exists(file):
        errors.append(f'Missing: {file}')

if errors:
    print('❌ Validation failed:')
    for error in errors:
        print(f'  - {error}')
    sys.exit(1)
else:
    print('✅ Structure validation passed')
"
     ```
   
   - **Python Syntax & Style Validation**:
     ```bash
     cd custom_components/soundbeats
     python3 -m py_compile *.py || echo "Syntax errors found"
     # If available: ruff check . --fix
     # If available: mypy . --strict
     ```
   
   - **Frontend Build Check** (if applicable):
     - Check for frontend directory and validate JS files exist
     - Run: `npm run build` if package.json exists
     - Validate ES6 module structure
   
   ### Stage 2: Automated Integration Testing
   - **Run the automated test script**:
     ```bash
     # This script handles Docker deployment, HA restart, and validation
     python3 test_integration_automated.py
     ```
     
   - **What the script does**:
     - Checks if Docker/HA is running
     - Deploys integration to config directory
     - Restarts Home Assistant
     - Waits for HA to be ready
     - Checks logs for errors
     - Validates integration loaded successfully
   
   ### Stage 3: Additional Validation (if errors found)
   - **Log Analysis** (automated script already checked for errors):
     ```bash
     # Only run if Stage 2 found issues
     docker-compose logs --tail=200 homeassistant | grep -i "soundbeats\|error\|warning"
     ```
   
   - **Common Error Patterns to Check**:
     - Missing async decorators
     - Import errors (missing dependencies)
     - Entity registration failures
     - WebSocket connection issues
     - Frontend asset loading errors
   
   ### Stage 4: Manual Functional Testing
   - **Generate test checklist**:
     ```bash
     echo "📋 MANUAL TESTING CHECKLIST"
     echo "1. Access Home Assistant at http://localhost:8123"
     echo "2. Check integration in Settings > Integrations"
     echo "3. Verify panel in sidebar (if applicable)"
     echo "4. Test all new features for this phase"
     echo "5. Check browser console for errors"
     echo "6. Test persistence after HA restart"
     ```
   
   - **Phase-Specific Testing**:
     - Follow success criteria from the PRP
     - Test all deliverables mentioned in the phase
     - Verify responsive design works
     - Check WebSocket functionality (if applicable)

6. **ERROR RESOLUTION STRATEGY**
   
   When validation fails, use this systematic approach:
   
   - **Stage 1 Failures**: Fix syntax/structure issues immediately
   - **Stage 2-3 Failures**: Address integration loading and log errors
   - **Stage 4 Failures**: Fix functional and structural issues
   - **Stage 5-6 Failures**: Polish HACS compliance and edge cases
   
   **Error Grouping Examples**:
   - Async/await violations → Fix all blocking calls in async functions
   - Import errors → Fix all missing Home Assistant imports together
   - Entity setup errors → Standardize entity registration patterns
   - WebSocket issues → Fix all subscription and cleanup problems
   - Type hint errors → Add comprehensive typing throughout

7. **Complete & Merge PR**
   - Ensure all checklist items done
   - Run final validation suite (all stages)
   - Generate validation report
   - Read the PRP again to ensure you have implemented everything
   
   **Finalize PR & Merge**:
   - Commit final changes with comprehensive message
   - Update PR from draft to ready: `gh pr ready [PR-number]`
   - Update PR description with validation results and implementation summary
   - Merge to main: `gh pr merge [PR-number] --squash --delete-branch`
   - Confirm merge completed successfully
   - Report completion status with PR link

## Key Improvements:

1. **Staged Validation**: Fast feedback on syntax issues, comprehensive testing for integration
2. **HA Restart Testing**: Real-world integration loading validation
3. **Log Analysis**: Automated detection of Home Assistant specific issues
4. **Browser Testing**: Frontend validation with Puppeteer MCP
5. **Automated Test Scripts**: Structural error detection patterns
6. **HACS Compliance**: Ensure marketplace readiness

## Time Savings:

- **Before**: Multiple HA restart cycles + manual testing = 30-60 minutes
- **After**: Systematic validation pipeline = 10-20 minutes  
- **Improvement**: 50-70% time reduction

## Error Prevention:

- **Syntax errors**: Caught in Stage 1 (30 seconds vs HA restart)
- **Integration loading**: Caught in Stage 2-3 (2 minutes vs debugging)
- **Frontend errors**: Caught with browser automation
- **Structural issues**: Prevented with automated test scripts