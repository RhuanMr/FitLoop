# Funcionalidade de Agendamento de Banners

## Visão Geral

Foi implementada a funcionalidade de **agendamento de banners** que permite definir quando um banner deve começar e terminar de ser exibido no app FitLoop.

## Como Funciona

### 1. Campos de Agendamento
- **scheduled_start**: Data e hora de início da exibição (opcional)
- **scheduled_end**: Data e hora de fim da exibição (opcional)

### 2. Comportamento
- Se `scheduled_start` não for definido, o banner pode ser exibido imediatamente
- Se `scheduled_end` não for definido, o banner pode ser exibido indefinidamente
- Se ambos forem definidos, o banner só será exibido no período especificado
- O app atualiza automaticamente a cada 30 segundos para verificar agendamentos

## Uso no Admin

### Criando um Banner com Agendamento
1. Acesse o formulário de cadastro de banner
2. Preencha os campos obrigatórios (título, ordem, status, imagem)
3. **Opcionalmente** defina:
   - **Data/Hora de Início**: Quando o banner deve começar a ser exibido
   - **Data/Hora de Fim**: Quando o banner deve parar de ser exibido
4. Clique em "Salvar"

### Validações
- A data de fim deve ser posterior à data de início
- Os campos de agendamento são opcionais
- Se apenas a data de início for definida, o banner será exibido a partir dessa data
- Se apenas a data de fim for definida, o banner será exibido até essa data

## API Endpoints

### GET /banners
Parâmetros disponíveis:
- `include_scheduled`: boolean (padrão: true)
  - `true`: Retorna todos os banners (incluindo agendados)
  - `false`: Retorna apenas banners que estão no período de exibição

### Exemplos de Uso

```bash
# Buscar todos os banners (incluindo agendados)
GET /banners?status=active

# Buscar apenas banners ativos no momento
GET /banners?status=active&include_scheduled=false
```

## Estrutura do Banco de Dados

Os novos campos foram adicionados à tabela `banners`:
- `scheduled_start`: TIMESTAMP (nullable)
- `scheduled_end`: TIMESTAMP (nullable)

## Exemplos Práticos

### Banner Imediato
- `scheduled_start`: null
- `scheduled_end`: null
- **Resultado**: Banner exibido imediatamente e indefinidamente

### Banner com Data de Início
- `scheduled_start`: "2024-01-15T10:00:00Z"
- `scheduled_end`: null
- **Resultado**: Banner exibido a partir de 15/01/2024 às 10:00

### Banner com Período Limitado
- `scheduled_start`: "2024-01-15T10:00:00Z"
- `scheduled_end`: "2024-01-20T18:00:00Z"
- **Resultado**: Banner exibido apenas entre 15/01 e 20/01/2024

### Banner com Data de Fim
- `scheduled_start`: null
- `scheduled_end`: "2024-01-20T18:00:00Z"
- **Resultado**: Banner exibido imediatamente até 20/01/2024 às 18:00

## Atualizações Automáticas

O app FitLoop atualiza automaticamente a lista de banners a cada 30 segundos, garantindo que:
- Banners agendados apareçam no momento correto
- Banners expirados sejam removidos automaticamente
- A experiência do usuário seja fluida e atualizada

## Considerações Técnicas

- As datas são armazenadas em formato ISO 8601 (UTC)
- O filtro de agendamento é aplicado no backend para melhor performance
- O app não precisa fazer cálculos de data/hora localmente
- A atualização automática garante sincronização em tempo real
