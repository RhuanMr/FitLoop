# 🤖 Sistema de Gerador de Posts Automáticos

## Nova Funcionalidade Implementada

### ✅ **Sistema Completo de Web Crawler:**
- **🌐 Gerenciamento de Sites** - Adicionar sites para monitoramento
- **⏰ Agendamento Automático** - Crawler executa em intervalos configuráveis
- **📰 Posts Sugeridos** - Visualizar e aprovar posts encontrados
- **🔄 Conversão para Banners** - Transformar posts em banners automaticamente

## Como Configurar

### 1. **Executar Migração do Banco**
```bash
cd backend
npm run migrate-crawler
```

### 2. **Iniciar o Backend**
```bash
npm run dev
```

### 3. **Iniciar o Admin**
```bash
cd ../banner-admin
npm start
```

## Funcionalidades do Sistema

### 🌐 **Gerenciamento de Sites (Aba 5)**

#### **Adicionar Site:**
- **Nome:** Nome identificador do site
- **URL:** URL completa do site
- **Intervalo:** De 0.5h a 168h (7 dias)
- **Seletores CSS:** Para título, imagem e link
- **Status:** Ativo/Inativo

#### **Sites Pré-configurados:**
- **G1:** `https://g1.globo.com/`
- **UOL:** `https://www.uol.com.br/`
- **Folha:** `https://www.folha.uol.com.br/`

#### **Funcionalidades:**
- ✅ **Testar Site** - Verificar se os seletores funcionam
- ✅ **Editar Site** - Modificar configurações
- ✅ **Ativar/Desativar** - Controlar execução
- ✅ **Excluir Site** - Remover do monitoramento

### 📰 **Posts Sugeridos (Aba 6)**

#### **Visualização:**
- **Modo Grade:** Cards com imagens
- **Modo Tabela:** Lista detalhada
- **Filtros:** Todos, Pendentes, Aprovados
- **Paginação:** 12 posts por página

#### **Ações Disponíveis:**
- ✅ **Aprovar** - Marcar como aprovado
- ✅ **Converter para Banner** - Criar banner automaticamente
- ✅ **Rejeitar** - Remover da lista
- ✅ **Excluir** - Deletar permanentemente

### ⏰ **Sistema de Agendamento**

#### **Execução Automática:**
- **Iniciado automaticamente** com o backend
- **Intervalos configuráveis** por site
- **Execução em background** sem interferir no sistema
- **Logs detalhados** de cada execução

#### **Intervalos Suportados:**
- **0.5-1h:** A cada 30 minutos
- **1-6h:** A cada 2 horas
- **6-12h:** A cada 6 horas
- **12-24h:** A cada 12 horas
- **24h+:** Uma vez por dia

## Tecnologias Utilizadas

### 🔧 **Backend:**
- **Puppeteer:** Web scraping com navegador real
- **Cheerio:** Parser HTML no servidor
- **Node-cron:** Agendamento de tarefas
- **Axios:** Requisições HTTP

### 🎨 **Frontend:**
- **Material-UI:** Interface moderna
- **Formik + Yup:** Formulários e validação
- **React Router:** Navegação entre páginas

## Como Usar

### 1. **Configurar Sites**
1. Acesse o admin: `http://localhost:3000`
2. Vá para a aba **"🌐 Gerenciar Sites"**
3. Clique em **"Adicionar Site"**
4. Preencha os dados:
   - **Nome:** Ex: "G1 Notícias"
   - **URL:** Ex: "https://g1.globo.com/"
   - **Intervalo:** Ex: 6 (horas)
   - **Seletores:** Preenchidos automaticamente
5. Clique em **"Criar"**

### 2. **Testar Site**
1. Na lista de sites, clique no ícone **"▶️"**
2. Aguarde o resultado do teste
3. Verifique se encontrou posts

### 3. **Visualizar Posts Sugeridos**
1. Vá para a aba **"📰 Posts Sugeridos"**
2. Os posts aparecerão automaticamente
3. Use os filtros para organizar

### 4. **Aprovar Posts**
1. Clique no ícone **"✅"** para aprovar
2. Ou clique em **"➕"** para converter para banner
3. Configure a ordem de exibição

## Seletores CSS Comuns

### 📰 **Sites de Notícias:**
```css
/* G1 */
.feed-post-link
.feed-post-link img

/* UOL */
.headline
.headline img

/* Folha */
.c-headline__title
.c-headline__image img

/* Genérico */
h1, h2, h3
img
a
```

### 🔍 **Como Encontrar Seletores:**
1. Abra o site no navegador
2. Clique F12 (DevTools)
3. Clique no ícone de seleção
4. Clique no elemento desejado
5. Copie o seletor CSS

## Logs e Monitoramento

### 📊 **Logs do Backend:**
```
🚀 Iniciando Scheduler Service...
📋 Carregando 3 sites ativos...
⏰ Criando job para G1: a cada 6h
🕐 Executando crawler agendado para: G1
🔍 Iniciando crawler para: G1 (https://g1.globo.com/)
📊 Encontrados 15 títulos, 12 imagens
✅ Post encontrado: G1: Nova lei aprovada...
🎉 Crawler concluído para G1: 8 posts encontrados
💾 8 posts sugeridos salvos no banco
```

### 🎯 **Status dos Sites:**
- **Ativo:** Executando automaticamente
- **Inativo:** Pausado
- **Último Crawl:** Timestamp da última execução

## Troubleshooting

### ❌ **Site não encontra posts:**
1. Verifique se a URL está correta
2. Teste os seletores CSS
3. Verifique se o site não mudou o layout
4. Use o botão "Testar Site"

### ❌ **Crawler não executa:**
1. Verifique se o site está ativo
2. Confirme se o backend está rodando
3. Verifique os logs do console
4. Teste manualmente um site

### ❌ **Imagens não carregam:**
1. Verifique se as URLs das imagens são válidas
2. Confirme se as imagens são acessíveis
3. Teste as URLs diretamente no navegador

### ❌ **Erro de permissão:**
1. Verifique se o .env está configurado
2. Confirme as credenciais do Supabase
3. Execute a migração: `npm run migrate-crawler`

## URLs Importantes

- **Admin:** `http://localhost:3000`
- **API Sites:** `http://localhost:4000/sites`
- **API Posts:** `http://localhost:4000/suggested-posts`
- **Backend:** `http://localhost:4000`

## Próximos Passos

1. ✅ **Execute a migração:** `npm run migrate-crawler`
2. ✅ **Inicie o backend:** `npm run dev`
3. ✅ **Inicie o admin:** `npm start`
4. ✅ **Configure sites** na aba "🌐 Gerenciar Sites"
5. ✅ **Teste os sites** com o botão de teste
6. ✅ **Visualize posts** na aba "📰 Posts Sugeridos"
7. ✅ **Aprove posts** e converta para banners

**Agora você tem um sistema completo de geração automática de posts!** 🎉

### 🎯 **Funcionalidades Completas:**
- ✅ **Criar Banner** - Formulário manual
- ✅ **Preview Online** - Visualização de desenvolvimento
- ✅ **Listar Banners** - Gerenciamento de banners
- ✅ **TV Display** - Exibição para TV
- ✅ **Gerenciar Sites** - Configurar sites para crawler
- ✅ **Posts Sugeridos** - Aprovar posts automáticos
