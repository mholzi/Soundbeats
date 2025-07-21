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
   
   **⚠️ CRITICAL: Always perform ALL validation stages, especially:**
   - **Stage 2: Home Assistant Restart and Log Analysis** - This catches most integration errors
   - **Stage 3: Frontend Validation** - Ensures panel/UI actually works
   - **Never skip these steps or mark tasks complete without running them!**
   
   ### Stage 1: Static Analysis (Fast - ~30 seconds)
   - **Home Assistant Integration Structure Check**:
     ```bash
     # Create and run structure validation script
     cat > validate_structure.py << 'EOF'
import json, os, sys

def validate_structure():
    errors = []
    
    # Check manifest.json
    try:
        with open('custom_components/soundbeats/manifest.json') as f:
            manifest = json.load(f)
            if manifest.get('domain') != 'soundbeats':
                errors.append('Manifest domain mismatch')
            if not manifest.get('version'):
                errors.append('Manifest missing version')
    except Exception as e:
        errors.append(f'Manifest error: {e}')
    
    # Check required files
    required_files = [
        'custom_components/soundbeats/__init__.py',
        'custom_components/soundbeats/const.py',
        'hacs.json',
        'info.md',
        'README.md'
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            errors.append(f'Missing: {file}')
    
    return errors

errors = validate_structure()
if errors:
    print('❌ Validation failed:')
    for error in errors:
        print(f'  - {error}')
    sys.exit(1)
else:
    print('✅ Structure validation passed')
EOF

python3 validate_structure.py
rm validate_structure.py
     ```
   
   - **Python Syntax & Style Validation**:
     ```bash
     cd custom_components/soundbeats
     python3 -m py_compile *.py || echo "Syntax errors found"
     cd ../..
     ```
   
   - **Frontend Build Check** (if applicable):
     ```bash
     # Check if frontend build system exists
     if [ -f "custom_components/soundbeats/frontend/package.json" ]; then
         cd custom_components/soundbeats/frontend
         
         # TypeScript compilation check
         npx tsc --noEmit || echo "TypeScript errors found"
         
         # ESLint check (handle ES module config)
         npm run lint || echo "ESLint warnings/errors found"
         
         # Build frontend
         npm run build
         
         # Verify dist files exist
         ls -la dist/
         cd ../../..
     fi
     ```
   
   ### Stage 2: Home Assistant Restart and Log Analysis
   - **CRITICAL: Always restart HA and check logs**:
     ```bash
     # Check if using Docker
     if [ -f "docker-compose.yml" ]; then
         # Copy updated integration to container
         docker cp custom_components/soundbeats/. ha-dev:/config/custom_components/soundbeats/
         
         # Restart Home Assistant
         docker-compose restart homeassistant
         
         # Wait for HA to start (30-40 seconds)
         echo "Waiting for Home Assistant to start..."
         sleep 30
         
         # Check logs for soundbeats errors
         echo "Checking logs for errors..."
         docker logs ha-dev --tail 100 2>&1 | grep -E "soundbeats|error|ERROR" | tail -20
         
         # Check if integration loaded without errors
         if docker logs ha-dev --tail 200 2>&1 | grep -i "error.*soundbeats"; then
             echo "❌ Errors found in Home Assistant logs!"
             docker logs ha-dev --tail 200 2>&1 | grep -A 10 -B 5 "soundbeats"
         else
             echo "✅ No errors found in logs"
         fi
     else
         echo "⚠️  No Docker setup found - manual HA restart required"
     fi
     ```
   
   ### Stage 3: Frontend Validation
   - **Verify static files are served correctly**:
     ```bash
     # Test if panel JavaScript is accessible
     if curl -s http://localhost:8123/soundbeats_static/soundbeats-panel.js | head -1 > /dev/null; then
         echo "✅ Panel JavaScript is served"
         
         # Check bundle size
         size=$(curl -s http://localhost:8123/soundbeats_static/soundbeats-panel.js | wc -c)
         echo "   Bundle size: $size bytes"
         
         # Verify component is in bundle
         if curl -s http://localhost:8123/soundbeats_static/soundbeats-panel.js | grep -q "SoundbeatsPanel"; then
             echo "✅ SoundbeatsPanel component found in bundle"
         else
             echo "❌ SoundbeatsPanel component not found!"
         fi
         
         # Check if source map is served
         if curl -s -I http://localhost:8123/soundbeats_static/soundbeats-panel.js.map | grep -q "200 OK"; then
             echo "✅ Source map is accessible"
         fi
     else
         echo "❌ Panel JavaScript not accessible!"
     fi
     ```
   
   - **Browser Console Check** (if Puppeteer MCP available):
     ```bash
     # Note: Use Puppeteer MCP if available to:
     # 1. Navigate to http://localhost:8123
     # 2. Open browser developer console
     # 3. Check for JavaScript errors
     # 4. Navigate to /soundbeats panel
     # 5. Verify panel loads without console errors
     echo "💡 Use Puppeteer MCP to check browser console for errors"
     ```
   
   ### Stage 4: Integration-Specific Testing
   - **Test WebSocket API** (if implemented):
     ```bash
     # Test basic WebSocket status command if available
     curl -X GET http://localhost:8123/api/ 2>&1 | head -5
     ```
   
   - **Panel Load Test**:
     ```bash
     echo "📋 MANUAL PANEL TESTING CHECKLIST"
     echo "1. Open http://localhost:8123 in browser"
     echo "2. Look for 'Soundbeats' in the sidebar"
     echo "3. Click on Soundbeats panel"
     echo "4. Verify panel loads without errors"
     echo "5. Open browser console (F12) and check for errors"
     echo "6. Test any new features for this phase"
     ```
   
   ### Stage 5: Common Error Resolution
   - **If errors found, check for these common issues**:
     ```bash
     # API Changes (like async_register_static_paths)
     echo "Common fixes:"
     echo "- async_register_static_paths needs StaticPathConfig"
     echo "- Import: from homeassistant.components.http import StaticPathConfig"
     echo "- Usage: await hass.http.async_register_static_paths([StaticPathConfig(...)])"
     
     # Frontend path issues
     echo "- Static paths must point to actual directories"
     echo "- Built files must be committed for HACS"
     echo "- Check file permissions in Docker container"
     ```

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