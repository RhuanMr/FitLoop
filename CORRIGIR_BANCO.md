# 🔧 Correção do Banco de Dados

## Problema Identificado

O erro indica que as colunas `scheduled_start` e `scheduled_end` não existem na tabela `banners` do Supabase:

```
Could not find the 'scheduled_end' column of 'banners' in the schema cache
```

## Solução

### Opção 1: Executar SQL no Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - Clique em "SQL Editor" no menu lateral

3. **Execute o seguinte SQL:**
   ```sql
   -- Adicionar colunas de agendamento
   ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP;
   ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP;
   ```

4. **Verificar se funcionou:**
   ```sql
   -- Verificar estrutura da tabela
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'banners' 
   ORDER BY ordinal_position;
   ```

### Opção 2: Usar o Script de Verificação

1. **Execute o script de verificação:**
   ```bash
   cd backend
   npm run check-schema
   ```

2. **Se o script indicar erro**, execute o SQL da Opção 1

### Opção 3: Recriar a Tabela (Se necessário)

Se a tabela não existir ou estiver muito desorganizada:

```sql
-- CUIDADO: Isso apagará todos os dados existentes!
DROP TABLE IF EXISTS banners;

-- Criar tabela completa
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

## Estrutura Final Esperada

A tabela `banners` deve ter as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | Chave primária |
| `title` | VARCHAR | Título do banner |
| `url_image` | VARCHAR | URL da imagem |
| `exhibition_order` | INTEGER | Ordem de exibição |
| `description` | TEXT | Descrição (opcional) |
| `status` | VARCHAR | Status (active/inactive/archived) |
| `created_at` | TIMESTAMP | Data de criação |
| `scheduled_start` | TIMESTAMP | Data/hora de início (opcional) |
| `scheduled_end` | TIMESTAMP | Data/hora de fim (opcional) |

## Teste Após Correção

1. **Execute o script de verificação:**
   ```bash
   cd backend
   npm run check-schema
   ```

2. **Reinicie o servidor backend:**
   ```bash
   npm run dev
   ```

3. **Teste o upload de banner** no admin

4. **Verifique os logs** para confirmar que não há mais erro

## Logs Esperados Após Correção

**Backend:**
```
=== UPLOAD BANNER DEBUG ===
Body: { title: 'Teste', exhibition_order: '1', ... }
File: { originalname: 'teste.jpg', ... }
Fazendo upload do arquivo...
Upload realizado com sucesso. URL: https://...
Inserindo banner no banco de dados...
Banner inserido com sucesso: [...]
```

**Frontend:**
```
Response: { success: true, data: [...] }
```

## Próximos Passos

1. ✅ Execute o SQL no Supabase Dashboard
2. ✅ Teste o upload de banner
3. ✅ Verifique se os banners aparecem no app
4. ✅ Teste a funcionalidade de agendamento

Após executar o SQL, o erro deve ser resolvido! 🎉
