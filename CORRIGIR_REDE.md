# 🌐 Correção do Erro de Rede no App

## Problema Identificado

O erro "Network Error" ocorre porque o app React Native não consegue se conectar ao backend em `localhost:4000`.

**Em React Native, `localhost` não funciona!** Você precisa usar o IP da sua máquina.

## Solução

### 1. **Encontrar seu IP Local**

**No Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**No Windows:**
```bash
ipconfig
```

Procure por algo como: `192.168.1.100` ou `10.0.0.100`

### 2. **Atualizar o IP no App**

Edite o arquivo `FitLoop/src/services/api.ts`:

```typescript
// Substitua pelo seu IP real
const API_URL = 'http://192.168.1.100:4000/banners'; // ⚠️ ALTERE ESTE IP!
```

### 3. **Opções por Plataforma**

**Para Android Emulator:**
```typescript
const API_URL = 'http://10.0.2.2:4000/banners';
```

**Para iOS Simulator:**
```typescript
const API_URL = 'http://localhost:4000/banners';
```

**Para Dispositivo Físico:**
```typescript
const API_URL = 'http://192.168.1.100:4000/banners'; // Seu IP real
```

### 4. **Verificar se o Backend está Rodando**

```bash
cd backend
npm run dev
```

Deve mostrar:
```
Servidor rodando na porta 4000
```

### 5. **Testar a Conexão**

Abra o navegador e acesse:
```
http://SEU_IP:4000/banners
```

Deve retornar JSON com os banners.

## Passos Detalhados

### Passo 1: Encontrar o IP
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### Passo 2: Atualizar o Código
1. Abra `FitLoop/src/services/api.ts`
2. Substitua `192.168.1.100` pelo seu IP real
3. Salve o arquivo

### Passo 3: Reiniciar o App
```bash
cd FitLoop
npm start
# ou
expo start
```

### Passo 4: Verificar Logs
No console do app, deve aparecer:
```
🔍 Tentando buscar banners...
API URL: http://SEU_IP:4000/banners
✅ Banners carregados com sucesso: {...}
```

## Troubleshooting

### ❌ **"Network Error"**
- Verifique se o IP está correto
- Verifique se o backend está rodando
- Teste no navegador: `http://SEU_IP:4000/banners`

### ❌ **"Connection refused"**
- Backend não está rodando
- Execute: `cd backend && npm run dev`

### ❌ **"Timeout"**
- Firewall bloqueando a conexão
- Verifique se a porta 4000 está liberada

### ❌ **"404 Not Found"**
- URL incorreta
- Verifique se o backend está em `/banners`

## Exemplo Completo

**Seu IP é `192.168.1.50`:**

```typescript
// FitLoop/src/services/api.ts
const API_URL = 'http://192.168.1.50:4000/banners';
```

**Teste no navegador:**
```
http://192.168.1.50:4000/banners
```

## Logs Esperados

**Console do App:**
```
🔍 Tentando buscar banners...
API URL: http://192.168.1.50:4000/banners
Params: { status: 'active', limit: 10, include_scheduled: false }
✅ Banners carregados com sucesso: { banners: [...], total: 0, ... }
```

**Console do Backend:**
```
2024-01-15T10:00:00.000Z - GET /banners
=== GET BANNERS DEBUG ===
Query executada com sucesso. Banners encontrados: 0
```

## Próximos Passos

1. ✅ Encontre seu IP local
2. ✅ Atualize o IP no arquivo `api.ts`
3. ✅ Reinicie o app
4. ✅ Verifique os logs
5. ✅ Teste a conexão

**Encontre seu IP e atualize o arquivo `api.ts`!** 🎯
