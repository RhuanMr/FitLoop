# 🎯 Instruções Finais - Correção do Banco

## Problema Identificado

O script anterior falhou porque não consegue acessar `information_schema.columns` através da API do Supabase. Vou usar uma abordagem mais direta.

## Solução Simples

### 1. **Execute o Teste Direto:**

```bash
cd backend
npm run test-db
```

Este script irá:
- ✅ Testar inserção básica (sem agendamento)
- ✅ Testar inserção com agendamento
- ✅ Mostrar exatamente qual SQL executar se falhar

### 2. **Se o Teste Falhar:**

O script mostrará exatamente este SQL para executar no Supabase Dashboard:

```sql
ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;
```

### 3. **Execute o SQL no Supabase:**

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole e execute o SQL mostrado pelo script
4. Execute `npm run test-db` novamente

## Alternativa: Solução Manual Completa

Se preferir fazer manualmente, execute este SQL completo no Supabase:

```sql
-- Verificar se a tabela existe
SELECT * FROM banners LIMIT 1;

-- Se der erro, criar a tabela:
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

-- Se a tabela já existe, adicionar as colunas:
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP;

-- Verificar se funcionou:
SELECT * FROM banners LIMIT 1;
```

## Teste Final

Após executar o SQL:

1. **Execute o teste:**
   ```bash
   npm run test-db
   ```

2. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

3. **Teste o upload no admin**

## Logs Esperados

**Se funcionar:**
```
✅ Teste básico passou!
✅ Teste de agendamento passou!
🎉 Todos os testes passaram! O banco está correto.
```

**Se falhar:**
```
❌ Erro no teste de agendamento: [erro]
💡 As colunas scheduled_start e scheduled_end não existem!
📋 Execute este SQL no Supabase Dashboard:
ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;
```

## Próximos Passos

1. ✅ Execute: `npm run test-db`
2. ✅ Se falhar, execute o SQL no Supabase
3. ✅ Execute `npm run test-db` novamente
4. ✅ Reinicie o servidor
5. ✅ Teste o upload

**Execute `npm run test-db` e me informe o resultado!** 🎯
