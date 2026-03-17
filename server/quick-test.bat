@echo off
REM Script rápido para testar o sistema completo

echo.
echo 🚀 TESTE RÁPIDO - OFERTAS + CLIENTES + MATCHING
echo.

REM 1. Teste com clientes de teste
echo 1️⃣ Criando clientes de teste e disparando ofertas...
node src/test-complete.js

echo.
echo 2️⃣ Se você quer testar com CSV real, execute:
echo    node src/import-csv-ofertas.js
echo    node src/trigger-matching.js
echo.
echo ✨ Agora abra o navegador em http://localhost:5175/
echo    - /clientes    ^→ Veja os clientes cadastrados
echo    - /ofertas     ^→ Veja as ofertas recebidas
echo    - /disparos    ^→ Veja quem recebeu cada oferta
echo.
pause
