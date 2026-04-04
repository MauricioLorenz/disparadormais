@echo off
REM Script de teste HTTP para disparar ofertas via API
REM Uso: http-test.bat

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3001

echo.
echo ============================================================
echo 🚀 Iniciando testes HTTP de ofertas...
echo ============================================================
echo.

REM ============================================
REM 1️⃣ CRIAR CLIENTE
REM ============================================
echo 1️⃣ Criando cliente...
curl -s -X POST "%BASE_URL%/api/clientes" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\": \"Cliente Teste Batch\", \"telefone\": \"5548999999999\", \"estados_interesse\": \"SP, RJ, MG\", \"cache_tier\": [\"$$\", \"$$$\"], \"ativo\": true}"
echo.

REM ============================================
REM 2️⃣ LISTAR CLIENTES
REM ============================================
echo 2️⃣ Listando clientes...
curl -s -X GET "%BASE_URL%/api/clientes"
echo.

REM ============================================
REM 3️⃣ DISPARAR OFERTA
REM ============================================
echo 3️⃣ Disparando oferta...

REM Obter data atual
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)

curl -s -X POST "%BASE_URL%/api/ofertas" ^
  -H "Content-Type: application/json" ^
  -d "{\"artista\": \"Gusttavo Lima\", \"data\": \"%mydate%\", \"estados\": \"SP, RJ, MG\", \"cache_medio\": 150000}"
echo.

REM ============================================
REM 4️⃣ DISPARAR MÚLTIPLAS OFERTAS
REM ============================================
echo 4️⃣ Disparando múltiplas ofertas...
echo.

echo   * Maiara ^& Maraisa...
curl -s -X POST "%BASE_URL%/api/ofertas" ^
  -H "Content-Type: application/json" ^
  -d "{\"artista\": \"Maiara & Maraisa\", \"data\": \"%mydate%\", \"estados\": \"RS, SC\", \"cache_medio\": 100000}" > nul
echo     ✅ Enviado

echo   * Zé Neto ^& Cristiano...
curl -s -X POST "%BASE_URL%/api/ofertas" ^
  -H "Content-Type: application/json" ^
  -d "{\"artista\": \"Zé Neto & Cristiano\", \"data\": \"%mydate%\", \"estados\": \"SP, RJ\", \"cache_medio\": 200000}" > nul
echo     ✅ Enviado

echo   * Wesley Safadão...
curl -s -X POST "%BASE_URL%/api/ofertas" ^
  -H "Content-Type: application/json" ^
  -d "{\"artista\": \"Wesley Safadão\", \"data\": \"%mydate%\", \"estados\": \"BA, PE, CE\", \"cache_medio\": 80000}" > nul
echo     ✅ Enviado

echo.

REM ============================================
REM 5️⃣ LISTAR OFERTAS
REM ============================================
echo 5️⃣ Listando ofertas...
curl -s -X GET "%BASE_URL%/api/ofertas"
echo.

REM ============================================
REM 6️⃣ LISTAR DISPAROS
REM ============================================
echo 6️⃣ Listando disparos...
curl -s -X GET "%BASE_URL%/api/disparos"
echo.

echo ============================================================
echo ✅ Testes concluídos com sucesso!
echo ============================================================
echo.

pause
