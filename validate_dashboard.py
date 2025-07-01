#!/usr/bin/env python3
"""
Simple validation script for Soundbeats dashboard integration.
Checks that all necessary files exist and have basic correct structure.
"""

import os
import json
import sys


def check_file_exists(filepath, description):
    """Check if a file exists and report result."""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} (MISSING)")
        return False


def check_manifest():
    """Check manifest.json has required panel configuration."""
    manifest_path = "custom_components/soundbeats/manifest.json"
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
            
        if "frontend_extra_module_url" in manifest:
            print(f"✅ Manifest has frontend_extra_module_url: {manifest['frontend_extra_module_url']}")
            return True
        else:
            print("❌ Manifest missing frontend_extra_module_url")
            return False
    except Exception as e:
        print(f"❌ Error reading manifest: {e}")
        return False


def check_python_syntax():
    """Check Python files for basic syntax errors."""
    import py_compile
    
    python_files = [
        "custom_components/soundbeats/__init__.py",
        "custom_components/soundbeats/config_flow.py", 
        "custom_components/soundbeats/sensor.py",
        "custom_components/soundbeats/services.py",
        "tests/test_panel.py"
    ]
    
    all_good = True
    for file_path in python_files:
        if os.path.exists(file_path):
            try:
                py_compile.compile(file_path, doraise=True)
                print(f"✅ Python syntax OK: {file_path}")
            except py_compile.PyCompileError as e:
                print(f"❌ Python syntax error in {file_path}: {e}")
                all_good = False
        else:
            print(f"⚠️  Python file not found: {file_path}")
    
    return all_good


def main():
    """Run all validation checks."""
    print("🔍 Validating Soundbeats Dashboard Integration...")
    print("=" * 50)
    
    all_checks_passed = True
    
    # Check required files exist
    required_files = [
        ("custom_components/soundbeats/__init__.py", "Main integration file"),
        ("custom_components/soundbeats/manifest.json", "Integration manifest"),
        ("custom_components/soundbeats/www/soundbeats-card.js", "Original Lovelace card"),
        ("custom_components/soundbeats/www/soundbeats-panel.js", "Panel component"),
        ("custom_components/soundbeats/www/soundbeats-dashboard.html", "Dashboard HTML"),
        ("tests/test_panel.py", "Panel tests"),
    ]
    
    for filepath, description in required_files:
        if not check_file_exists(filepath, description):
            all_checks_passed = False
    
    print("\n📋 Configuration Checks:")
    print("-" * 30)
    
    # Check manifest configuration
    if not check_manifest():
        all_checks_passed = False
    
    print("\n🐍 Python Syntax Checks:")
    print("-" * 30)
    
    # Check Python syntax
    if not check_python_syntax():
        all_checks_passed = False
    
    print("\n" + "=" * 50)
    if all_checks_passed:
        print("🎉 All validation checks passed! Dashboard integration looks good.")
        return 0
    else:
        print("❌ Some validation checks failed. Please review the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())