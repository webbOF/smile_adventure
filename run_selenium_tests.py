#!/usr/bin/env python3
"""
Runner per i test Selenium - Esegue tutti i test con configurazioni diverse
"""

import subprocess
import sys
import os
import time
from datetime import datetime

def check_requirements():
    """Verifica che tutti i requisiti siano installati"""
    required_packages = ['selenium', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installato")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} mancante")
    if missing_packages:
        print("\n📦 Installa i pacchetti mancanti:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_chromedriver():
    """Verifica che ChromeDriver sia disponibile"""
    try:
        result = subprocess.run(['chromedriver', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ ChromeDriver trovato: {result.stdout.strip()}")
            return True
        else:
            print("❌ ChromeDriver non funziona correttamente")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ ChromeDriver non trovato")
        print("💡 Installa ChromeDriver:")
        print("   - Windows: scaricare da https://chromedriver.chromium.org/")
        print("   - oppure: pip install webdriver-manager")
        return False

def run_test_suite(test_type="comprehensive"):
    """Esegue la suite di test specificata"""
    test_files = {
        "comprehensive": "comprehensive_selenium_test.py",
        "existing": "selenium_complete_test_suite.py",
        "quick": "selenium_registration_test.py"
    }
    
    if test_type not in test_files:
        print(f"❌ Tipo di test non valido: {test_type}")
        return False
    
    test_file = test_files[test_type]
    
    if not os.path.exists(test_file):
        print(f"❌ File di test non trovato: {test_file}")
        return False
    
    print(f"🚀 Esecuzione {test_type} test: {test_file}")
    print("=" * 60)
    
    try:
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=False, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Errore nell'esecuzione del test: {e}")
        return False

def main():
    print("🎯 SMILE ADVENTURE - TEST RUNNER")
    print("=" * 50)
    print("📅 Data:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    # Verifica prerequisiti
    print("\n🔍 Verifica prerequisiti...")
    if not check_requirements():
        print("❌ Requisiti mancanti. Installare i pacchetti necessari.")
        return
    
    if not check_chromedriver():
        print("❌ ChromeDriver non disponibile.")
        print("⚠️ I test potrebbero fallire senza ChromeDriver.")
        user_input = input("\nContinuare comunque? (y/N): ")
        if user_input.lower() != 'y':
            return
    
    # Selezione tipo di test
    print("\n📋 Seleziona il tipo di test:")
    print("1. Test Completo (nuovo) - Raccomandato")
    print("2. Test Esistente")
    print("3. Test Rapido")
    print("4. Tutti i test")
    
    choice = input("\nSelezione (1-4): ").strip()
    
    if choice == "1":
        run_test_suite("comprehensive")
    elif choice == "2":
        run_test_suite("existing")
    elif choice == "3":
        run_test_suite("quick")
    elif choice == "4":
        print("\n🎯 Esecuzione di tutti i test...")
        for test_type in ["comprehensive", "existing", "quick"]:
            print(f"\n{'='*50}")
            print(f"🧪 ESECUZIONE {test_type.upper()} TEST")
            print(f"{'='*50}")
            run_test_suite(test_type)
            time.sleep(2)
    else:
        print("❌ Selezione non valida")
        return
    
    print("\n✅ Test runner completato!")

if __name__ == "__main__":
    main()
