# mycash+ - Sistema de Gestão Financeira Familiar

Sistema completo de gestão financeira familiar desenvolvido com React, TypeScript, Vite e Tailwind CSS. Projeto baseado em design system do Figma com arquitetura componentizada e mobile-first.

## 🎯 Objetivo do Sistema

O mycash+ é uma aplicação web responsiva para gerenciamento financeiro familiar, permitindo:

- Controle de receitas e despesas
- Gestão de cartões de crédito e contas bancárias
- Acompanhamento de objetivos financeiros (metas)
- Gestão de membros da família com diferentes responsabilidades
- Visualizações gráficas e relatórios financeiros
- Filtros avançados e exportação de dados

## 🛠 Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento client-side
- **Recharts** - Biblioteca de gráficos
- **date-fns** - Manipulação de datas
- **Context API** - Gerenciamento de estado global

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos

1. Clone o repositório
```bash
git clone <repository-url>
cd "Dashboard MyCash FigmaMCP"
```

2. Instale as dependências
```bash
npm install
```

3. Execute o servidor de desenvolvimento
```bash
npm run dev
```

4. Acesse no navegador
```
http://localhost:5173
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Preview
npm run preview      # Preview do build de produção

# Type checking
npm run type-check   # Verifica tipos TypeScript
```

## 📁 Estrutura de Pastas

```
src/
├── components/          # Componentes React
│   ├── dashboard/       # Widgets do dashboard
│   │   ├── BalanceCard/
│   │   ├── IncomeCard/
│   │   ├── ExpenseCard/
│   │   ├── ExpensesByCategoryCarousel/
│   │   ├── FinancialFlowChart/
│   │   ├── CreditCardsWidget/
│   │   ├── UpcomingExpensesWidget/
│   │   └── TransactionsTable/
│   ├── layout/          # Componentes de layout
│   │   ├── Sidebar/
│   │   ├── HeaderMobile/
│   │   ├── Layout/
│   │   └── Container/
│   ├── modals/          # Modais do sistema
│   │   ├── NewTransactionModal/
│   │   ├── AddMemberModal/
│   │   ├── AddCardModal/
│   │   ├── CardDetailsModal/
│   │   └── FiltersMobileModal/
│   └── ui/              # Componentes UI reutilizáveis
│       └── Modal/
├── contexts/            # Contexts React
│   └── FinanceContext.tsx  # Contexto global de finanças
├── hooks/               # Custom hooks
│   ├── useSidebar.ts
│   ├── useDrawer.ts
│   ├── useCountAnimation.ts
│   └── useFinance.ts
├── pages/               # Páginas/Views
│   ├── Dashboard.tsx
│   ├── Cards.tsx
│   ├── Transactions.tsx
│   ├── Profile.tsx
│   └── Goals.tsx
├── types/               # Definições TypeScript
│   ├── transaction.ts
│   ├── goal.ts
│   ├── creditCard.ts
│   ├── bankAccount.ts
│   ├── familyMember.ts
│   └── index.ts
├── utils/               # Funções utilitárias
│   ├── currency.utils.ts
│   ├── date.utils.ts
│   ├── array.utils.ts
│   ├── calculation.utils.ts
│   ├── validation.utils.ts
│   ├── id.utils.ts
│   ├── formatCurrency.ts  # Compatibilidade
│   ├── formatDate.ts
│   └── formatDateShort.ts
├── styles/              # Estilos globais
│   ├── globals.css
│   └── reset.css
├── theme/               # Design system
│   └── tokens.css       # Variáveis CSS (semânticas e primitivas)
├── App.tsx              # Componente raiz
└── main.tsx             # Entry point
```

## 🏗 Principais Componentes e Responsabilidades

### Contexts

**FinanceContext** (`src/contexts/FinanceContext.tsx`)
- Gerencia estado global: transações, metas, cartões, contas, membros
- Fornece funções CRUD para todas as entidades
- Gerencia filtros globais (membro, período, tipo, busca)
- Calcula estatísticas e valores derivados
- Inicializa dados mock para desenvolvimento

