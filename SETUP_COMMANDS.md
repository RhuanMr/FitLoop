# 🚀 Guia de Configuração - FitLoop

## 📋 Sumário de Comandos

Este documento contém todos os comandos necessários para configurar e rodar o projeto FitLoop.

---

## 1️⃣ **Configuração Inicial**

### 1.1 Acessar a pasta do backend
```bash
cd backend
```

### 1.2 Instalar dependências
```bash
npm install
```

### 1.3 Criar arquivo `.env`
Copie o arquivo `.env.example` e preencha com suas credenciais:
```bash
cp .env.example .env
```

**Variáveis obrigatórias no `.env`:**
```
SUPABASE_URL=https://[seu-project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (cole sua service role key)
SUPABASE_ANON_KEY=eyJhbGc... (cole sua anon key)
SUPABASE_BUCKET_NAME=fitloop-banners
PORT=3000
```

---

## 2️⃣ **Criar Tabelas no Banco de Dados**

### 2.1 Abrir SQL Editor do Supabase
Acesse: **https://supabase.com/dashboard/project/[seu-project-id]/sql/new**

### 2.2 Cole e execute este SQL:
```sql
-- Droprar tabelas antigas (se existirem)
DROP TABLE IF EXISTS suggested_posts CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS banners CASCADE;

-- Criar tabelas
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  url_image VARCHAR NOT NULL,
  exhibition_order INTEGER NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  from_suggested_post BOOLEAN DEFAULT FALSE
);

CREATE TABLE sites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  interval_hours DECIMAL(4,1) NOT NULL CHECK (interval_hours >= 0.5 AND interval_hours <= 168),
  selector_title TEXT NOT NULL,
  selector_image TEXT NOT NULL,
  selector_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_crawled TIMESTAMP WITH TIME ZONE
);

CREATE TABLE suggested_posts (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  article_url TEXT,
  source_site VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_banner_at TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_sites_active ON sites(is_active);
CREATE INDEX idx_sites_last_crawled ON sites(last_crawled);
CREATE INDEX idx_suggested_posts_site_id ON suggested_posts(site_id);
CREATE INDEX idx_suggested_posts_approved ON suggested_posts(is_approved);
CREATE INDEX idx_suggested_posts_created_at ON suggested_posts(created_at);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_order ON banners(exhibition_order);
```

### 2.3 Clique em **[Run]** para executar

---

## 3️⃣ **Verificar Configuração do Banco**

### 3.1 Rodar diagnóstico
```bash
npm run diagnostic
```

Este comando verifica se:
- ✅ Conexão com Supabase está funcionando
- ✅ As 3 tabelas existem (banners, sites, suggested_posts)
- ✅ Indices estão criados
- ✅ Banco está pronto para uso

---

## 4️⃣ **Popular Banco com Dados Iniciais**

### 4.1 Inserir sites de exemplo
```bash
npm run seed:sites
```

Isso insere 3 sites de exemplo:
- **G1** (notícias de tecnologia)
- **UOL** (notícias gerais)
- **Folha** (notícias de economia)

### 4.2 Verificar se os dados foram inseridos
```bash
npm run check:structure
```

---

## 5️⃣ **Rodar o Servidor**

### 5.1 Modo desenvolvimento (com hot reload)
```bash
npm run dev
```

O servidor iniciará em: **http://localhost:3000**

### 5.2 Rodar em produção (após build)
```bash
npm run build
npm start
```

---

## 📝 **Fluxo Completo (linha por linha)**

Se é a primeira vez configurando, execute nesta ordem:

```bash
# 1. Entrar em backend
cd backend

# 2. Instalar dependências
npm install

# 3. Copiar e preencher .env
cp .env.example .env
# 👉 EDITE O ARQUIVO .env COM SUAS CREDENCIAIS SUPABASE

# 4. Criar tabelas no Supabase (via dashboard)
# 👉 ACESSE https://supabase.com/dashboard/project/[seu-id]/sql/new
# 👉 COLE O SQL DA SEÇÃO 2.2
# 👉 CLIQUE EM [Run]

# 5. Volte ao terminal e aguarde 10 segundos

# 6. Verificar se está tudo OK
npm run diagnostic

# 7. Popular o banco com sites de exemplo
npm run seed:sites

# 8. Rodar o servidor
npm run dev
```

---

## 🔧 **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Rodar servidor em modo desenvolvimento |
| `npm run build` | Compilar TypeScript para JavaScript |
| `npm start` | Rodar servidor (produção) |
| `npm run diagnostic` | Verificar status do banco de dados |
| `npm run check:structure` | Verificar estrutura das tabelas |
| `npm run seed:sites` | Inserir sites de exemplo |
| `npm run seed:refresh` | Recriar e popular sites |
| `npm run force:create-tables` | Tentar criar tabelas via CLI (requer RPC) |

---

## ⚠️ **Problemas Comuns**

### ❌ "PGRST205 - Could not find table in schema cache"
**Solução:** As tabelas não foram criadas. Verifique se você executou o SQL no dashboard (seção 2.2).

### ❌ "Connection refused" ou "ECONNREFUSED"
**Solução:** Verifique se a URL e keys do `.env` estão corretas.

### ❌ "npm: command not found"
**Solução:** Instale Node.js em https://nodejs.org (versão 18+)

### ❌ "ts-node: command not found"
**Solução:** Execute `npm install` novamente na pasta `backend`.

---

## 📚 **Estrutura de Pastas**

```
FitLoop/
├── backend/                    # API Express + TypeScript
│   ├── src/
│   │   ├── server.ts          # Arquivo principal
│   │   ├── controllers/       # Lógica de requisições
│   │   ├── services/          # Lógica de negócio
│   │   ├── routes/            # Definição de rotas
│   │   ├── migrations/        # Scripts de banco
│   │   └── types/             # Tipos TypeScript
│   ├── package.json
│   ├── .env                   # ⚠️ Crie este arquivo
│   └── .env.example           # Template
├── banner-admin/              # Dashboard React
├── FitLoop/                   # App React Native
└── SETUP_COMMANDS.md          # Este arquivo
```

---

## 🎯 **Próximos Passos**

Após completar o setup:

1. **Backend APIs disponíveis:**
   - `POST /api/banners` - Criar banner
   - `GET /api/banners` - Listar banners
   - `POST /api/sites` - Criar site
   - `GET /api/sites` - Listar sites

2. **Configurar o banner-admin (dashboard):**
   ```bash
   cd banner-admin
   npm install
   npm start
   ```

3. **Configurar o FitLoop (app mobile):**
   ```bash
   cd FitLoop
   npm install
   npm start
   ```

---

## 💡 **Dicas**

- Mantenha o `.env` **seguro** - nunca faça commit dessa arquivo
- Se mudar algo no banco, execute `npm run diagnostic` para verificar
- Os logs do servidor ajudam a debugar: monitore o terminal onde rodou `npm run dev`

---

**Criado em:** 1º de Abril de 2026  
**Última atualização:** -

