# Checklist de Validação - mycash+

Este documento lista os testes e validações que devem ser executados para garantir o funcionamento correto do sistema.

## ✅ Fluxo de Teste do Usuário

### 1. Primeira Abertura
- [ ] Sistema abre e mostra dashboard com dados mock
- [ ] Todos os cards de resumo exibem valores
- [ ] Gráficos e tabelas carregam corretamente

### 2. Filtros de Membro
- [ ] Clicar em um membro filtra dados
- [ ] Cards de resumo atualizam
- [ ] Gráficos atualizam
- [ ] Tabela atualiza
- [ ] Clicar novamente remove filtro

### 3. Filtro de Período
- [ ] Seletor de período funciona
- [ ] Escolher "Últimos 3 meses" atualiza dados
- [ ] Todos os componentes refletem o novo período

### 4. Busca em Tempo Real
- [ ] Digitar no campo de busca filtra tabela
- [ ] Filtro funciona em tempo real
- [ ] Busca considera descrição e categoria

### 5. Nova Transação
- [ ] Botão "Nova Transação" abre modal
- [ ] Formulário preenchível
- [ ] Validações funcionam (campos obrigatórios)
- [ ] Salvar fecha modal
- [ ] Nova transação aparece na tabela

### 6. Modal de Detalhes do Cartão
- [ ] Clicar em cartão abre modal
- [ ] Informações corretas são exibidas
- [ ] Tabela de despesas funciona

### 7. Navegação
- [ ] Dashboard → Cartões funciona
- [ ] Cartões → Transações funciona
- [ ] Transações → Perfil funciona
- [ ] Filtros avançados funcionam

### 8. Perfil
- [ ] Informações do usuário exibidas
- [ ] Lista de membros funciona
- [ ] Aba Configurações funciona
- [ ] Toggles e configurações funcionam

## ✅ Validação de Cálculos

### Saldo Total
- [ ] Cálculo: Saldo das contas - Saldo dos cartões
- [ ] Valor exibido no card está correto

### Receitas
- [ ] Soma todas as transações tipo "income" no período
- [ ] Valor exibido está correto

### Despesas
- [ ] Soma todas as transações tipo "expense" no período
- [ ] Valor exibido está correto

### Percentuais de Categoria
- [ ] Cálculo: (Despesa da categoria / Total de receitas) × 100
- [ ] Exibição com uma casa decimal (ex: 35.5%)

## ✅ Validação de Filtros Combinados

- [ ] Ativar filtro de membro + período + busca simultaneamente
- [ ] Contar manualmente transações que atendem TODOS os critérios
- [ ] Verificar se tabela mostra exatamente esse número
- [ ] Verificar se todas as transações exibidas atendem a TODOS os critérios

## ✅ Validação de Formatações

### Valores Monetários
- [ ] Formato brasileiro: R$ 1.234,56
- [ ] Sempre duas casas decimais
- [ ] Separador de milhar (ponto)
- [ ] Separador decimal (vírgula)

### Datas
- [ ] Formato brasileiro: 15/01/2024
- [ ] Dia/mês/ano sempre com 2 dígitos

### Percentuais
- [ ] Uma casa decimal: 35,5%
- [ ] Vírgula como separador decimal

## ✅ Validação de Responsividade

### Breakpoints
- [ ] 375px (mobile) - layout em 1 coluna, header mobile
- [ ] 768px (tablet) - grids em 2 colunas
- [ ] 1280px (desktop) - sidebar aparece, header mobile some
- [ ] 1920px (wide) - layout expandido

### Elementos
- [ ] Sidebar desaparece em <1280px
- [ ] Header mobile aparece em <1280px
- [ ] Grids ajustam colunas nos breakpoints
- [ ] Sem overflow horizontal em nenhum tamanho
- [ ] Textos legíveis em todos os tamanhos
- [ ] Botões clicáveis/tocáveis (mínimo 44x44px)

### Tabelas
- [ ] Mobile: cards verticais
- [ ] Desktop: tabela horizontal

## ✅ Validação de Modais

- [ ] Modal aparece centralizado
- [ ] Overlay escuro aparece
- [ ] Fecha ao clicar no X
- [ ] Fecha ao clicar fora
- [ ] Fecha ao pressionar Escape
- [ ] Validações funcionam ao salvar com campos vazios

## ✅ Validação de Acessibilidade

- [ ] Navegação completa por teclado (Tab, Enter, Escape, Setas)
- [ ] Todos elementos interativos alcançáveis por Tab
- [ ] Elementos focados têm anel de foco visível
- [ ] Ordem de tabulação é lógica
- [ ] Contraste mínimo de 4.5:1 (WCAG AA)

## ✅ Tratamento de Erros

### Cálculos
- [ ] Divisão por zero tratada (retorna 0)
- [ ] Arrays vazios tratados
- [ ] Valores nulos/undefined tratados

### Formulários
- [ ] Validação antes de processar
- [ ] Mensagens de erro descritivas
- [ ] Campos obrigatórios validados

## ✅ Performance

- [ ] Transições suaves entre seções
- [ ] Tabela com 100+ itens funciona rápido (paginação)
- [ ] Sem memory leaks ao abrir/fechar modais múltiplas vezes
- [ ] Sem travamentos ou lentidão perceptível

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📝 Notas de Implementação

- Sistema usa dados mock pré-carregados para desenvolvimento
- Todos os cálculos tratam divisão por zero
- Filtros usam lógica AND (todos os critérios devem ser atendidos)
- Layout é 100% mobile-first
- Animações respeitam `prefers-reduced-motion`
