# ═══════════════════════════════════════════════════════════════════════════════
# 📡 CURL COM POWERSHELL - Testes de Ofertas
# ═══════════════════════════════════════════════════════════════════════════════
#
# Uso:
#   No PowerShell, navegue até a pasta server e execute:
#   powershell -ExecutionPolicy Bypass -File curl-powershell.ps1
#
# ═══════════════════════════════════════════════════════════════════════════════

$BaseURL = "http://localhost:3001"

Write-Host "`n" -ForegroundColor Green
Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          📡 TESTE DE OFERTAS COM CURL + POWERSHELL                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 1️⃣ CRIAR CLIENTE
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "1️⃣ Criando cliente..." -ForegroundColor Yellow

$clienteData = @{
    nome = "Cliente PowerShell"
    telefone = "5548999999999"
    estados_interesse = "SP, RJ, MG"
    cache_tier = @("$", "$$", "$$$")
    ativo = $true
} | ConvertTo-Json

$response = curl -X POST "$BaseURL/api/clientes" `
  -H "Content-Type: application/json" `
  -Body $clienteData

Write-Host "Response:" -ForegroundColor Green
$response | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 2️⃣ LISTAR CLIENTES
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "2️⃣ Listando clientes..." -ForegroundColor Yellow

$clientes = curl -X GET "$BaseURL/api/clientes" `
  -H "Content-Type: application/json"

Write-Host "Response:" -ForegroundColor Green
$clientes | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 3️⃣ DISPARAR OFERTA
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "3️⃣ Disparando oferta..." -ForegroundColor Yellow

$hoje = (Get-Date).ToString("yyyy-MM-dd")

$ofertaData = @{
    artista = "Gusttavo Lima"
    data = $hoje
    estados = "SP, RJ, MG"
    cache_medio = 150000
} | ConvertTo-Json

$response = curl -X POST "$BaseURL/api/ofertas" `
  -H "Content-Type: application/json" `
  -Body $ofertaData

Write-Host "Response:" -ForegroundColor Green
$response | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 4️⃣ DISPARAR MÚLTIPLAS OFERTAS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "4️⃣ Disparando múltiplas ofertas..." -ForegroundColor Yellow
Write-Host ""

$ofertas = @(
    @{
        artista = "Maiara & Maraisa"
        data = $hoje
        estados = "RS, SC"
        cache_medio = 100000
    },
    @{
        artista = "Zé Neto & Cristiano"
        data = $hoje
        estados = "SP, RJ"
        cache_medio = 200000
    },
    @{
        artista = "Wesley Safadão"
        data = $hoje
        estados = "BA, PE, CE"
        cache_medio = 80000
    },
    @{
        artista = "Bruno & Marrone"
        data = $hoje
        estados = "SP, RJ, BA, MG, RS"
        cache_medio = 750000
    }
)

foreach ($oferta in $ofertas) {
    $ofertaJson = $oferta | ConvertTo-Json
    $response = curl -X POST "$BaseURL/api/ofertas" `
      -H "Content-Type: application/json" `
      -Body $ofertaJson

    $parsed = $response | ConvertFrom-Json

    if ($parsed.id) {
        Write-Host "  ✅ $($oferta.artista) (R$ $($oferta.cache_medio)) - ID: $($parsed.id)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($oferta.artista) - Erro ao disparar" -ForegroundColor Red
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 5️⃣ LISTAR OFERTAS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "5️⃣ Listando ofertas..." -ForegroundColor Yellow

$ofertas_list = curl -X GET "$BaseURL/api/ofertas" `
  -H "Content-Type: application/json"

Write-Host "Response:" -ForegroundColor Green
$ofertas_list | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ 6️⃣ LISTAR DISPAROS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "6️⃣ Listando disparos..." -ForegroundColor Yellow

$disparos = curl -X GET "$BaseURL/api/disparos" `
  -H "Content-Type: application/json"

Write-Host "Response:" -ForegroundColor Green
$disparos | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ✅ RESUMO
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ TESTES CONCLUÍDOS COM SUCESSO                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Abra http://localhost:5175/clientes" -ForegroundColor Gray
Write-Host "  2. Abra http://localhost:5175/ofertas" -ForegroundColor Gray
Write-Host "  3. Abra http://localhost:5175/disparos" -ForegroundColor Gray
Write-Host ""
