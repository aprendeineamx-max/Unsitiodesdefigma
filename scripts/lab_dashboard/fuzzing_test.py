#!/usr/bin/env python3
"""
FUZZING TEST SUITE - CHAOS MONKEY MODE (ASCII ONLY)
===================================================
Inyecta datos basura, payloads maliciosos y condiciones inesperadas.
Version compatible con Windows (sin emojis en consola).
"""

import urllib.request
import urllib.error
import json
import random
import string
import time
import sys

class FuzzingTester:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.endpoints = [
            "/api/versions",
            "/api/start",
            "/api/stop",
            "/api/archive",
            "/api/trash",
            "/api/restore",
            "/api/trash/empty",
            "/api/bulk/start",
            "/api/health/vINVALID",
            "/api/config/vINVALID"
        ]
        
    def generate_garbage(self, length=1000):
        """Generate random garbage string"""
        chars = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(chars) for _ in range(length))
        
    def fuzz_attack(self, iteration):
        """Execute one fuzzing attack iteration"""
        target = random.choice(self.endpoints)
        method = random.choice(["GET", "POST", "PUT", "DELETE", "PATCH"])
        
        # Payloads variados
        payloads = [
            {}, # Empty
            {"id": None}, # Null value
            {"id": 12345}, # Wrong type
            {"id": self.generate_garbage(100)}, # Garbage
            {"id": "v1'* OR '1'='1"}, # SQLi attempt
            {"id": "../../../etc/passwd"}, # Path traversal
            {"nested": {"deep": {"structure": "value"}}}, # Nested
            "RAW_STRING_NOT_JSON", # Malformed Body
            {"id": "<script>alert(1)</script>"}, # XSS attempt
            {"command": "; rm -rf /"}, # Command injection attempt
        ]
        
        payload = random.choice(payloads)
        
        report = {
            "iteration": iteration,
            "target": target,
            "method": method,
            "payload_type": str(type(payload)),
            "status": "UNKNOWN",
            "server_survived": True
        }
        
        try:
            url = f"{self.base_url}{target}"
            data = None
            headers = {'Content-Type': 'application/json'}
            
            if method in ["POST", "PUT", "PATCH"]:
                if isinstance(payload, str):
                   data = payload.encode('utf-8')
                else:
                   data = json.dumps(payload).encode('utf-8')
            
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            
            with urllib.request.urlopen(req, timeout=1) as response:
                report["status"] = response.status
                report["result"] = "ACCEPTED (Unexpected)"
                
        except urllib.error.HTTPError as e:
            report["status"] = e.code
            if e.code >= 500:
                report["result"] = "SERVER ERROR (Posible Crash)"
                report["server_survived"] = False
            else:
                report["result"] = "HANDLED (Client Error)"
                
        except Exception as e:
            report["status"] = "CONN_FAIL"
            report["result"] = str(e)
            report["server_survived"] = False
            
        return report

    def run_suite(self, iterations=200):
        print(f"[START] INICIANDO FUZZING: {iterations} ataques de caos...")
        
        results = []
        crashes = 0
        
        for i in range(1, iterations + 1):
            res = self.fuzz_attack(i)
            results.append(res)
            
            status_mark = "[OK]" if res["server_survived"] else "[FAIL]"
            print(f"[{i:03d}] {status_mark} {res['method']} {res['target']} -> {res['status']}")
            
            if not res["server_survived"]:
                crashes += 1
                
            # Verificar si el servidor sigue vivo
            try:
                urllib.request.urlopen(f"{self.base_url}/api/versions", timeout=1)
            except:
                print("[FATAL] SERVIDOR MUERTO DESPUES DEL ATAQUE")
                break
                
        # Guardar reporte
        with open("FUZZING_REPORT.json", "w") as f:
            json.dump(results, f, indent=2)
            
        print(f"\nRESUMEN:")
        print(f"Total ataques: {iterations}")
        print(f"Crashes detectados: {crashes}")
        print(f"Reporte guardado: FUZZING_REPORT.json")

if __name__ == "__main__":
    tester = FuzzingTester()
    tester.run_suite(200)
