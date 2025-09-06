# 🔍 Instruções de Debug - Upload de Banner

## Logs Adicionados

Adicionei logs detalhados em todo o fluxo para identificar exatamente onde está o problema:

### 1. **Frontend (Admin)**
- ✅ Logs no formulário quando arquivo é selecionado
- ✅ Logs no submit do formulário
- ✅ Logs no serviço de banner
- ✅ Exibição do nome e tamanho do arquivo selecionado

### 2. **Backend**
- ✅ Logs de todas as requisições HTTP
- ✅ Logs detalhados no controller de upload
- ✅ Logs de erro do multer
- ✅ Logs de upload para Supabase
- ✅ Logs de inserção no banco

## Como Testar

### 1. **Abra o Console do Navegador**
- Pressione `F12` no admin
- Vá na aba `Console`

### 2. **Teste a Seleção de Imagem**
1. Clique em "Selecionar Imagem"
2. Escolha uma imagem
3. **Verifique no console:**
   ```
   Arquivo selecionado: File { name: "imagem.jpg", size: 123456, ... }
   ```
4. **Verifique na tela:** Deve aparecer o nome e tamanho da imagem

### 3. **Teste o Envio**
1. Preencha todos os campos obrigatórios
2. Clique em "Salvar"
3. **Verifique no console do navegador:**
   ```
   === SUBMIT FORM DEBUG ===
   Values: { title: "...", exhibition_order: 1, ... }
   Imagem: File { name: "imagem.jpg", ... }
   Imagem adicionada ao FormData: imagem.jpg
   Enviando FormData...
   === BANNER SERVICE DEBUG ===
   API URL: http://localhost:4000/banners/upload
   FormData entries:
   title: Título do banner
   exhibition_order: 1
   imagem: [object File]
   ```

### 4. **Verifique no Console do Backend**
```
2024-01-15T10:00:00.000Z - POST /banners/upload
Headers: { ... }
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
=== UPLOAD BANNER DEBUG ===
Body: { title: '...', exhibition_order: '1', ... }
File: { originalname: 'imagem.jpg', size: 123456, ... }
Fazendo upload do arquivo...
Bucket name: seu_bucket
Upload realizado com sucesso. URL: https://...
Inserindo banner no banco de dados...
Banner inserido com sucesso: [...]
```

## Possíveis Problemas e Soluções

### ❌ **"Nenhuma imagem selecionada"**
- **Causa:** Arquivo não está sendo selecionado corretamente
- **Solução:** Verifique se o input file está funcionando

### ❌ **Erro no multer**
- **Causa:** Arquivo muito grande ou formato inválido
- **Solução:** Use imagem menor que 10MB

### ❌ **Erro no upload para Supabase**
- **Causa:** Variáveis de ambiente incorretas
- **Solução:** Verifique o arquivo `.env`

### ❌ **Erro no banco de dados**
- **Causa:** Tabela não existe ou campos incorretos
- **Solução:** Verifique a estrutura da tabela `banners`

## Próximos Passos

1. **Teste o fluxo completo** seguindo as instruções acima
2. **Copie os logs** que aparecem no console
3. **Identifique onde o erro está ocorrendo** baseado nos logs
4. **Reporte o erro específico** com os logs para análise

## Estrutura Esperada da Tabela

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

Com esses logs, conseguiremos identificar exatamente onde está o problema! 🎯
