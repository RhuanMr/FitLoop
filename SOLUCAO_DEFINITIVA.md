# 🔧 Solução Definitiva para o Problema do Banco

## Problema Persistente

O erro ainda indica que as colunas `scheduled_start` e `scheduled_end` não existem:

```
Could not find the 'scheduled_end' column of 'banners' in the schema cache
```

## Soluções Disponíveis

### 🚀 **Solução 1: Script Automático (Recomendado)**

Execute o script que criei para corrigir automaticamente:

```bash
cd backend
npm run fix-db
```

Este script irá:
- ✅ Verificar se a tabela existe
- ✅ Criar a tabela se não existir
- ✅ Adicionar colunas faltantes
- ✅ Testar a inserção
- ✅ Limpar dados de teste

### 🛠️ **Solução 2: SQL Manual no Supabase**

Se o script não funcionar, execute manualmente no Supabase Dashboard:

1. **Acesse:** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Vá em:** SQL Editor
3. **Execute este SQL:**

```sql
-- Verificar se a tabela existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'banners';

-- Se não existir, criar a tabela completa
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  url_image VARCHAR NOT NULL,
  exhibition_order INTEGER NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP
);

-- Se a tabela já existir, adicionar apenas as colunas faltantes
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;
```

### 🔄 **Solução 3: Recriar Tabela (Último Recurso)**

Se nada funcionar, recrie a tabela (⚠️ **APAGA TODOS OS DADOS**):

```sql
-- CUIDADO: Isso apagará todos os banners existentes!
DROP TABLE IF EXISTS banners;

-- Criar tabela nova
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  url_image VARCHAR NOT NULL,
  exhibition_order INTEGER NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP
);
```

## Teste Após Correção

### 1. **Execute o Script de Correção:**
```bash
cd backend
npm run fix-db
```

### 2. **Reinicie o Servidor:**
```bash
npm run dev
```

### 3. **Teste o Upload:**
- Abra o admin
- Preencha o formulário
- Selecione uma imagem
- Clique em "Salvar"

### 4. **Verifique os Logs:**

**Backend (deve mostrar):**
```
=== UPLOAD BANNER DEBUG ===
Dados para inserção: { title: '...', url_image: '...', ... }
Banner inserido com sucesso: [...]
```

**Frontend (deve mostrar):**
```
Response: { success: true, data: [...] }
```

## Estrutura Final Esperada

A tabela `banners` deve ter exatamente estas colunas:

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | SERIAL | NO | Chave primária |
| `title` | VARCHAR | NO | Título do banner |
| `url_image` | VARCHAR | NO | URL da imagem |
| `exhibition_order` | INTEGER | NO | Ordem de exibição |
| `description` | TEXT | YES | Descrição |
| `status` | VARCHAR | YES | Status (active/inactive/archived) |
| `created_at` | TIMESTAMP | YES | Data de criação |
| `scheduled_start` | TIMESTAMP | YES | Data/hora de início |
| `scheduled_end` | TIMESTAMP | YES | Data/hora de fim |

## Troubleshooting

### ❌ **"Table doesn't exist"**
- Execute a Solução 2 (SQL Manual)
- Use o comando CREATE TABLE

### ❌ **"Column doesn't exist"**
- Execute: `ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;`
- Execute: `ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;`

### ❌ **"Permission denied"**
- Verifique se está usando a `service_role_key` no `.env`
- Não use a `anon_key`

### ❌ **Script não funciona**
- Execute o SQL manualmente no Supabase Dashboard
- Verifique se o arquivo `.env` está correto

## Próximos Passos

1. ✅ Execute `npm run fix-db`
2. ✅ Reinicie o servidor
3. ✅ Teste o upload
4. ✅ Verifique se funciona

**Após executar uma dessas soluções, o problema deve ser resolvido definitivamente!** 🎉
