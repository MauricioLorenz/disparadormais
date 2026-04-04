# COMECE AQUI - Testes HTTP de Ofertas

Guia rápido para disparar ofertas via API HTTP.

---

## AMBIENTE

| Ambiente | URL Base |
|----------|----------|
| Local    | `http://localhost:3001` |
| Vercel   | `https://SEU-PROJETO.vercel.app` |

> Substitua `SEU-PROJETO` pelo nome real do seu projeto no Vercel.

---

## TESTAR NA VERCEL (Produção)

### Criar Cliente
```bash
curl -X POST https://SEU-PROJETO.vercel.app/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Meu Cliente","telefone":"5548999999999","estados_interesse":"SP, RJ","cache_tier":["$","$$"],"ativo":true}'
```

### Disparar Oferta
```bash
curl -X POST https://SEU-PROJETO.vercel.app/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ","cache_medio":150000}'
```

### Listar Disparos
```bash
curl -X GET https://SEU-PROJETO.vercel.app/api/disparos \
  -H "Content-Type: application/json"
```

---

## TESTAR LOCAL (Desenvolvimento)

### 1 - Iniciar Servidor
```bash
cd server
npm start
```

### 2 - Escolha UMA opção de teste

**Opcao A: Node.js (local)**
```bash
cd server
node src/http-test.js
```

**Opcao B: Node.js (Vercel)**
```bash
cd server
BASE_URL=https://SEU-PROJETO.vercel.app node src/http-test.js
```

**Opcao C: PowerShell**
```powershell
cd server
powershell -ExecutionPolicy Bypass -File curl-powershell.ps1
```

### 3 - Verificar Resultados
- Local: http://localhost:5175/disparos
- Vercel: https://SEU-PROJETO.vercel.app/disparos

---

## COMANDO cURL SIMPLES (Local)

### Criar Cliente
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Meu Cliente","telefone":"5548999999999","estados_interesse":"SP, RJ","cache_tier":["$","$$"],"ativo":true}'
```

### Disparar Oferta
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{"artista":"Gusttavo Lima","data":"2026-04-04","estados":"SP, RJ","cache_medio":150000}'
```

### Listar Disparos
```bash
curl -X GET http://localhost:3001/api/disparos \
  -H "Content-Type: application/json"
```

---

## ARQUIVOS DISPONÍVEIS

| Arquivo | Descrição |
|---------|-----------|
| `server/HTTP-TEST.md` | Documentação completa dos testes |
| `server/CURL-EXAMPLES.md` | 10 exemplos diferentes de cURL |
| `server/CURL-QUICK.txt` | Comandos prontos para copiar e colar |
| `server/METODO-HTTP-JSON.md` | Estrutura de cada endpoint |
| `server/src/http-test.js` | Script Node.js (suporta BASE_URL env) |
| `server/curl-powershell.ps1` | Script PowerShell automático |

---

## ESTRUTURA DE DADOS

### POST /api/ofertas
```json
{
  "artista": "Gusttavo Lima",
  "data": "2026-04-04",
  "estados": "SP, RJ, MG",
  "cache_medio": 150000
}
```

### POST /api/clientes
```json
{
  "nome": "Meu Cliente",
  "telefone": "5548999999999",
  "estados_interesse": "SP, RJ",
  "cache_tier": ["$", "$$"],
  "ativo": true
}
```

### GET /api/disparos
```json
[
  {
    "cliente_nome": "Meu Cliente",
    "artista_nome": "Gusttavo Lima",
    "cache_value": 150000,
    "status": "SUCESSO"
  }
]
```

---

## DUVIDAS?

Verifique:
- `/api/clientes` - Clientes criados
- `/api/ofertas` - Ofertas disparadas
- `/api/disparos` - Matching realizado
