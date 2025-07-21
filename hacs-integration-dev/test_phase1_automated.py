#!/usr/bin/env python3
"""
Automated test script for Soundbeats Phase 1 validation.
This script validates the integration is properly loaded and panel is registered.
"""
import time
import json
import urllib.request
import urllib.error
import subprocess
import sys

def print_status(message, status="INFO"):
    """Print colored status messages."""
    colors = {
        "INFO": "\033[94m",
        "SUCCESS": "\033[92m",
        "WARNING": "\033[93m",
        "ERROR": "\033[91m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}{status}: {message}{colors['RESET']}")

def check_ha_running():
    """Check if Home Assistant is running."""
    try:
        response = urllib.request.urlopen("http://localhost:8123", timeout=5)
        if response.getcode() == 200:
            print_status("Home Assistant is running", "SUCCESS")
            return True
    except:
        pass
    print_status("Home Assistant is not running", "ERROR")
    return False

def check_integration_loaded():
    """Check if Soundbeats integration is loaded in HA logs."""
    try:
        result = subprocess.run(
            ["docker-compose", "logs", "homeassistant"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        logs = result.stdout + result.stderr
        
        # Check for integration detection
        if "custom integration soundbeats" in logs.lower():
            print_status("Soundbeats integration detected by HA", "SUCCESS")
            
            # Check for errors
            error_lines = [line for line in logs.split('\n') 
                          if 'error' in line.lower() and 'soundbeats' in line.lower()]
            
            if error_lines:
                print_status(f"Found {len(error_lines)} error(s) in logs", "WARNING")
                for error in error_lines[:3]:  # Show first 3 errors
                    print(f"  - {error.strip()}")
                return False
            else:
                print_status("No errors found in logs", "SUCCESS")
                return True
        else:
            print_status("Soundbeats not found in logs", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"Failed to check logs: {str(e)}", "ERROR")
        return False

def check_api_integration():
    """Check if integration is available via HA API."""
    try:
        # Note: This would require authentication in a real setup
        # For now, we'll check if the integration files exist
        import os
        
        integration_path = "config/custom_components/soundbeats"
        required_files = ["__init__.py", "manifest.json", "const.py", 
                         "frontend/index.html", "frontend/soundbeats-panel.js"]
        
        all_present = True
        for file in required_files:
            path = os.path.join(integration_path, file)
            if os.path.exists(path):
                print_status(f"Found: {file}", "SUCCESS")
            else:
                print_status(f"Missing: {file}", "ERROR")
                all_present = False
                
        return all_present
        
    except Exception as e:
        print_status(f"Failed to check API: {str(e)}", "ERROR")
        return False

def validate_manifest():
    """Validate the manifest.json file."""
    try:
        with open("custom_components/soundbeats/manifest.json", "r") as f:
            manifest = json.load(f)
            
        required_fields = ["domain", "name", "version", "dependencies"]
        missing = [field for field in required_fields if field not in manifest]
        
        if missing:
            print_status(f"Missing manifest fields: {missing}", "ERROR")
            return False
            
        # Validate specific values
        checks = [
            (manifest.get("domain") == "soundbeats", "Domain is 'soundbeats'"),
            (manifest.get("name") == "Soundbeats", "Name is 'Soundbeats'"),
            ("frontend" in manifest.get("dependencies", []), "Has 'frontend' dependency"),
            ("websocket_api" in manifest.get("dependencies", []), "Has 'websocket_api' dependency"),
            (manifest.get("version", "") != "", "Has version number")
        ]
        
        all_passed = True
        for check, description in checks:
            if check:
                print_status(f"✓ {description}", "SUCCESS")
            else:
                print_status(f"✗ {description}", "ERROR")
                all_passed = False
                
        return all_passed
        
    except Exception as e:
        print_status(f"Failed to validate manifest: {str(e)}", "ERROR")
        return False

def run_phase1_tests():
    """Run all Phase 1 validation tests."""
    print("\n" + "="*60)
    print("🧪 SOUNDBEATS PHASE 1 AUTOMATED TESTING")
    print("="*60 + "\n")
    
    tests = [
        ("Home Assistant Running", check_ha_running),
        ("Integration Loaded", check_integration_loaded),
        ("Integration Files", check_api_integration),
        ("Manifest Validation", validate_manifest)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n📋 Testing: {test_name}")
        print("-" * 40)
        results[test_name] = test_func()
        time.sleep(1)
    
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
        print_status("\n🎉 All Phase 1 tests passed!", "SUCCESS")
        print_status("The integration is ready for manual UI testing", "INFO")
        print_status("Access Home Assistant at: http://localhost:8123", "INFO")
        print_status("Look for 'Soundbeats' in the sidebar with a music note icon", "INFO")
        return 0
    else:
        print_status(f"\n❌ {total - passed} test(s) failed", "ERROR")
        return 1

if __name__ == "__main__":
    sys.exit(run_phase1_tests())