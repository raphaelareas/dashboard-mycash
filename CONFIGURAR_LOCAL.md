# 🏠 Como Configurar Supabase Localmente

## ⚠️ Problema

Você está vendo um modal/alert sobre configuração do Supabase porque as variáveis de ambiente não estão configuradas no ambiente local.

## ✅ Solução: Criar arquivo `.env.local`

Para desenvolvimento local, você precisa criar um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase.

### Passo 1: Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com
2. Faça login
3. Selecione seu projeto: **dashboard-mycashplus**
4. Vá em: **Settings** → **API**
5. Copie:
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (chave que começa com `eyJ...`)

### Passo 2: Criar arquivo `.env.local`

1. Na raiz do projeto, crie um arquivo chamado `.env.local`
2. Adicione as seguintes linhas:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Substitua os valores:**
- `https://seu-projeto.supabase.co` → Cole a Project URL que você copiou
- `sua-chave-anon-aqui` → Cole a chave anon/public que você copiou

### Passo 3: Reiniciar o servidor

Após criar o arquivo `.env.local`:

1. Pare o servidor (Ctrl + C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

### Passo 4: Testar

1. Acesse: http://localhost:5173
2. O modal de erro **não deve mais aparecer**
3. Você poderá criar conta e fazer login normalmente

## 📝 Exemplo de `.env.local`

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk3NjU0MCwiZXhwIjoxOTU0NTUyNTQwfQ.exemplo...
```

## ⚠️ Importante

- ✅ O arquivo `.env.local` está no `.gitignore` e **NÃO será commitado**
- ✅ Use `.env.local` apenas para desenvolvimento local
- ✅ Para produção, configure as variáveis na Vercel (ver `CONFIGURAR_VERCEL.md`)

## 🐛 Se ainda aparecer erro

1. Verifique se o arquivo está na raiz do projeto (mesmo nível que `package.json`)
2. Verifique se o nome do arquivo é exatamente `.env.local` (com ponto no início)
3. Verifique se não há espaços extras nos valores
4. Reinicie o servidor após criar/editar o arquivo
5. Verifique o console do navegador para erros adicionais

## 📚 Documentação Relacionada

- `CONFIGURAR_VERCEL.md` - Para configurar na Vercel (produção)
- `SEGURANCA_SUPABASE.md` - Sobre segurança das chaves
