# Configuração do Backend - FitLoop

## Problema Identificado

O erro 500 "Internal Server Error" está ocorrendo porque as **variáveis de ambiente do Supabase não estão configuradas**.

## Solução

### 1. Criar arquivo .env

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
BUCKET_NAME=nome_do_bucket_aqui
PORT=4000
```

### 2. Obter credenciais do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
4. Vá em **Storage** e copie o nome do bucket → `BUCKET_NAME`

### 3. Estrutura da tabela banners

Certifique-se de que a tabela `banners` no Supabase tenha as seguintes colunas:

```sql
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

### 4. Configurar Storage

1. No Supabase Dashboard, vá em **Storage**
2. Crie um bucket (se não existir)
3. Configure as políticas de acesso:
   - **SELECT**: `true` (para permitir leitura)
   - **INSERT**: `true` (para permitir upload)
   - **UPDATE**: `true` (para permitir edição)
   - **DELETE**: `true` (para permitir remoção)

### 5. Reiniciar o servidor

Após configurar o `.env`, reinicie o servidor:

```bash
cd backend
npm run dev
```

## Logs de Debug

Adicionei logs detalhados no código para ajudar a identificar problemas:

- ✅ Logs de entrada dos dados
- ✅ Logs de upload de arquivo
- ✅ Logs de inserção no banco
- ✅ Tratamento de erros melhorado

## Verificação

Após configurar, teste o upload de um banner. Os logs no console mostrarão:

```
=== UPLOAD BANNER DEBUG ===
Body: { title: '...', exhibition_order: '1', ... }
File: { originalname: '...', size: 12345, ... }
Fazendo upload do arquivo...
Bucket name: seu_bucket
Upload realizado com sucesso. URL: https://...
Inserindo banner no banco de dados...
Banner inserido com sucesso: [...]
```

Se ainda houver erro, os logs mostrarão exatamente onde está o problema.
