# Documentação de Componentes - mycash+

Este documento descreve todos os componentes do sistema, agrupados por domínio e responsabilidade.

## 📊 Componentes do Dashboard

### BalanceCard
**Localização**: `src/components/dashboard/BalanceCard/BalanceCard.tsx`  
**Responsabilidade**: Exibe o saldo total financeiro (contas - cartões) com animação de contagem e decoração visual.  
**Props**: Nenhuma (usa dados do contexto global via `useFinance`)  
**Recursos**: Animação de valores, ícone decorativo, cor de crescimento

### IncomeCard
**Localização**: `src/components/dashboard/IncomeCard/IncomeCard.tsx`  
**Responsabilidade**: Exibe total de receitas do período filtrado.  
**Props**: Nenhuma  
**Recursos**: Animação de valores, formatação monetária brasileira

### ExpenseCard
**Localização**: `src/components/dashboard/ExpenseCard/ExpenseCard.tsx`  
**Responsabilidade**: Exibe total de despesas do período filtrado.  
**Props**: Nenhuma  
**Recursos**: Animação de valores, formatação monetária brasileira

### ExpensesByCategoryCarousel
**Localização**: `src/components/dashboard/ExpensesByCategoryCarousel/ExpensesByCategoryCarousel.tsx`  
**Responsabilidade**: Carrossel horizontal de gráficos donut mostrando despesas por categoria.  
**Props**: Nenhuma  
**Recursos**: Scroll horizontal, navegação por setas (desktop), hover effects, fade gradients

### CategoryDonutCard
**Localização**: `src/components/dashboard/CategoryDonutCard/CategoryDonutCard.tsx`  
**Responsabilidade**: Renderiza um gráfico donut individual para uma categoria.  
**Props**: 
- `category: string` - Nome da categoria
- `amount: number` - Valor total da categoria
- `percentage: number` - Percentual em relação ao total

### FinancialFlowChart
**Localização**: `src/components/dashboard/FinancialFlowChart/FinancialFlowChart.tsx`  
**Responsabilidade**: Gráfico de área mostrando evolução de receitas e despesas ao longo do tempo.  
**Props**: Nenhuma  
**Recursos**: Usa Recharts, tooltip interativo, gradientes, legendas

### CreditCardsWidget
**Localização**: `src/components/dashboard/CreditCardsWidget/CreditCardsWidget.tsx`  
**Responsabilidade**: Widget resumido mostrando até 3 cartões ativos com informações principais.  
**Props**: 
- `onAddCard?: () => void` - Callback para adicionar cartão
- `onCardClick?: (card: CreditCard) => void` - Callback ao clicar em cartão  
**Recursos**: Paginação se houver mais de 3 cartões, badges de uso percentual

### UpcomingExpensesWidget
**Localização**: `src/components/dashboard/UpcomingExpensesWidget/UpcomingExpensesWidget.tsx`  
**Responsabilidade**: Lista de despesas pendentes ordenadas por data de vencimento.  
**Props**: 
- `onAddTransaction?: () => void` - Callback para adicionar transação  
**Recursos**: Botão "marcar como pago", estado vazio, formatação de datas

### TransactionsTable
**Localização**: `src/components/dashboard/TransactionsTable/TransactionsTable.tsx`  
**Responsabilidade**: Tabela resumida de transações com filtros locais e paginação.  
**Props**: Nenhuma  
**Recursos**: Busca local, filtro por tipo, paginação (5 itens), versão mobile com cards

## 🎨 Componentes de Layout

### Layout
**Localização**: `src/components/layout/Layout/Layout.tsx`  
**Responsabilidade**: Componente wrapper que gerencia renderização condicional de Sidebar (desktop) ou HeaderMobile (mobile).  
**Props**: 
- `children: ReactNode` - Conteúdo a ser renderizado  
**Recursos**: Breakpoint detection, gerenciamento de layout responsivo

### Sidebar
**Localização**: `src/components/layout/Sidebar/Sidebar.tsx`  
**Responsabilidade**: Navegação lateral no desktop com estados expandido/colapsado.  
**Props**: Nenhuma  
**Recursos**: Toggle de expansão, tooltips no estado colapsado, perfil do usuário, ícones de navegação

### SidebarItem
**Localização**: `src/components/layout/Sidebar/SidebarItem.tsx`  
**Responsabilidade**: Item individual de navegação na sidebar.  
**Props**: 
- `to: string` - Rota de destino
- `icon: ReactNode` - Ícone do item
- `label: string` - Texto do item
- `isActive: boolean` - Estado ativo

