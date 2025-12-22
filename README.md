# Superclient

Aplicacao web para autenticacao, calendario, pipeline, financas, contatos e gestao de acessos.

## Requisitos
- Node.js 18+ (ou superior)
- pnpm

## Como rodar
```bash
pnpm install
pnpm server:dev
pnpm dev
```

## Enderecos
- Frontend: http://localhost:3000
- API: http://localhost:3001

## Variaveis de ambiente (opcional)
- `VITE_API_PROXY_TARGET` (default: http://localhost:3001)
- `VITE_API_URL` (usado em build)

## Estrutura
- `client/` frontend (Vite + React + MUI)
- `server/` API (Express + SQLite)
- `shared/` tipos e utilitarios

## Funcionalidades
- Login e recuperacao de senha com fluxo dedicado
- Dashboard (Home) com resumo de calendario, pipeline, financas e gestao
- Calendario com agenda diaria, lembretes e repeticoes
- Pipeline com colunas, cards e arraste entre etapas
- Detalhes de tarefa com descricao rica, categorias e responsaveis
- Dados da pipeline com metricas e graficos
- Financas com categorias, filtros e visualizacao de gastos
- Contatos com multiplos telefones/emails/enderecos e categorias
- Suporte com FAQ, categorias e formulario de contato
- Notificacoes com alertas e indicador no sino
- Gestao de acessos com papeis, permissoes e modulos pagos
- Perfil com preferencias, idiomas, troca de conta e logout
