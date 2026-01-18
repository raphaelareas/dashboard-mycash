# 🔧 Configuração Vercel - Supabase

## ⚠️ Erro "Failed to fetch" ao criar conta

Este erro ocorre porque as variáveis de ambiente do Supabase não estão configuradas na Vercel.

## 🚀 Solução Rápida

### Passo 1: Obter credenciais do Supabase

1. Acesse: https://app.supabase.com
2. Selecione o projeto: **dashboard-mycashplus**
3. Vá em: **Settings** → **API**
4. Copie os seguintes valores:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave longa que começa com `eyJ...`)

### Passo 2: Configurar na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **dashboard-mycash**
3. Vá em: **Settings** → **Environment Variables**
4. Clique em **Add New** e adicione:

   **Variável 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (URL que você copiou)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variável 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJ...` (chave que você copiou)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Clique em **Save**

### Passo 3: Fazer Redeploy

Após adicionar as variáveis, você precisa fazer redeploy:

**Opção A - Via Dashboard:**
1. Vá em **Deployments**
2. Clique nos **3 pontos (...)** do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar

**Opção B - Via Git:**
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin dev
```

## ✅ Verificação

Após o redeploy, tente criar uma conta novamente. Se as variáveis estiverem configuradas corretamente:

- ✅ O erro "Failed to fetch" não deve mais aparecer
- ✅ A criação de conta deve funcionar
- ✅ O login deve funcionar

## 🔍 Como verificar se está configurado

Se você abrir o console do navegador (F12 → Console), você deve ver:

- ❌ **Se NÃO estiver configurado:**
  ```
  ⚠️ CONFIGURAÇÃO SUPABASE INVÁLIDA
  Variáveis de ambiente necessárias:
  - VITE_SUPABASE_URL: ❌ FALTANDO
  - VITE_SUPABASE_ANON_KEY: ❌ FALTANDO
  ```

- ✅ **Se estiver configurado:**
  - Nenhuma mensagem de erro no console
  - As requisições ao Supabase funcionam normalmente

## 🐛 Troubleshooting

### Problema: Variáveis configuradas mas ainda dá erro

**Solução:**
1. Verifique se as variáveis foram salvas para **Production** (não apenas Development)
2. Certifique-se de que fez **Redeploy** após adicionar as variáveis
3. Verifique se não há espaços extras nos valores (copie/cole novamente)
4. Verifique se o URL está correto (deve começar com `https://` e terminar com `.supabase.co`)

### Problema: Erro "Invalid API key"

**Solução:**
- Verifique se você copiou a chave **anon/public** e não a **service_role** key
- A chave deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Problema: Erro "Relation does not exist"

**Solução:**
- As migrations SQL ainda não foram aplicadas no Supabase
- Siga o guia em `SUPABASE_INTEGRATION.md` para aplicar as migrations

## 📚 Documentação Adicional

- `SUPABASE_INTEGRATION.md` - Guia completo de integração
- `supabase/migrations/` - Arquivos SQL para migrations
- `supabase/storage/README.md` - Configuração de storage
