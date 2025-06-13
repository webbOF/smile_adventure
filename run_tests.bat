@echo off
echo 🎯 SMILE ADVENTURE - SELENIUM TEST LAUNCHER
echo ============================================
echo.

cd /d "%~dp0"

echo 🔍 Verifica che Docker sia in esecuzione...
docker-compose ps > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker non sembra essere in esecuzione
    echo 💡 Avvia Docker Desktop e riprova
    pause
    exit /b 1
)

echo ✅ Docker attivo

echo.
echo 🚀 Avvio servizi Smile Adventure...
docker-compose up -d

echo.
echo ⏳ Attendere il caricamento completo dei servizi...
timeout /t 10 /nobreak

echo.
echo 🧪 Avvio test Selenium...
python comprehensive_selenium_test.py

echo.
echo 📊 Test completati! Controlla i risultati sopra.
echo 📸 Screenshot salvati nella cartella corrente.
echo.
pause
