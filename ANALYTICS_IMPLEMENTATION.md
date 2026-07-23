# Implementação de Analytics e Rastreamento de Visitantes

## 📊 Visão Geral

Sistema de rastreamento de visitantes que monitora acessos à Home e Dashboard de Indicadores do painel administrativo.

## 🔧 Implementação Frontend

### Serviço de Analytics
**Arquivo:** `src/services/analyticsService.js`

Métodos disponíveis:
- `rastrear(evento, dados)` - Envia evento para rastreamento
- `obterVisitantes(periodo)` - Obtém visitantes (dia/semana/mes)
- `obterEstatisticas()` - Obtém estatísticas agregadas

### Rastreamento na Home
- Importa `analyticsService`
- Chama `analyticsService.rastrear("home_view")` no `useEffect`
- Exibe card "Visitantes (Hoje)" com dados da API

### Card de Visitantes
- Ícone: VisibilityIcon (olho)
- Cor: Verde (#10b981)
- Dados: Total de visitantes do dia
- Integrado com os demais cards de estatísticas

## 🛠️ Implementação Backend (TODO)

Precisa implementar no backend (buscamissa-api-admin):

### Endpoints necessários:

1. **POST `/api/v1/admin/analytics/rastrear`**
   ```json
   Request:
   {
     "evento": "home_view",
     "dados": {},
     "timestamp": "2026-07-23T10:30:00Z"
   }
   
   Response:
   {
     "success": true
   }
   ```
   
   Responsabilidade:
   - Salvar evento no banco de dados
   - Registrar IP do usuário (para visitantes únicos)
   - Armazenar timestamp

2. **GET `/api/v1/admin/analytics/visitantes?periodo=dia`**
   ```json
   Response:
   {
     "data": {
       "total": 42,
       "unique": 35,
       "paginas": [
         { "nome": "home", "views": 25 },
         { "nome": "indicadores", "views": 17 }
       ]
     }
   }
   ```
   
   Responsabilidade:
   - Contar visitantes únicos (por IP/sessão)
   - Filtrar por período (dia/semana/mes)
   - Agregar por página

3. **GET `/api/v1/admin/analytics/estatisticas`**
   ```json
   Response:
   {
     "data": {
       "totalVisitas": 1250,
       "visitantesUnicos": 890,
       "taxaCrescimento": 12.5,
       "paginas": [...]
     }
   }
   ```

## 📍 Próximos Passos

1. ✅ Frontend implementado
2. ⏳ Implementar endpoints no backend
3. ⏳ Criar tabel de analytics no banco de dados
4. ⏳ Adicionar rastreamento nos Indicadores (`/indicadores`)
5. ⏳ Expandir com métricas adicionais (heatmaps, trends)

## 🎯 Eventos a Rastrear

- `home_view` - Acesso à Home
- `indicadores_view` - Acesso ao Dashboard de Indicadores
- `aprovacoes_view` - Acesso a Aprovações
- `responsaveis_view` - Acesso a Responsáveis
- (futuros) Ações específicas do usuário

## 📈 Dados Coletados

- Evento
- Timestamp
- IP do usuário (para visitantes únicos)
- User-Agent (dispositivo/navegador)
- Página acessada
- Dados contextuais adicionais
