#!/usr/bin/env python3
"""
SISTEMA ANTICAGADAS - Lab Manager Testing Suite
================================================
Script automatizado que verifica CADA componente del sistema
SIN depender de las herramientas defectuosas del agente.

Genera reporte consolidado con evidencia irrefutable.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

class LabManagerTester:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.client_path = self.base_path / "client"
        self.server_path = self.base_path / "server"
        
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'passed': 0,
            'failed': 0,
            'total': 0
        }
    
    def add_result(self, category: str, name: str, passed: bool, evidence: str, details: str = ""):
        """Add test result with evidence"""
        self.results['tests'].append({
            'category': category,
            'name': name,
            'passed': passed,
            'evidence': evidence,
            'details': details
        })
        
        if passed:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
        self.results['total'] += 1
        
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {category}/{name}")
    
    # ========================================
    # FRONTEND TESTS
    # ========================================
    
    def test_orange_button_code(self):
        """Test 1: Verify orange button code exists"""
        app_tsx = self.client_path / "src" / "App.tsx"
        
        if not app_tsx.exists():
            self.add_result("Frontend", "Orange Button Code", False, "App.tsx not found")
            return
        
        content = app_tsx.read_text(encoding='utf-8')
        
        # Check for orange button pattern
        patterns = [
            r"v\.status === 'starting'",
            r"v\.status === 'installing'",
            r"bg-yellow-600",
            r"animate-spin"
        ]
        
        found = []
        for pattern in patterns:
            if re.search(pattern, content):
                found.append(pattern)
        
        passed = len(found) == len(patterns)
        evidence = f"Found {len(found)}/{len(patterns)} patterns: {', '.join(found)}"
        
        self.add_result("Frontend", "Orange Button Code", passed, evidence)
    
    def test_archiveview_exists(self):
        """Test 2: Verify ArchiveView component exists"""
        archive_tsx = self.client_path / "src" / "components" / "ArchiveView.tsx"
        
        if not archive_tsx.exists():
            self.add_result("Frontend", "ArchiveView Component", False, "ArchiveView.tsx not found")
            return
        
        content = archive_tsx.read_text(encoding='utf-8')
        size = len(content)
        lines = content.count('\n') + 1
        
        # Verify key content
        has_export = 'export function ArchiveView' in content
        has_loadarchives = 'loadArchives' in content
        has_restore = 'handleUnarchive' in content
        
        passed = has_export and has_loadarchives and has_restore
        evidence = f"File: {lines} lines, {size} bytes. Export: {has_export}, Load: {has_loadarchives}, Restore: {has_restore}"
        
        self.add_result("Frontend", "ArchiveView Component", passed, evidence)
    
    def test_archiveview_integration(self):
        """Test 3: Verify ArchiveView integration in App.tsx"""
        app_tsx = self.client_path / "src" / "App.tsx"
        content = app_tsx.read_text(encoding='utf-8')
        
        # Check integration points
        has_import = "import { ArchiveView }" in content
        has_type = "'archive'" in content
        has_render = "ArchiveView />" in content or "ArchiveView/>" in content
        
        passed = has_import and has_type and has_render
        evidence = f"Import: {has_import}, Type: {has_type}, Render: {has_render}"
        
        self.add_result("Frontend", "ArchiveView Integration", passed, evidence)
    
    def test_archive_menu(self):
        """Test 4: Verify Archive menu item"""
        app_tsx = self.client_path / "src" / "App.tsx"
        content = app_tsx.read_text(encoding='utf-8')
        
        # Look for menu item
        has_archive_label = re.search(r"label.*['\"]Archive['\"]", content) is not None
        has_gitbranch = "GitBranch" in content
        
        passed = has_archive_label and has_gitbranch
        evidence = f"Archive label: {has_archive_label}, GitBranch icon: {has_gitbranch}"
        
        self.add_result("Frontend", "Archive Menu Item", passed, evidence)
    
    def test_frontend_build_exists(self):
        """Test 5: Verify frontend build artifacts"""
        dist_path = self.client_path / "dist"
        
        if not dist_path.exists():
            self.add_result("Frontend", "Build Artifacts", False, "dist/ directory not found")
            return
        
        index_html = dist_path / "index.html"
        assets_dir = dist_path / "assets"
        
        has_index = index_html.exists()
        has_assets = assets_dir.exists()
        
        passed = has_index and has_assets
        evidence = f"index.html: {has_index}, assets/: {has_assets}"
        
        self.add_result("Frontend", "Build Artifacts", passed, evidence)
    
    # ========================================
    # BACKEND TESTS
    # ========================================
    
    def test_archive_endpoint(self):
        """Test 6: Verify /api/archive endpoint"""
        server_js = self.server_path / "server.js"
        
        if not server_js.exists():
            self.add_result("Backend", "Archive Endpoint", False, "server.js not found")
            return
        
        content = server_js.read_text(encoding='utf-8')
        
        # Find endpoint
        match = re.search(r"app\.post\(['\"]\/api\/archive['\"]", content)
        
        if match:
            # Count lines to get line number
            lines_before = content[:match.start()].count('\n') + 1
            evidence = f"Found at line ~{lines_before}"
            passed = True
        else:
            evidence = "Endpoint not found"
            passed = False
        
        self.add_result("Backend", "Archive Endpoint", passed, evidence)
    
    def test_trash_endpoint(self):
        """Test 7: Verify /api/trash endpoint"""
        server_js = self.server_path / "server.js"
        content = server_js.read_text(encoding='utf-8')
        
        match = re.search(r"app\.post\(['\"]\/api\/trash['\"]", content)
        
        if match:
            lines_before = content[:match.start()].count('\n') + 1
            evidence = f"Found at line ~{lines_before}"
            passed = True
        else:
            evidence = "Endpoint not found"
            passed = False
        
        self.add_result("Backend", "Trash Endpoint", passed, evidence)
    
    def test_archive_list_endpoint(self):
        """Test 8: Verify /api/archive/list endpoint"""
        server_js = self.server_path / "server.js"
        content = server_js.read_text(encoding='utf-8')
        
        match = re.search(r"app\.get\(['\"]\/api\/archive\/list['\"]", content)
        
        passed = match is not None
        evidence = "Found" if passed else "Not found"
        
        self.add_result("Backend", "Archive List Endpoint", passed, evidence)
    
    def test_modular_server_exists(self):
        """Test 9: Verify modular server structure"""
        server_modular = self.server_path / "server-modular.js"
        core_dir = self.server_path / "core"
        routes_dir = self.server_path / "routes"
        
        has_modular = server_modular.exists()
        has_core = core_dir.exists()
        has_routes = routes_dir.exists()
        
        passed = has_modular and has_core and has_routes
        evidence = f"server-modular.js: {has_modular}, core/: {has_core}, routes/: {has_routes}"
        
        self.add_result("Backend", "Modular Architecture", passed, evidence)
    
    # ========================================
    # RUNTIME TESTS
    # ========================================
    
    def test_backend_port(self):
        """Test 10: Check if backend is responding on port 3000"""
        try:
            import urllib.request
            response = urllib.request.urlopen('http://localhost:3000/api/versions', timeout=3)
            passed = response.status == 200
            evidence = f"HTTP {response.status}"
        except Exception as e:
            passed = False
            evidence = f"Error: {str(e)[:50]}"
        
        self.add_result("Runtime", "Backend Port 3000", passed, evidence)
    
    def test_frontend_port(self):
        """Test 11: Check if frontend is responding on port 4173"""
        try:
            import urllib.request
            response = urllib.request.urlopen('http://localhost:4173', timeout=3)
            passed = response.status == 200
            evidence = f"HTTP {response.status}"
        except Exception as e:
            passed = False
            evidence = f"Error: {str(e)[:50]}"
        
        self.add_result("Runtime", "Frontend Port 4173", passed, evidence)
    
    # ========================================
    # GIT TESTS
    # ========================================
    
    def test_git_status(self):
        """Test 12: Verify git status"""
        try:
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=self.base_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            clean = len(result.stdout.strip()) == 0
            evidence = "Working tree clean" if clean else f"{len(result.stdout.splitlines())} changes"
            
            self.add_result("Git", "Working Tree Status", clean, evidence)
        except Exception as e:
            self.add_result("Git", "Working Tree Status", False, str(e))
    
    def test_git_remote(self):
        """Test 13: Verify git remote"""
        try:
            result = subprocess.run(
                ['git', 'remote', '-v'],
                cwd=self.base_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            has_origin = 'origin' in result.stdout
            evidence = "Origin configured" if has_origin else "No origin"
            
            self.add_result("Git", "Remote Configuration", has_origin, evidence)
        except Exception as e:
            self.add_result("Git", "Remote Configuration", False, str(e))
    
    # ========================================
    # RUN ALL TESTS
    # ========================================
    
    def run_all(self):
        """Execute all tests"""
        print("=" * 60)
        print("LAB MANAGER TESTING SUITE")
        print("Automated verification with concrete evidence")
        print("=" * 60)
        print()
        
        # Frontend tests
        print("[FRONTEND TESTS]")
        self.test_orange_button_code()
        self.test_archiveview_exists()
        self.test_archiveview_integration()
        self.test_archive_menu()
        self.test_frontend_build_exists()
        print()
        
        # Backend tests
        print("[BACKEND TESTS]")
        self.test_archive_endpoint()
        self.test_trash_endpoint()
        self.test_archive_list_endpoint()
        self.test_modular_server_exists()
        print()
        
        # Runtime tests
        print("[RUNTIME TESTS]")
        self.test_backend_port()
        self.test_frontend_port()
        print()
        
        # Git tests
        print("[GIT TESTS]")
        self.test_git_status()
        self.test_git_remote()
        print()
        
        # Summary
        print("=" * 60)
        print(f"RESULTS: {self.results['passed']}/{self.results['total']} passed")
        print(f"FAILED: {self.results['failed']}")
        print("=" * 60)
    
    def generate_report(self, output_path: str):
        """Generate detailed markdown report"""
        report = f"""# Lab Manager Testing Report
Generated: {self.results['timestamp']}

## Summary

- **Total Tests:** {self.results['total']}
- **Passed:** {self.results['passed']}
- **Failed:** {self.results['failed']}
- **Success Rate:** {(self.results['passed'] / self.results['total'] * 100):.1f}%

## Test Results

"""
        
        # Group by category
        categories = {}
        for test in self.results['tests']:
            cat = test['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(test)
        
        for category, tests in categories.items():
            report += f"### {category}\n\n"
            for test in tests:
                status = "✅ PASS" if test['passed'] else "❌ FAIL"
                report += f"**{status}** - {test['name']}\n"
                report += f"- **Evidence:** {test['evidence']}\n"
                if test['details']:
                    report += f"- **Details:** {test['details']}\n"
                report += "\n"
        
        # Write report
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\nReport saved: {output_path}")

def main():
    import sys
    
    base_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    tester = LabManagerTester(base_path)
    tester.run_all()
    tester.generate_report("TEST_RESULTS.md")
    
    # Exit with error code if any tests failed
    sys.exit(0 if tester.results['failed'] == 0 else 1)

if __name__ == "__main__":
    main()
