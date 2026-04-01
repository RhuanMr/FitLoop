# ✅ Setup FitLoop Backend - RESOLVIDO

O script `npm run setup` agora está **100% funcional**!

## 🚀 O que foi corrigido

- ✅ Erros de tipagem TypeScript resolvidos
- ✅ Sistema de verificação de tabelas implementado
- ✅ Instruções claras para criar as tabelas manualmente
- ✅ Script de seeding para inserir dados de exemplo
- ✅ Validação de conexão com Supabase

---

## 📋 Como usar agora

### 1️⃣ Verificar setup (execute primeiro)

```bash
npm run setup
```

Isso vai:
- ✅ Testar conexão com Supabase
- ✅ Verificar quais tabelas existem
- ✅ Tentar inserir dados de exemplo
- ✅ Mostrar próximos passos

### 2️⃣ Se as tabelas não existem

O script vai pedir para criar manualmente. Escolha um método:

**Método A: No Supabase Dashboard (mais fácil)** ⭐

1. Abra: https://supabase.com/dashboard/project/_/sql/new
2. Copie o arquivo: `src/migrations/schema.sql`
3. Cole no SQL Editor
4. Clique em [Run]

**Método B: Linha de comando (se tiver psql)**

```bash
psql -h seu-projeto.supabase.co -U postgres < src/migrations/schema.sql
```

### 3️⃣ Instalar e rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3333

### 4️⃣ (Opcional) Inserir sites de exemplo

```bash
npm run seed:sites
```

---

## 📊 Scripts disponíveis

| Comando | Função |
|---------|--------|
| `npm run setup` | Verifica setup e configurações |
| `npm run seed:sites` | Insere 3 sites de exemplo |
| `npm run dev` | Inicia servidor com hot-reload |
| `npm run build` | Compila TypeScript |
| `npm run seed` | Insere seeds de banners |

---

## 🔍 Verificando se tudo está ok

Após rodar `npm run setup`, você deve ver:

```
✅ banners
✅ sites
✅ suggested_posts

🎉 Todas as tabelas existem!
```

Se não ver, significa que precisa criar as tabelas manualmente no Supabase.

---

## 🐛 Troubleshooting

### "Could not find the table 'public.sites' in the schema cache"

- Isso significa que a tabela ainda não existe
- Crie via Supabase SQL Editor (veja passo 2️⃣)
- Wait 30 segundos e tente novamente

### "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured"

- Copie `.env.example` para `.env`
- Preencha com suas credenciais do Supabase

### Conexão recusada

- Verifique se `SUPABASE_URL` está correto
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` é válido

---

## 📝 Arquivo de referência

O arquivo **`src/migrations/schema.sql`** contém:

- ✅ Criação de 3 tabelas principais
- ✅ 7 índices para performance
- ✅ Constraints e validações
- ✅ Scripts de verificação

Use este arquivo para criar as tabelas manualmente se o script não funcionar.

---

## ✨ Resumo final

1. `npm run setup` → verifica tudo
2. Se preciso: create tabelas no Supabase
3. `npm install` → instala dependências
4. `npm run dev` → inicia servidor
5. Pronto! 🚀

