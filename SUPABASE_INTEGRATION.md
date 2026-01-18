# 🚀 Guia de Integração Supabase - mycash+

Este documento descreve o processo completo de integração do mycash+ com Supabase, incluindo configuração do banco de dados, autenticação, storage e CRUD.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Aplicar Migrations](#aplicar-migrations)
4. [Configurar RLS Policies](#configurar-rls-policies)
5. [Configurar Storage Buckets](#configurar-storage-buckets)
6. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
7. [Estrutura do Projeto](#estrutura-do-projeto)
8. [Uso da Integração](#uso-da-integração)

---

## 📦 Pré-requisitos

- Conta no Supabase ([supabase.com](https://supabase.com))
- Projeto criado no Supabase
- Node.js 18+ instalado
- npm ou yarn

---

## ⚙️ Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Preencha:
   - **Name**: `dashboard-mycashplus` (ou seu nome preferido)
   - **Database Password**: Senha forte (anote!)
   - **Region**: Escolha a região mais próxima

### 2. Obter Credenciais

Após criar o projeto, vá em **Settings** → **API** e copie:
- **Project URL** (ex: `https://xxxxx.supabase.co`)
- **anon/public key** (chave pública)

---

## 🗄️ Aplicar Migrations

### Opção 1: Via Supabase Dashboard (Recomendado para iniciantes)

1. Acesse **SQL Editor** no Supabase Dashboard
2. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
3. Cole todo o conteúdo no editor SQL
4. Clique em **Run**
5. Repita o processo com `supabase/migrations/002_rls_policies.sql`

### Opção 2: Via Supabase CLI (Avançado)

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto local ao remoto
supabase link --project-ref your-project-ref

# Aplicar migrations
supabase db push
```

---

## 🔒 Configurar RLS Policies

As RLS policies já estão incluídas no arquivo `002_rls_policies.sql`. Elas garantem que:

- ✅ Cada usuário só acessa seus próprios dados
- ✅ Autenticação obrigatória para todas as operações
- ✅ Policies separadas para SELECT, INSERT, UPDATE, DELETE

**Verificar se as policies foram criadas:**

1. Vá em **Authentication** → **Policies**
2. Verifique se existem policies para todas as tabelas:
   - `users`
   - `family_members`
   - `categories`
   - `accounts`
   - `transactions`
   - `recurring_transactions`

---

## 📦 Configurar Storage Buckets

Siga o guia completo em `supabase/storage/README.md`

**Resumo rápido:**

1. Vá em **Storage** → **Buckets**
2. Crie 3 buckets:
   - `avatars` (privado)
   - `media` (público)
   - `receipts` (privado)
3. Configure as RLS policies conforme descrito no README

---

## 🔑 Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

2. Edite `.env` e adicione suas credenciais:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

⚠️ **Importante:** O arquivo `.env` está no `.gitignore` e NÃO deve ser commitado.

---

## 📁 Estrutura do Projeto

Após a integração, a estrutura ficará assim:

```
/
├── prisma/
│   └── schema.prisma          # Schema Prisma (para referência)
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Tabelas, enums, índices
│   │   └── 002_rls_policies.sql      # Row Level Security
│   └── storage/
│       └── README.md                 # Guia de Storage
├── src/
│   ├── lib/
│   │   └── supabase.ts        # Cliente Supabase
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Context de autenticação
│   │   └── FinanceContext.tsx # Context financeiro (atualizado)
│   └── services/
│       ├── transactionService.ts    # CRUD de transações
│       ├── accountService.ts        # CRUD de contas/cartões
│       ├── familyMemberService.ts   # CRUD de membros
│       ├── categoryService.ts       # CRUD de categorias
│       └── storageService.ts        # Upload/download de arquivos
└── .env                       # Variáveis de ambiente (não commitado)
```

---

## 💻 Uso da Integração

### 1. Autenticação

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { signIn, signUp, signOut, user, loading } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn('email@exemplo.com', 'senha123');
    if (error) console.error(error);
  };

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sair</button>
      ) : (
        <button onClick={handleLogin}>Entrar</button>
      )}
    </div>
  );
}
```

### 2. CRUD de Transações

```typescript
import { transactionService } from '@/services/transactionService';

// Criar transação
const newTransaction = await transactionService.create({
  type: 'expense',
  amount: 150.50,
  description: 'Supermercado',
  category: 'food',
  date: new Date(),
  accountId: 'account-id',
});

// Listar transações
const transactions = await transactionService.getAll(userId);

// Atualizar transação
await transactionService.update(transactionId, { amount: 200 });

// Deletar transação
await transactionService.delete(transactionId);
```

### 3. Upload de Arquivos

```typescript
import { storageService } from '@/services/storageService';

// Upload de avatar
const avatarUrl = await storageService.uploadAvatar(file, userId);

// Upload genérico
const { url } = await storageService.upload('media', file, userId);
```

---

## 🧪 Testando a Integração

### 1. Teste de Autenticação

```bash
# No console do navegador (dev tools)
const { data } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'senha123'
});
console.log(data);
```

### 2. Teste de RLS

Tente acessar dados de outro usuário - deve retornar erro ou array vazio.

### 3. Teste de Storage

Faça upload de uma imagem e verifique se aparece no bucket correto.

---

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- **Causa**: Migrations não foram aplicadas
- **Solução**: Execute as migrations via SQL Editor

### Erro: "permission denied"
- **Causa**: RLS policies não configuradas ou usuário não autenticado
- **Solução**: Verifique se as policies foram criadas e se o usuário está logado

### Erro: "bucket does not exist"
- **Causa**: Buckets de storage não foram criados
- **Solução**: Crie os buckets conforme `supabase/storage/README.md`

### Variáveis de ambiente não funcionam
- **Causa**: Arquivo `.env` não está na raiz ou variáveis com nome errado
- **Solução**: Verifique se `.env` existe e se as variáveis começam com `VITE_`

---

## 📚 Próximos Passos

1. ✅ Integração completa do `FinanceContext` com Supabase
2. ✅ Remover todos os dados mock
3. ✅ Implementar real-time subscriptions (opcional)
4. ✅ Adicionar tratamento de erros robusto
5. ✅ Implementar cache local (opcional)

---

## 📝 Notas Importantes

- **RLS é obrigatório**: Sem RLS, qualquer pessoa pode acessar qualquer dado
- **Backup regular**: Configure backups automáticos no Supabase
- **Performance**: Use índices criados nas migrations para queries rápidas
- **Segurança**: Nunca exponha a `service_role` key no frontend

---

## 🆘 Suporte

Em caso de dúvidas:
1. Consulte a [documentação oficial do Supabase](https://supabase.com/docs)
2. Verifique os logs no Supabase Dashboard → **Logs**
3. Revise as migrations e policies no SQL Editor

---

**Última atualização**: 2025-01-27
