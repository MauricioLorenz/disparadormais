# 🧪 Guia de Testes - DatasLivres_Mais

## Scripts de Teste

### 1. **test-complete.js** - Teste Completo com Clientes de Teste

Cria clientes de teste com múltiplas faixas de cachê e dispara ofertas para validar o matching.

```bash
cd server
node src/test-complete.js
```

**O que faz:**
- ✅ Cria 5 clientes de teste com perfis variados:
  - João Silva: Alto cachê ($$$$ e $$$$$)
  - Maria Santos: Médio/Alto ($$$$ e $$$)
  - Pedro Oliveira: Baixo/Médio ($, $$, $$$)
  - Ana Costa: Apenas baixo ($)
  - Carlos Ferreira: Todos os cachês ($ até $$$$$)

- ✅ Dispara 4 ofertas de teste com diferentes cachês
- ✅ Exibe os disparos realizados (quem recebeu cada oferta)

**Saída esperada:**
```
📋 Criando clientes de teste...
✅ Cliente criado: João Silva - Alto Cachê        (ID: 1)
✅ Cliente criado: Maria Santos - Médio/Alto      (ID: 2)
...

📤 Disparando ofertas...
✅ Oferta: Gusttavo Lima             | Cache: R$750000 | ID: 1
✅ Oferta: Maiara & Maraisa          | Cache: R$375000 | ID: 2
...

📊 Disparos realizados:
ID | Cliente                      | Artista              | Cache    | Status
✅ SUCESSO ou ❌ ERRO
```

---

### 2. **import-csv-ofertas.js** - Importar Ofertas do CSV para o Banco

Lê o CSV com dados reais de ofertas e insere diretamente no banco de dados.

```bash
# Usando o CSV padrão (procura no diretório do projeto)
cd server
node src/import-csv-ofertas.js

# Ou especificando o caminho do CSV
node src/import-csv-ofertas.js "/caminho/para/seu/arquivo.csv"
```

**O que faz:**
- ✅ Faz parse do CSV com artistas, estados e faixas de cachê
- ✅ Converte labels de cachê (ex: "$$ - 50 a 100 mil reais") para valores numéricos
- ✅ Insere cada oferta na tabela `ofertas` do banco
- ✅ Exibe logs com resumo das inserções
- ✅ As ofertas aparecem imediatamente na página `/ofertas`

**Saída esperada:**
```
✔️ 12 ofertas parseadas com sucesso:

1. Gusttavo Lima                  |  28 est. | Cache: R$750000
2. Maiara & Maraisa              |   2 est. | Cache: R$375000
...

💾 Inserindo 12 ofertas no banco de dados...

✅ Gusttavo Lima                 | 28 estados | Cache: R$750000
✅ Maiara & Maraisa             |  2 estados | Cache: R$375000
...
```

---

### 3. **trigger-matching.js** - Executar Matching de Ofertas Existentes

Processa ofertas já no banco e cria disparos para clientes que fazem match.

```bash
cd server
node src/trigger-matching.js
```

**O que faz:**
- ✅ Busca todas as ofertas no banco (últimas 50)
- ✅ Para cada oferta, verifica quais clientes fazem match
- ✅ Cria registros em `disparos` com status "SIMULADO"
- ✅ Exibe quais clientes recebem cada oferta
- ✅ Mostra resumo final

**Saída esperada:**
```
🔄 Iniciando processo de matching...

🎤 Gusttavo Lima (R$750000) - Estados: SP, RJ, BA, MG
  ✅ João Silva - Alto Cachê       | Cache: R$250000-R$99999999 | Estados: SP, RJ...
  ✅ Carlos Ferreira - Todos...    | Cache: R$10000-R$99999999 | Estados: RJ, SP...
  └─ 2 clientes match

📊 RESUMO DOS DISPAROS:

Cliente                      | Ofertas | Artistas
João Silva - Alto Cachê      |       8 | Gusttavo Lima, Maiara & Maraisa, ...
```

**Exemplo de CSV esperado:**
```csv
Artista;Estado;Gênero;Medias_de_cache
Gusttavo Lima;"AC, AL, AP, AM, BA";sertanejo;$$$$$ - Acima de 500 mil reais
Maiara & Maraisa;"RS, SC";sertanejo;$$$$ - 250 a 500 mil reais
```