### Pages

**Dashboard** (`src/pages/Dashboard.tsx`)
- Página principal com todos os widgets
- Cards de resumo, gráficos, tabelas
- Integração de modais

**Transactions** (`src/pages/Transactions.tsx`)
- View completa de transações com filtros avançados
- Estatísticas e exportação CSV
- Tabela com ordenação e paginação

**Cards** (`src/pages/Cards.tsx`)
- Grid de cartões de crédito
- Modal de detalhes
- Ações de gerenciamento

**Profile** (`src/pages/Profile.tsx`)
- Informações do usuário e membros
- Configurações e preferências
- Sistema de abas

### Widgets do Dashboard

**BalanceCard** - Card de saldo total com animação
**IncomeCard** - Card de receitas totais
**ExpenseCard** - Card de despesas totais
**ExpensesByCategoryCarousel** - Carrossel de gráficos donut por categoria
**FinancialFlowChart** - Gráfico de área (receitas vs despesas)
**CreditCardsWidget** - Lista resumida de cartões
**UpcomingExpensesWidget** - Próximas despesas pendentes
**TransactionsTable** - Tabela resumida de transações

### Layout Components

**Sidebar** - Navegação lateral desktop (≥1280px)
**HeaderMobile** - Header mobile com menu drawer (<1280px)
**Layout** - Componente wrapper que gerencia sidebar/header
**Container** - Container responsivo para conteúdo

### Modals

**NewTransactionModal** - Formulário completo para nova transação
**AddMemberModal** - Formulário para adicionar membro da família
**AddCardModal** - Formulário para adicionar conta/cartão
**CardDetailsModal** - Modal com detalhes e despesas do cartão
**FiltersMobileModal** - Modal de filtros para mobile

## 🎨 Design System

O projeto utiliza um design system baseado em tokens CSS:

- **Tokens Semânticos**: cores, espaçamentos, tipografia com significado
- **Tokens Primitivos**: valores base reutilizáveis
- **Breakpoints**: mobile (<768px), tablet (≥768px), desktop (≥1280px), wide (≥1920px)

Arquivo principal: `src/theme/tokens.css`

## 📱 Responsividade

O projeto é **100% mobile-first**:

- Layout base parte do mobile
- Sidebar aparece apenas em desktop (≥1280px)
- Header mobile apenas abaixo de 1280px
- Grids fluidos que evoluem progressivamente
- Tabelas viram cards no mobile
- Modais ocupam 100% da viewport no mobile

## ♿ Acessibilidade

- Navegação completa por teclado (Tab, Enter, Escape)
- Focus visível em todos os elementos interativos
- aria-labels em botões de ícone
- Contraste mínimo de 4.5:1 (WCAG AA)
- Suporte a `prefers-reduced-motion`

## 🧪 Validações e Tratamento de Erros

- Validação de formulários com mensagens descritivas
- Tratamento de divisão por zero em cálculos
- Validação de arrays vazios em filtros
- Formatação consistente de valores monetários e datas
- Estados vazios amigáveis com CTAs

## 📊 Dados Mock

O sistema inicia com dados mock pré-carregados no `FinanceContext` para desenvolvimento e testes.

## 🚧 Próximas Melhorias

- Integração com backend/API real
- Persistência de dados (localStorage ou banco)
- Autenticação de usuários
- Modo escuro
- Exportação em PDF
- Gráficos adicionais
- Notificações push
- Compartilhamento de dados entre membros

## 📝 Licença

Este projeto foi desenvolvido como parte de um workshop de integração Figma MCP ao Cursor AI.

## 👨‍💻 Desenvolvimento

Desenvolvido com foco em:
- Componentes reutilizáveis e bem estruturados
- TypeScript para type safety
- Performance e otimizações
- Experiência do usuário fluida
- Código limpo e manutenível
