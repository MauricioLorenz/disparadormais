# 🎯 Método HTTP + Corpo JSON - Referência Rápida

Guia estruturado com método, endpoint, e corpo JSON de cada requisição.

---

## 📌 ESTRUCTURA GERAL DO cURL

```
curl -X [MÉTODO] [URL] -H [HEADERS] -d [JSON]
```

| Parte | Descrição |
|-------|-----------|
| `-X` | Método HTTP (POST, GET, PUT, DELETE) |
| URL | Endpoint da API (ex: http://localhost:3001/api/ofertas) |
| `-H` | Headers (ex: Content-Type: application/json) |
| `-d` | Dados em JSON |

---

## 🔥 TODOS OS ENDPOINTS

### 1️⃣ CRIAR CLIENTE

```
MÉTODO:  POST
URL:     http://localhost:3001/api/clientes
HEADER:  Content-Type: application/json
CORPO:   {
           "nome": "string",
           "telefone": "string",
           "estados_interesse": "string",
           "cache_tier": ["$", "$$", "$$$"],
           "ativo": true
         }
```

**Comando Completo:**
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Meu Cliente","telefone":"5548999999999","estados_interesse":"SP, RJ","cache_tier":["$","$$"],"ativo":true}'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "nome": "Meu Cliente",
  "telefone": "5548999999999",
  "estados_interesse": "SP, RJ",
  "cache_tier": ["$", "$$"],
  "ativo": true,
  "created_at": "2026-04-04T10:30:00Z"
}
```

---

### 2️⃣ DISPARAR OFERTA

```
MÉTODO:  POST
URL:     http://localhost:3001/api/ofertas
HEADER:  Content-Type: application/json
CORPO:   {
           "artista": "string",
           "data": "YYYY-MM-DD",
           "estados": "string",
           "cache_medio": number
         }
```

**Comando Completo:**
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ, MG","cache_medio":150000}'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "artista": "Gusttavo Lima",
  "data": "2026-04-04",
  "estados": "SP, RJ, MG",
  "cache_medio": 150000,
  "criado_em": "2026-04-04T10:35:00Z"
}
```

---

### 3️⃣ LISTAR CLIENTES

```
MÉTODO:  GET
URL:     http://localhost:3001/api/clientes
HEADER:  Content-Type: application/json
CORPO:   (vazio)
```

**Comando Completo:**
```bash
curl -X GET http://localhost:3001/api/clientes \
  -H "Content-Type: application/json"
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Meu Cliente",
    "telefone": "5548999999999",
    "estados_interesse": "SP, RJ",
    "cache_tier": ["$", "$$"],
    "ativo": true
  }
]
```

---

### 4️⃣ LISTAR OFERTAS

```
MÉTODO:  GET
URL:     http://localhost:3001/api/ofertas
HEADER:  Content-Type: application/json
CORPO:   (vazio)
```

**Comando Completo:**
```bash
curl -X GET http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json"
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "artista": "Gusttavo Lima",
    "data": "2026-04-04",
    "estados": "SP, RJ, MG",
    "cache_medio": 150000
  }
]
```

---

### 5️⃣ LISTAR DISPAROS

```
MÉTODO:  GET
URL:     http://localhost:3001/api/disparos
HEADER:  Content-Type: application/json
CORPO:   (vazio)
```

**Comando Completo:**
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json"
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "oferta_id": 1,
    "cliente_nome": "Meu Cliente",
    "artista": "Gusttavo Lima",
    "cache_medio": 150000,
    "status": "ENVIADO",
    "timestamp": "2026-04-04T10:35:00Z"
  }
]
```

---

## 📋 TABELA COMPARATIVA

| Operação | Método | Endpoint | Body | Resposta |
|----------|--------|----------|------|----------|
| Criar Cliente | POST | `/api/clientes` | ✅ JSON | 201 |
| Criar Oferta | POST | `/api/ofertas` | ✅ JSON | 201 |
| Listar Clientes | GET | `/api/clientes` | ❌ Vazio | 200 |
| Listar Ofertas | GET | `/api/ofertas` | ❌ Vazio | 200 |
| Listar Disparos | GET | `/api/disparos` | ❌ Vazio | 200 |

---

## 🎯 EXEMPLO PRÁTICO COMPLETO

### 1. Criar Cliente
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Agência SP",
    "telefone": "5511999999999",
    "estados_interesse": "SP, RJ, MG",
    "cache_tier": ["$$", "$$$", "$$$$"],
    "ativo": true
  }'
```

### 2. Disparar Oferta Alto Cachê
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Gusttavo Lima",
    "data": "2026-04-04",
    "estados": "SP, RJ, MG, BA",
    "cache_medio": 500000
  }'
```

### 3. Disparar Oferta Baixo Cachê
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Artista Local",
    "data": "2026-04-04",
    "estados": "SP",
    "cache_medio": 25000
  }'
```

### 4. Verificar Disparos Realizados
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json"
```

---

## 🔍 ANÁLISE DE ERRO

### Erro 400 - Bad Request
```json
{
  "erro": "Todos os campos são obrigatórios",
  "campos_faltando": ["artista", "data"]
}
```

**Solução:** Verifique se todos os campos estão presentes no JSON

### Erro 404 - Not Found
```json
{
  "erro": "Endpoint não encontrado"
}
```

**Solução:** Verifique se a URL está correta (porta 3001 ativa?)

### Erro 500 - Internal Server Error
```json
{
  "erro": "Erro ao processar requisição"
}
```

**Solução:** Verifique os logs do servidor

---

## 💾 SALVAR RESPOSTA EM ARQUIVO

### cURL com output para arquivo
```bash
curl -X GET http://localhost:3001/api/disparos > disparos.json
```

### cURL com output em tela + arquivo
```bash
curl -X GET http://localhost:3001/api/disparos | tee disparos.json
```

---

## 🚀 DICAS FINAIS

✅ **Sempre incluir header:** `-H "Content-Type: application/json"`

✅ **GET não precisa de `-d`:** Apenas indique o método

✅ **Testar no Postman:** https://www.postman.com (Visual)

✅ **Formatar JSON:** Use `| jq '.'` (Linux/Mac) ou PowerShell

✅ **Verificar servidor:** `npm start` na pasta `/server`

---

## 📱 ESTADOS BRASILEIROS (Referência)

```
AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO
```

---

## 💰 CACHE TIERS (Referência)

```
$     = R$ 10.000 - R$ 50.000
$$    = R$ 50.000 - R$ 100.000
$$$   = R$ 100.000 - R$ 250.000
$$$$  = R$ 250.000 - R$ 500.000
$$$$$ = R$ 500.000+
```