---

## Workflow de Teste Completo

### **Opção A: Teste com Dados de Exemplo (Recomendado para começar)**

```bash
# Terminal 1: Inicie o servidor backend
cd server
npm start

# Terminal 2: Execute teste completo (cria clientes + dispara ofertas)
cd server
node src/test-complete.js
```

Verifique no dashboard em **http://localhost:5175**:
- `/clientes` → Vê os 5 clientes de teste com múltiplas faixas de cachê
- `/ofertas` → Vê as 4 ofertas de teste
- `/disparos` → Vê quem recebeu qual oferta (matching automático)

---

### **Opção B: Importar Dados Reais do CSV**

#### 1. **Criar clientes manualmente ou via API**
   - Use o frontend em `/clientes` para criar clientes com múltiplas faixas
   - Ou copie clientes do teste anterior

#### 2. **Importar ofertas do CSV**
```bash
cd server
node src/import-csv-ofertas.js

# Especificar caminho customizado:
node src/import-csv-ofertas.js "/caminho/para/export_All-Oportunidade-Data-Vendedors-modified_2026-03-17_16-18-51.csv"
```

As ofertas aparecem imediatamente em `/ofertas`

#### 3. **Executar matching**
```bash
cd server
node src/trigger-matching.js
```

Os disparos aparecem em `/disparos`

---

### **Opção C: Importar CSV + Gerar Matching em Um Comando**

```bash
cd server

# 1. Importar ofertas
node src/import-csv-ofertas.js

# 2. Executar matching
node src/trigger-matching.js
```

Agora verifique tudo no frontend em **http://localhost:5175**!

---

## Estrutura de Dados

### Oferta (Webhook)
```json
{
  "artista": "string",
  "data": "YYYY-MM-DD",
  "estados": "AC, AL, AP, AM",
  "cache_medio": 750000
}
```

### Matching Logic
Uma oferta é enviada para um cliente se:
1. **Cache Match**: `cliente.cache_min <= oferta.cache_medio <= cliente.cache_max`
   - Exemplo: Cliente com tiers "$$" e "$$$" tem range de R$50k a R$250k
2. **Estados Match**: Pelo menos um estado da oferta está na lista de interesse do cliente

---

## Troubleshooting

### ❌ "Erro: Cannot connect to http://localhost:3001"
- Certifique-se de que o servidor está rodando em `npm start` ou `node src/index.js`
- Verifique a porta no arquivo `.env` ou `index.js` (padrão: 3001)

### ❌ "CSV vazio ou inválido"
- Verifique o encoding do arquivo (deve ser UTF-8)
- Confira se a primeira linha tem os headers: `Artista;Estado;Gênero;Medias_de_cache`
- Verifique se o caminho do arquivo está correto

### ❌ "Nenhum cliente selecionado / Nenhuma oferta disparada"
- Consulte os logs do servidor para erros
- Verifique o arquivo `database.sqlite` com um visualizador SQLite

---

## Verificação Manual via API

### Criar cliente com múltiplas faixas:
```bash
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "telefone": "5548999999999",
    "estados_interesse": "SP, RJ",
    "cache_tier": ["$$", "$$$"],
    "ativo": true
  }'
```

### Disparar oferta:
```bash
curl -X POST http://localhost:3001/api/ofertas \
  -H "Content-Type: application/json" \
  -d '{
    "artista": "Artista Teste",
    "data": "2026-03-17",
    "estados": "SP, RJ",
    "cache_medio": 150000
  }'
```

### Listar disparos:
```bash
curl http://localhost:3001/api/disparos
```

---

## 📝 Notas Importantes

- Os scripts apagam dados anteriores? **Não.** Eles adicionam novos registros.
- Posso usar múltiplas faixas de cachê? **Sim!** Basta enviar um array `cache_tier: ["$", "$$$"]`
- O WhatsApp real é enviado? **Não**, a menos que as credenciais Evolution API estejam configuradas no `.env`
- Os logs de disparo aparecem em `/api/disparos`? **Sim!**, você pode consultar via API ou no frontend.