### HeaderMobile
**Localização**: `src/components/layout/HeaderMobile/HeaderMobile.tsx`  
**Responsabilidade**: Header fixo no topo para mobile/tablet com logo e botão de menu.  
**Props**: Nenhuma  
**Recursos**: Integração com MenuDropdown, avatar clicável

### MenuDropdown
**Localização**: `src/components/layout/HeaderMobile/MenuDropdown.tsx`  
**Responsabilidade**: Menu dropdown deslizante para mobile com itens de navegação.  
**Props**: 
- `isOpen: boolean` - Estado aberto/fechado
- `onClose: () => void` - Callback de fechamento  
**Recursos**: Animação slide-in, overlay escuro, botão de logout

### Container
**Localização**: `src/components/layout/Container/Container.tsx`  
**Responsabilidade**: Container responsivo com padding adaptável por breakpoint.  
**Props**: 
- `children: ReactNode` - Conteúdo
- `className?: string` - Classes adicionais  
**Recursos**: Padding responsivo (px-4 mobile, px-6 tablet, px-8 desktop)

## 🪟 Modais

### Modal (Base)
**Localização**: `src/components/ui/Modal/Modal.tsx`  
**Responsabilidade**: Componente base reutilizável para todos os modais do sistema.  
**Props**: 
- `isOpen: boolean` - Estado aberto/fechado
- `onClose: () => void` - Callback de fechamento
- `children: ReactNode` - Conteúdo do modal  
**Recursos**: Overlay, animações de abertura/fechamento, fechamento por ESC e clique fora

### NewTransactionModal
**Localização**: `src/components/modals/NewTransactionModal/NewTransactionModal.tsx`  
**Responsabilidade**: Formulário completo para criação de nova transação (receita ou despesa).  
**Props**: 
- `isOpen: boolean`
- `onClose: () => void`  
**Recursos**: Toggle tipo receita/despesa, campos condicionais (parcelas), validação, integração com contexto

### AddMemberModal
**Localização**: `src/components/modals/AddMemberModal/AddMemberModal.tsx`  
**Responsabilidade**: Formulário para adicionar novo membro da família.  
**Props**: 
- `isOpen: boolean`
- `onClose: () => void`  
**Recursos**: Campos: nome, função, avatar (URL), renda mensal, validação

### AddCardModal
**Localização**: `src/components/modals/AddCardModal/AddCardModal.tsx`  
**Responsabilidade**: Formulário para adicionar conta bancária ou cartão de crédito.  
**Props**: 
- `isOpen: boolean`
- `onClose: () => void`  
**Recursos**: Toggle tipo conta/cartão, campos condicionais por tipo, validação específica, seleção de tema visual

### CardDetailsModal
**Localização**: `src/components/modals/CardDetailsModal/CardDetailsModal.tsx`  
**Responsabilidade**: Modal de detalhes completo do cartão com informações e tabela de despesas.  
**Props**: 
- `isOpen: boolean`
- `onClose: () => void`
- `card: CreditCard | null` - Cartão a exibir
- `onAddTransaction?: () => void` - Callback para adicionar despesa
- `onEditCard?: (card: CreditCard) => void` - Callback para editar  
**Recursos**: Grid de informações, gráfico donut de uso, tabela de despesas, paginação

### FiltersMobileModal
**Localização**: `src/components/modals/FiltersMobileModal/FiltersMobileModal.tsx`  
**Responsabilidade**: Modal de filtros para mobile com calendário de período.  
**Props**: 
- `isOpen: boolean`
- `onClose: () => void`  
**Recursos**: Seções de filtros, calendário mensal, estados temporários, aplicação de filtros

## 📄 Páginas/Views

### Dashboard
**Localização**: `src/pages/Dashboard.tsx`  
**Responsabilidade**: Página principal integrando todos os widgets do dashboard.  
**Recursos**: Grid responsivo, modais integrados, gerenciamento de estado local para modais

### Cards
**Localização**: `src/pages/Cards.tsx`  
**Responsabilidade**: View completa de cartões de crédito com grid responsivo.  
**Recursos**: Header com botão novo cartão, grid 1/2/3 colunas, estado vazio, modais integrados

