"""Validate the Soundbeats integration structure."""
import os
import json
import sys


def validate_integration():
    """Validate the integration structure and files."""
    errors = []
    warnings = []
    
    base_path = "custom_components/soundbeats"
    
    # Check required files
    required_files = [
        "__init__.py",
        "manifest.json",
        "const.py"
    ]
    
    for file in required_files:
        path = os.path.join(base_path, file)
        if not os.path.exists(path):
            errors.append(f"Missing required file: {path}")
    
    # Check manifest.json
    manifest_path = os.path.join(base_path, "manifest.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Check required fields
            required_fields = ["domain", "name", "version", "codeowners"]
            for field in required_fields:
                if field not in manifest:
                    errors.append(f"Missing required field in manifest.json: {field}")
            
            # Check domain matches folder name
            if manifest.get("domain") != "soundbeats":
                errors.append(f"Domain in manifest.json doesn't match folder name")
                
            print(f"✓ Manifest version: {manifest.get('version', 'unknown')}")
            
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON in manifest.json: {e}")
    
    # Check HACS files
    hacs_files = ["hacs.json", "README.md"]
    for file in hacs_files:
        if not os.path.exists(file):
            warnings.append(f"Missing HACS file: {file}")
    
    # Check hacs.json
    if os.path.exists("hacs.json"):
        try:
            with open("hacs.json", 'r') as f:
                hacs = json.load(f)
            print(f"✓ HACS name: {hacs.get('name', 'unknown')}")
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON in hacs.json: {e}")
    
    # Check Python files
    python_files = [
        "models.py",
        "game_manager.py", 
        "websocket_api.py"
    ]
    
    for file in python_files:
        path = os.path.join(base_path, file)
        if os.path.exists(path):
            print(f"✓ Found: {file}")
        else:
            warnings.append(f"Missing Phase 3 file: {path}")
    
    # Check frontend
    frontend_path = os.path.join(base_path, "frontend/dist/soundbeats-panel.js")
    if os.path.exists(frontend_path):
        size = os.path.getsize(frontend_path) / 1024
        print(f"✓ Frontend built: {size:.1f} KB")
        if size > 500:
            warnings.append(f"Frontend bundle size ({size:.1f} KB) exceeds 500 KB")
    else:
        errors.append("Frontend not built: missing dist/soundbeats-panel.js")
    
    # Print results
    print("\n" + "="*50)
    print("VALIDATION RESULTS")
    print("="*50)
    
    if errors:
        print(f"\n❌ ERRORS ({len(errors)}):")
        for error in errors:
            print(f"  - {error}")
    
    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not errors and not warnings:
        print("\n✅ All checks passed!")
    
    print("\n" + "="*50)
    
    # Return exit code
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(validate_integration())