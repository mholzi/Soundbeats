---
description: Generate a complete PRP (Product Requirements Prompt) for feature implementation
argument-hint: "(optional) Path to feature file, or leave empty to select from requirements"
---

# Create PRP

## Requirements Selection Process

1. **Check for Requirements Files**
   - First, check if any argument was provided: $ARGUMENTS
   - If no argument provided or argument is empty:
     - List all .md files in the `/requirements/` folder
     - Present them in a numbered list format
     - Ask user to select one (and only one) by number
     - Wait for user response before proceeding
   - If argument provided:
     - Use the specified feature file path

## Feature file: Selected from above process

Generate a complete PRP for general feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement. Read the selected feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assuma the AI agent has access to the codebase and the same knowledge cutoff as you, so its important that your research findings are included or referenced in the PRP. The Agent has Websearch capabilities, so pass urls to documentation and examples.

## Research Process

1. **Codebase Analysis**
   - Search for similar features/patterns in the codebase
   - Identify files to reference in PRP
   - Note existing conventions to follow
   - Check test patterns for validation approach

2. **External Research**
   - **HACS Documentation**: https://hacs.xyz/docs/ (integration requirements, validation rules)
   - **Home Assistant Developer Documentation**: https://developers.home-assistant.io/ (core patterns, best practices)
   - **Home Assistant Community**: https://community.home-assistant.io/ (real-world examples, troubleshooting)
   - Search for similar features/patterns online
   - Library documentation (include specific URLs)
   - Implementation examples (GitHub/StackOverflow/blogs)
   - Best practices and common pitfalls

3. **User Clarification** (if needed)
   - Specific patterns to mirror and where to find them?
   - Integration requirements and where to find them?

## PRP Generation

Using PRPs/templates/prp_base.md as template:

### Critical Context to Include and pass to the AI agent as part of the PRP
- **Documentation**: URLs with specific sections
- **Code Examples**: Real snippets from codebase
- **Gotchas**: Library quirks, version issues
- **Patterns**: Existing approaches to follow

### Implementation Blueprint
- Start with pseudocode showing approach
- Reference real files for patterns
- Include error handling strategy
- list tasks to be completed to fullfill the PRP in the order they should be completed

### Validation Gates (Must be Executable)

#### Level 1: Syntax & Style Validation
```bash
# Python code validation
cd custom_components/soundbeats
python3 -m py_compile *.py
# If ruff is available: ruff check . --fix
# If mypy is available: mypy . --strict

# Expected: No errors, all files pass validation
```

#### Level 2: Integration Structure Validation
```bash
# Create automated validation script
cat > validate_integration.py << 'EOF'
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

python3 validate_integration.py
```

