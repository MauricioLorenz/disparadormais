# 📡 Exemplos de cURL - Disparos de Ofertas

Guia completo com todos os comandos cURL para testar a API de ofertas.

---

## 1️⃣ DISPARAR OFERTA SIMPLES

### Comando cURL
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Gusttavo Lima",
    "data": "2026-04-04",
    "estados": "SP, RJ, MG",
    "cache_medio": 150000
  }'
```

### Descomplicado (uma linha)
```bash
curl -X POST http://localhost:3001/api/ofertas -H "Content-Type: application/json" -d '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ, MG","cache_medio":150000}'
```

### Resposta Esperada (201 Created)
```json
{
  "id": 1,
  "artista": "Gusttavo Lima",
  "data": "2026-04-04",
  "estados": "SP, RJ, MG",
  "cache_medio": 150000,
  "timestamp": "2026-04-04T10:30:00Z"
}
```

---

## 2️⃣ DISPARAR MÚLTIPLAS OFERTAS (Em Lote)

### Oferta 1: Maiara & Maraisa
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Maiara & Maraisa",
    "data": "2026-04-04",
    "estados": "RS, SC",
    "cache_medio": 100000
  }'
```

### Oferta 2: Zé Neto & Cristiano
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Zé Neto & Cristiano",
    "data": "2026-04-04",
    "estados": "SP, RJ, MG",
    "cache_medio": 200000
  }'
```

### Oferta 3: Wesley Safadão
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Wesley Safadão",
    "data": "2026-04-04",
    "estados": "BA, PE, CE",
    "cache_medio": 80000
  }'
```

### Oferta 4: Sertanejo Alto Cachê
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Bruno & Marrone",
    "data": "2026-04-04",
    "estados": "SP, RJ, BA, MG, RS",
    "cache_medio": 750000
  }'
```

---

## 3️⃣ OFERTA COM TODOS OS ESTADOS

### Comando cURL
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Ivete Sangalo",
    "data": "2026-04-04",
    "estados": "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO",
    "cache_medio": 500000
  }'
```

---

## 4️⃣ CRIAR CLIENTE PARA TESTES

### Comando cURL
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Meu Cliente Teste",
    "telefone": "5548999999999",
    "estados_interesse": "SP, RJ, MG",
    "cache_tier": ["$", "$$", "$$$"],
    "ativo": true
  }'
```

### Cliente VIP (Apenas Alto Cachê)
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente VIP Premium",
    "telefone": "5548988888888",
    "estados_interesse": "SP, RJ",
    "cache_tier": ["$$$$", "$$$$$"],
    "ativo": true
  }'
```

### Cliente Premium (Todos os Estados e Cachês)
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Premium Nacional",
    "telefone": "5548977777777",
    "estados_interesse": "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO",
    "cache_tier": ["$", "$$", "$$$", "$$$$", "$$$$$"],
    "ativo": true
  }'
```

---

## 5️⃣ LISTAR DADOS (GET)

### Listar Todos os Clientes
```bash
curl -X GET http://localhost:3001/api/clientes \
  -H "Content-Type: application/json"
```

### Listar Todas as Ofertas
```bash
curl -X GET http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json"
```

### Listar Todos os Disparos
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json"
```

### Listar com Paginação
```bash
curl -X GET "http://localhost:3001/api/ofertas?limit=10&offset=0" \
  -H "Content-Type: application/json"
```

---

## 6️⃣ SCRIPT DE TESTE COMPLETO (Copiar e Colar)

### Windows (PowerShell)
```powershell
# Terminal: Use PowerShell como Admin

# 1. Criar Cliente
curl -X POST http://localhost:3001/api/clientes `
  -H "Content-Type: application/json" `
  -Body '{"nome":"Teste PowerShell","telefone":"5548999999999","estados_interesse":"SP, RJ","cache_tier":["$$","$$$"],"ativo":true}'

# 2. Disparar Oferta
curl -X POST http://localhost:3001/api/ofertas `
  -H "Content-Type: application/json" `
  -Body '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ","cache_medio":150000}'

# 3. Listar Disparos
curl -X GET http://localhost:3001/api/disparos `
  -H "Content-Type: application/json"
```

### Linux/Mac (Bash)
```bash
# 1. Criar Cliente
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste Bash","telefone":"5548999999999","estados_interesse":"SP, RJ","cache_tier":["$$","$$$"],"ativo":true}'

# 2. Disparar Oferta
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ","cache_medio":150000}'

# 3. Listar Disparos
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json"
```

---

## 7️⃣ REFERÊNCIA DE CAMPOS JSON

### POST /api/ofertas
```json
{
  "artista": "string (obrigatório)",
  "data": "YYYY-MM-DD (obrigatório)",
  "estados": "AC, AL, AP, AM, BA, CE... (obrigatório)",
  "cache_medio": "número em reais (obrigatório)"
}
```

### POST /api/clientes
```json
{
  "nome": "string (obrigatório)",
  "telefone": "string com DDI (obrigatório) - Ex: 5548999999999",
  "estados_interesse": "AC, AL, AP... (obrigatório)",
  "cache_tier": ["$", "$$", "$$$", "$$$$", "$$$$$"] (obrigatório)",
  "ativo": "boolean (opcional - padrão: true)"
}
```

### Resposta GET /api/disparos
```json
{
  "id": 1,
  "cliente_id": 1,
  "oferta_id": 1,
  "cliente_nome": "string",
  "artista": "string",
  "cache_medio": number,
  "status": "ENVIADO|ERRO|PENDENTE",
  "timestamp": "ISO 8601 datetime"
}
```

---

## 8️⃣ FAIXAS DE CACHE (Referência)

| Tier | Range | Exemplo |
|------|-------|---------|
| `$` | R$ 10.000 - R$ 50.000 | Artista iniciante |
| `$$` | R$ 50.000 - R$ 100.000 | Artista em crescimento |
| `$$$` | R$ 100.000 - R$ 250.000 | Artista consolidado |
| `$$$$` | R$ 250.000 - R$ 500.000 | Artista famoso |
| `$$$$$` | R$ 500.000+ | Mega celebridade |

---

## 9️⃣ FERRAMENTA ONLINE PARA TESTAR

### Usar Postman
1. Abra https://www.postman.com
2. Nova requisição POST
3. URL: `http://localhost:3001/api/ofertas`
4. Body (JSON):
```json
{
  "artista": "Gusttavo Lima",
  "data": "2026-04-04",
  "estados": "SP, RJ, MG",
  "cache_medio": 150000
}
```

---

## 🔟 SALVAR RESPOSTA EM ARQUIVO

### Salvar JSON em arquivo
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json" \
  -o disparos.json
```

### Ver + Salvar Simultaneamente
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json" \
  -tee disparos.json
```

---

## 📍 ENDPOINTS DISPONÍVEIS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ofertas` | Criar/disparar oferta |
| GET | `/api/ofertas` | Listar ofertas |
| POST | `/api/clientes` | Criar cliente |
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/disparos` | Listar disparos |

---

## ✅ CHECKLIST DE TESTE

- [ ] Servidor rodando em `npm start`
- [ ] cURL instalado e funcionando
- [ ] Criar um cliente via POST
- [ ] Disparar uma oferta via POST
- [ ] Listar disparos via GET
- [ ] Verificar em http://localhost:5175/disparos
- [ ] Confirmar matching automático