### Transactions
**Localização**: `src/pages/Transactions.tsx`  
**Responsabilidade**: View completa de transações com filtros avançados e estatísticas.  
**Recursos**: Múltiplos filtros combinados, ordenação clicável, exportação CSV, estatísticas, paginação (10 itens)

### Profile
**Localização**: `src/pages/Profile.tsx`  
**Responsabilidade**: View de perfil com sistema de abas (Informações e Configurações).  
**Recursos**: Aba informações (perfil + membros), aba configurações (preferências, notificações, categorias, dados), modais integrados

### Goals
**Localização**: `src/pages/Goals.tsx`  
**Responsabilidade**: View de metas/objetivos (placeholder atual).  
**Status**: Pendente de implementação completa

## 🪝 Hooks Customizados

### useFinance
**Localização**: `src/hooks/useFinance.ts`  
**Responsabilidade**: Hook de conveniência para acessar o FinanceContext.  
**Retorno**: Objeto completo do contexto (dados, filtros, funções CRUD, cálculos)  
**Uso**: `const { transactions, addTransaction, calculateTotalBalance } = useFinance()`

### useSidebar
**Localização**: `src/hooks/useSidebar.ts`  
**Responsabilidade**: Gerencia estado da sidebar (expanded/collapsed) e detecção de viewport.  
**Retorno**: 
- `isExpanded: boolean`
- `toggle: () => void`
- `isDesktop: boolean`

### useDrawer
**Localização**: `src/hooks/useDrawer.ts`  
**Responsabilidade**: Gerencia estado de drawer/menu mobile.  
**Retorno**: 
- `isOpen: boolean`
- `toggle: () => void`
- `close: () => void`

### useCountAnimation
**Localização**: `src/hooks/useCountAnimation.ts`  
**Responsabilidade**: Hook para animar valores numéricos de 0 até valor final.  
**Props**: 
- `targetValue: number` - Valor final
- `duration?: number` - Duração em ms (padrão: 800)  
**Retorno**: `animatedValue: number` - Valor animado atual

## 🧩 Contextos

### FinanceContext
**Localização**: `src/contexts/FinanceContext.tsx`  
**Responsabilidade**: Contexto global que gerencia todo o estado financeiro da aplicação.  
**Estado Gerenciado**:
- Arrays: `transactions`, `goals`, `creditCards`, `bankAccounts`, `familyMembers`
- Filtros: `selectedMember`, `dateRange`, `transactionType`, `searchText`
- Funções CRUD para todas as entidades
- Funções de cálculo: saldo, receitas, despesas, categorias, percentuais  
**Inicialização**: Dados mock carregados automaticamente no primeiro mount

## 🛠 Utilitários

### currency.utils.ts
- `formatCurrency(value: number): string` - Formata como R$ 1.234,56
- `formatCompactCurrency(value: number): string` - Formato compacto (R$ 2,5k)
- `parseCurrencyInput(input: string): number` - Converte input em número

### date.utils.ts
- `formatDate(date: Date): string` - DD/MM/AAAA
- `formatDateLong(date: Date): string` - "15 de Janeiro de 2024"
- `formatDateRange(start: Date, end: Date): string` - Intervalo formatado
- `formatRelativeDate(date: Date): string` - "Há 3 dias"
- `formatDateShort(date: Date): string` - DD/MM

### array.utils.ts
- `groupByCategory(transactions: Transaction[]): Record<string, number>`
- `filterByDateRange(transactions: Transaction[], start: Date, end: Date): Transaction[]`
- `sortByDate(transactions: Transaction[], order: 'asc' | 'desc'): Transaction[]`

### calculation.utils.ts
- `calculatePercentage(partial: number, total: number): number`
- `calculateDifference(value1: number, value2: number): { absolute, percentage }`
- `calculateInstallmentValue(totalValue: number, installments: number): number`

### validation.utils.ts
- `isValidEmail(email: string): boolean`
- `isValidCPF(cpf: string): boolean`
- `isValidDate(date: Date, allowFuture?: boolean): boolean`
- `isPositiveNumber(value: number): boolean`

### id.utils.ts
- `generateUniqueId(): string` - Gera ID único baseado em timestamp

## 📝 Observações

- Todos os componentes seguem o padrão de exportação nomeada
- Props opcionais são marcadas com `?`
- Componentes sem props não recebem interface Props explícita
- Hooks customizados seguem convenção `use` prefix
- Utilitários são funções puras sem dependências de React