#### Level 3: Automated Integration Testing
```bash
# Create automated test script for Home Assistant integration
cat > test_integration_automated.py << 'EOF'
#!/usr/bin/env python3
import time, json, urllib.request, subprocess, sys, os

def print_status(message, status="INFO"):
    colors = {
        "INFO": "\033[94m", "SUCCESS": "\033[92m", 
        "WARNING": "\033[93m", "ERROR": "\033[91m", 
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}{status}: {message}{colors['RESET']}")

def check_docker_running():
    """Check if Home Assistant is running in Docker."""
    try:
        result = subprocess.run(["docker-compose", "ps"], 
                              capture_output=True, text=True)
        if "homeassistant" in result.stdout and "Up" in result.stdout:
            print_status("Docker containers running", "SUCCESS")
            return True
    except:
        pass
    print_status("Docker not running or not found", "WARNING")
    return False

def deploy_integration():
    """Copy integration to HA config directory."""
    try:
        subprocess.run(["cp", "-r", "custom_components/soundbeats", 
                       "config/custom_components/"], check=True)
        print_status("Integration deployed to HA", "SUCCESS")
        return True
    except Exception as e:
        print_status(f"Failed to deploy: {e}", "ERROR")
        return False

def restart_home_assistant():
    """Restart Home Assistant container."""
    try:
        subprocess.run(["docker-compose", "restart", "homeassistant"], 
                      check=True, capture_output=True)
        print_status("Home Assistant restarting...", "INFO")
        time.sleep(20)  # Wait for HA to start
        return True
    except Exception as e:
        print_status(f"Failed to restart HA: {e}", "ERROR")
        return False

def check_ha_running():
    """Check if Home Assistant is accessible."""
    try:
        response = urllib.request.urlopen("http://localhost:8123", timeout=5)
        if response.getcode() == 200:
            print_status("Home Assistant is accessible", "SUCCESS")
            return True
    except:
        pass
    print_status("Home Assistant not accessible", "ERROR")
    return False

def check_integration_loaded():
    """Check if integration loaded without errors."""
    try:
        result = subprocess.run(
            ["docker-compose", "logs", "--tail=100", "homeassistant"],
            capture_output=True, text=True, timeout=10
        )
        
        logs = result.stdout.lower()
        
        # Check for integration detection
        if "soundbeats" in logs:
            print_status("Integration detected in logs", "SUCCESS")
            
            # Check for errors
            if "error" in logs and "soundbeats" in logs:
                error_lines = [line for line in result.stdout.split('\n') 
                             if 'error' in line.lower() and 'soundbeats' in line.lower()]
                if error_lines:
                    print_status(f"Found errors in logs", "ERROR")
                    for error in error_lines[:3]:
                        print(f"  {error.strip()}")
                    return False
            
            print_status("No errors found", "SUCCESS")
            return True
        else:
            print_status("Integration not found in logs", "WARNING")
            return True  # Not an error if not loaded yet
            
    except Exception as e:
        print_status(f"Failed to check logs: {e}", "ERROR")
        return False

def run_automated_tests():
    """Run all automated tests."""
    print("\n" + "="*60)
    print("🧪 AUTOMATED INTEGRATION TESTING")
    print("="*60 + "\n")
    
    # Check if we should run Docker tests
    if os.path.exists("docker-compose.yml"):
        tests = [
            ("Docker Running", check_docker_running),
            ("Deploy Integration", deploy_integration),
            ("Restart HA", restart_home_assistant),
            ("HA Accessible", check_ha_running),
            ("Integration Loaded", check_integration_loaded)
        ]
    else:
        print_status("No docker-compose.yml found, skipping Docker tests", "INFO")
        return 0
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n📋 Testing: {test_name}")
        print("-" * 40)
        results[test_name] = test_func()
        if not results[test_name] and test_name in ["Docker Running", "Deploy Integration"]:
            print_status("Critical test failed, aborting", "ERROR")
            break
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print_status("\n🎉 All automated tests passed!", "SUCCESS")
        print_status("Access Home Assistant at: http://localhost:8123", "INFO")
        return 0
    else:
        print_status(f"\n❌ {total - passed} test(s) failed", "ERROR")
        return 1

if __name__ == "__main__":
    sys.exit(run_automated_tests())
EOF

# Make executable and run
chmod +x test_integration_automated.py
python3 test_integration_automated.py
```

#### Level 4: Manual Testing Checklist
```bash
# Generate manual test checklist based on phase
echo "📋 MANUAL TESTING CHECKLIST"
echo "=========================="
echo ""
echo "1. Access Home Assistant UI"
echo "   - URL: http://localhost:8123"
echo "   - Look for integration in Settings > Integrations"
echo ""
echo "2. Check Panel (if applicable)"
echo "   - Look in sidebar for new panel"
echo "   - Verify icon and title correct"
echo "   - Click panel and verify it loads"
echo ""
echo "3. Test Functionality"
echo "   - Test all new features added in this phase"
echo "   - Verify responsive design"
echo "   - Check browser console for errors"
echo ""
echo "4. Persistence Test"
echo "   - Restart Home Assistant"
echo "   - Verify everything still works"
```

*** CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP ***

*** ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP ***

## Output
Save as: `PRPs/active/{feature-name}.prp.md`
- Extract feature name from the selected requirements file
- Ensure the file has `.prp.md` extension
- Save in the `PRPs/active/` folder to indicate it's ready for execution

## Quality Checklist
- [ ] All necessary context included
- [ ] Validation gates are executable by AI
- [ ] References existing patterns
- [ ] Clear implementation path
- [ ] Error handling documented

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation using claude codes)

Remember: The goal is one-pass implementation success through comprehensive context.

## Final Step: Archive Original Requirements
After successfully saving the PRP to `PRPs/active/{feature-name}.prp.md`:
1. Create the `requirements/done/` directory if it doesn't exist
2. Move the original requirements file from `/requirements/` to `/requirements/done/`
3. Confirm the move was successful
4. Display completion message with both the PRP location and the archived requirements location