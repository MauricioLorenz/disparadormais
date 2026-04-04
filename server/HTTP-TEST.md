# 🧪 Teste HTTP - Disparar Ofertas via API

Guia completo para testar a API de ofertas usando chamadas HTTP.

## 📋 Opções de Teste

Você tem 3 opções para enviar testes HTTP:

### **Opção 1: Node.js (Recomendado)**

```bash
cd server
node src/http-test.js
```

**Vantagens:**
- ✅ Funciona em qualquer plataforma (Windows, Mac, Linux)
- ✅ Logs formatados e fáceis de ler
- ✅ Tratamento de erros automático

---

### **Opção 2: cURL + Bash (Linux/Mac)**

```bash
cd server
chmod +x http-test.sh
./http-test.sh
```

**Vantagens:**
- ✅ Simples e direto
- ✅ Usa o cURL nativamente
- ✅ Saída formatada com `jq`

---

### **Opção 3: Batch (Windows)**

```bash
cd server
http-test.bat
```

**Vantagens:**
- ✅ Executável direto no Windows
- ✅ Sem dependências extras

---

## 🎯 O Que Cada Script Faz

Todos os 3 scripts executam a mesma sequência de testes:

### 1️⃣ **Criar Cliente**
```json
POST /api/clientes
{
  "nome": "Cliente Teste HTTP",
  "telefone": "5548999999999",
  "estados_interesse": "SP, RJ, MG",
  "cache_tier": ["$$", "$$$"],
  "ativo": true
}
```

### 2️⃣ **Listar Clientes**
```
GET /api/clientes
```

### 3️⃣ **Disparar Oferta**
```json
POST /api/ofertas
{
  "artista": "Gusttavo Lima",
  "data": "2026-04-04",
  "estados": "SP, RJ, MG",
  "cache_medio": 150000
}
```

### 4️⃣ **Disparar Múltiplas Ofertas**
- Maiara & Maraisa (R$ 100.000)
- Zé Neto & Cristiano (R$ 200.000)
- Wesley Safadão (R$ 80.000)

### 5️⃣ **Listar Ofertas**
```
GET /api/ofertas
```

### 6️⃣ **Listar Disparos**
```
GET /api/disparos
```

---

## ⚡ Teste Rápido Manual

Se preferir testar manualmente, use `curl`:

### Criar Cliente
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Meu Cliente",
    "telefone": "5548999999999",
    "estados_interesse": "SP, RJ",
    "cache_tier": ["$", "$$"],
    "ativo": true
  }'
```

### Disparar Oferta
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Gusttavo Lima",
    "data": "2026-04-04",
    "estados": "SP, RJ",
    "cache_medio": 150000
  }'
```

### Listar Disparos
```bash
curl http://localhost:3001/api/disparos
```

---

## 🔍 Entendendo os Campos

### **Cliente**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome do cliente/agência |
| `telefone` | string | WhatsApp com DDI (ex: 5548999999999) |
| `estados_interesse` | string | Estados separados por vírgula (SP, RJ, MG) |
| `cache_tier` | array | Faixas de cache que interesse (["$", "$$", "$$$"]) |
| `ativo` | boolean | Se o cliente está ativo |

### **Oferta**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `artista` | string | Nome do artista/banda |
| `data` | date | Data da oferta (YYYY-MM-DD) |
| `estados` | string | Estados de interesse (SP, RJ, BA) |
| `cache_medio` | number | Valor médio do cache em reais |

### **Faixas de Cache**
| Tier | Range |
|------|-------|
| `$` | R$ 10.000 - R$ 50.000 |
| `$$` | R$ 50.000 - R$ 100.000 |
| `$$$` | R$ 100.000 - R$ 250.000 |
| `$$$$` | R$ 250.000 - R$ 500.000 |
| `$$$$$` | R$ 500.000+ |

---

## 📊 Resultado Esperado

### Status de Sucesso

```
✅ Cliente criado com ID: 1
✅ Maiara & Maraisa (R$ 100000) - Status: 201
✅ Wesley Safadão (R$ 80000) - Status: 201
✅ Zé Neto & Cristiano (R$ 200000) - Status: 201
```

### Verificação no Dashboard

Após rodar os testes, verifique em **http://localhost:5175**:

- **`/clientes`** → Veja o cliente criado
- **`/ofertas`** → Veja as 4 ofertas disparadas
- **`/disparos`** → Veja quais clientes receberam cada oferta

---

## 🐛 Troubleshooting

### ❌ "Erro: Cannot connect to http://localhost:3001"
**Solução:**
```bash
# Terminal 1: Inicie o servidor
cd server
npm start

# Terminal 2: Execute os testes
node src/http-test.js
```

### ❌ "cURL: command not found"
**Solução (Windows):**
- cURL vem instalado por padrão no Windows 10+
- Se não tiver, use a Opção 1 (Node.js) ou 3 (Batch)

### ❌ "Nenhum disparo foi feito"
**Verifique:**
1. O cliente tem os estados de interesse? 
2. O cache_tier do cliente bate com o cache_medio da oferta?
3. Confira os logs do servidor

---

## 💡 Exemplos de Testes Personalizados

### Cliente que aceita todos os cachês
```json
{
  "nome": "Premium",
  "telefone": "5548999999999",
  "estados_interesse": "SP, RJ, MG, BA, RS, SC, PE, CE",
  "cache_tier": ["$", "$$", "$$$", "$$$$", "$$$$$"],
  "ativo": true
}
```

### Cliente que aceita apenas cachê alto
```json
{
  "nome": "VIP",
  "telefone": "5548999999999",
  "estados_interesse": "SP, RJ",
  "cache_tier": ["$$$$", "$$$$$"],
  "ativo": true
}
```

### Oferta de artista consolidado
```json
{
  "artista": "Bruno & Marrone",
  "data": "2026-04-05",
  "estados": "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO",
  "cache_medio": 750000
}
```

---

## 📝 Notas Importantes

- ✅ Os testes adicionam dados, não removem
- ✅ Pode rodar múltiplas vezes sem problemas
- ✅ O WhatsApp real só é enviado se Evolution API estiver configurada
- ✅ Os disparos aparecem imediatamente em `/api/disparos`
