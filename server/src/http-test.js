import https from 'https';
import http from 'http';

/**
 * Script de teste HTTP para disparar ofertas via API
 *
 * Uso local:  node src/http-test.js
 * Uso Vercel: BASE_URL=https://SEU-PROJETO.vercel.app node src/http-test.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Função para fazer requisição HTTP/HTTPS
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: body ? JSON.parse(body) : null,
            headers: res.headers,
          });
        } catch {
          resolve({ status: res.statusCode, body: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para exibir resultados
function logResult(title, result) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.body, null, 2));
}

// Função principal de teste
async function runTests() {
  console.log(`🚀 Testando API em: ${BASE_URL}\n`);

  try {
    // ============================================
    // 1️⃣ CRIAR CLIENTE
    // ============================================
    const clienteData = {
      nome: 'Cliente Teste HTTP',
      telefone: '5548999999999',
      estados_interesse: 'SP, RJ, MG',
      cache_tier: ['$$', '$$$'],
      ativo: true,
    };

    console.log('1️⃣ Criando cliente...');
    const clienteResult = await makeRequest('POST', '/api/clientes', clienteData);
    logResult('Criar Cliente', clienteResult);

    if (clienteResult.status !== 201 && clienteResult.status !== 400) {
      console.error('❌ Erro inesperado ao criar cliente!');
      return;
    }

    const clienteId = clienteResult.body?.id;
    if (clienteId) {
      console.log(`✅ Cliente criado com ID: ${clienteId}`);
    } else {
      console.log(`ℹ️  Cliente já existia ou erro: ${JSON.stringify(clienteResult.body)}`);
    }

    // ============================================
    // 2️⃣ LISTAR CLIENTES
    // ============================================
    console.log('\n2️⃣ Listando clientes...');
    const clientesResult = await makeRequest('GET', '/api/clientes');
    logResult('Listar Clientes', clientesResult);

    // ============================================
    // 3️⃣ DISPARAR OFERTA
    // ============================================
    const ofertaData = {
      artista: 'Gusttavo Lima',
      data: new Date().toISOString().split('T')[0],
      estados: 'SP, RJ, MG',
      cache_medio: 150000,
    };

    console.log('\n3️⃣ Disparando oferta...');
    const ofertaResult = await makeRequest('POST', '/api/ofertas', ofertaData);
    logResult('Disparar Oferta', ofertaResult);

    // ============================================
    // 4️⃣ LISTAR OFERTAS
    // ============================================
    console.log('\n4️⃣ Listando ofertas...');
    const ofertasResult = await makeRequest('GET', '/api/ofertas');
    logResult('Listar Ofertas', ofertasResult);

    // ============================================
    // 5️⃣ LISTAR DISPAROS
    // ============================================
    console.log('\n5️⃣ Listando disparos...');
    const disparosResult = await makeRequest('GET', '/api/disparos');
    logResult('Listar Disparos', disparosResult);

    // ============================================
    // 6️⃣ DISPARAR MÚLTIPLAS OFERTAS
    // ============================================
    console.log('\n6️⃣ Disparando múltiplas ofertas...\n');

    const ofertas = [
      {
        artista: 'Maiara & Maraisa',
        data: new Date().toISOString().split('T')[0],
        estados: 'RS, SC',
        cache_medio: 100000,
      },
      {
        artista: 'Zé Neto & Cristiano',
        data: new Date().toISOString().split('T')[0],
        estados: 'SP, RJ',
        cache_medio: 200000,
      },
      {
        artista: 'Wesley Safadão',
        data: new Date().toISOString().split('T')[0],
        estados: 'BA, PE, CE',
        cache_medio: 80000,
      },
    ];

    for (const oferta of ofertas) {
      const result = await makeRequest('POST', '/api/ofertas', oferta);
      const ok = result.status === 200 || result.status === 201;
      console.log(`${ok ? '✅' : '❌'} ${oferta.artista} (R$ ${oferta.cache_medio}) - Status: ${result.status}`);
    }

    // ============================================
    // 7️⃣ VERIFICAR DISPAROS FINAIS
    // ============================================
    console.log('\n7️⃣ Verificando disparos finais...');
    const disparosFinalResult = await makeRequest('GET', '/api/disparos');
    logResult('Disparos Finais', disparosFinalResult);

    console.log('\n✅ Testes concluídos!\n');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error('Verifique se o servidor está rodando em:', BASE_URL);
  }
}

runTests();
