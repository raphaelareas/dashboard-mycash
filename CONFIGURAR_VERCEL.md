# 🚀 Como Configurar Variáveis de Ambiente na Vercel

## ⚠️ Você está vendo este erro?

```
Supabase não está configurado. Configure VITE_SUPABASE_URL e 
VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel.
```

Isso significa que as variáveis de ambiente **precisam ser configuradas manualmente** no painel da Vercel.

---

## 📋 Passo a Passo Detalhado

### **PASSO 1: Obter Credenciais do Supabase**

1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **dashboard-mycashplus**
4. No menu lateral esquerdo, clique em **Settings** (ícone de engrenagem ⚙️)
5. Clique em **API** (dentro de Settings)
6. Você verá duas informações importantes:

   **a) Project URL:**
   - Procure por "Project URL" ou "URL"
   - Copie o valor completo (ex: `https://abcdefghijklmnop.supabase.co`)
   - ✅ Este será o valor de `VITE_SUPABASE_URL`

   **b) API Keys:**
   - Procure por "anon" ou "public" key
   - É uma string longa que começa com `eyJhbGci...`
   - Clique no ícone de **copiar** (📋) ao lado
   - ✅ Este será o valor de `VITE_SUPABASE_ANON_KEY`

---

### **PASSO 2: Configurar na Vercel**

1. Acesse: https://vercel.com/dashboard
2. Faça login na sua conta
3. Encontre e clique no projeto: **dashboard-mycash** (ou o nome do seu projeto)
4. No menu superior, clique em **Settings**
5. No menu lateral esquerdo, clique em **Environment Variables**
6. Você verá uma lista de variáveis (provavelmente vazia)

#### **Adicionar primeira variável:**

7. Clique no botão **Add New** (ou **Add**)
8. Preencha:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Cole a URL que você copiou do Supabase (ex: `https://abcdefghijklmnop.supabase.co`)
   - **Environments**: Marque todas as opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
9. Clique em **Save**

#### **Adicionar segunda variável:**

10. Clique em **Add New** novamente
11. Preencha:
    - **Key**: `VITE_SUPABASE_ANON_KEY`
    - **Value**: Cole a chave anon que você copiou do Supabase (ex: `eyJhbGci...`)
    - **Environments**: Marque todas as opções:
      - ✅ Production
      - ✅ Preview
      - ✅ Development

   ⚠️ **Nota sobre o aviso de segurança:**
   
   A Vercel pode mostrar um aviso amarelo sobre expor a chave. **É SEGURO ignorar este aviso!**
   
   - A chave `anon` (ou `public`) do Supabase foi projetada para ser usada no frontend
   - Ela é protegida pelas RLS policies que configuramos
   - Veja `SEGURANCA_SUPABASE.md` para mais detalhes

12. Clique em **Save** (pode ignorar o aviso amarelo)

**Resultado esperado:** Você deve ver 2 variáveis na lista:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### **PASSO 3: Fazer Redeploy**

⚠️ **IMPORTANTE:** Após adicionar as variáveis, você **DEVE** fazer um redeploy para que elas sejam aplicadas.

#### **Opção A - Via Dashboard (Mais fácil):**

1. Ainda na Vercel, vá para a aba **Deployments**
2. Encontre o último deploy na lista
3. Clique nos **3 pontos (...)** no canto direito do deploy
4. Selecione **Redeploy**
5. Aguarde o build completar (pode levar 1-2 minutos)

#### **Opção B - Via Git:**

```bash
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin dev
```

---

## ✅ Verificar se Funcionou

Após o redeploy, teste novamente:

1. Acesse sua aplicação: https://dashboard-mycash-cyan.vercel.app/
2. Tente criar uma conta
3. O erro **não deve mais aparecer**
4. A criação de conta deve funcionar

---

## 🔍 Verificação no Console

Abra o console do navegador (F12 → Console) e verifique:

- ❌ **Se ainda estiver com erro:**
  ```
  ⚠️ CONFIGURAÇÃO SUPABASE INVÁLIDA
  Variáveis de ambiente necessárias:
  - VITE_SUPABASE_URL: ❌ FALTANDO
  - VITE_SUPABASE_ANON_KEY: ❌ FALTANDO
  ```
  → Isso significa que as variáveis não foram aplicadas. **Faça redeploy novamente.**

- ✅ **Se estiver funcionando:**
  - Nenhuma mensagem de erro sobre Supabase
  - As requisições funcionam normalmente

---

## 🐛 Problemas Comuns

### **Problema 1: Variáveis adicionadas mas ainda dá erro**

**Solução:**
- Verifique se marcou **Production** nas opções de environment
- Verifique se você fez **Redeploy** após adicionar as variáveis
- Variáveis só são aplicadas em novos deploys

### **Problema 2: "Invalid API key" ou erro 401**

**Solução:**
- Verifique se copiou a chave **anon/public** e não a **service_role**
- A chave anon geralmente começa com `eyJhbGci...`
- Copie novamente do Supabase para garantir

### **Problema 3: URL incorreta**

**Solução:**
- A URL deve começar com `https://`
- Deve terminar com `.supabase.co`
- Exemplo correto: `https://abcdefghijklmnop.supabase.co`

---

## 📸 Screenshots de Referência

### Supabase - Onde encontrar as credenciais:
```
Settings → API
├── Project URL: https://xxxxx.supabase.co
└── API Keys
    └── anon public: eyJhbGci...
```

### Vercel - Onde adicionar variáveis:
```
Settings → Environment Variables → Add New
├── Key: VITE_SUPABASE_URL
├── Value: https://xxxxx.supabase.co
└── Environments: [✅] Production [✅] Preview [✅] Development
```

---

## 💡 Dica

Após configurar na Vercel, você também pode criar um arquivo `.env.local` localmente para desenvolvimento:

```bash
# Criar arquivo .env.local na raiz do projeto
cp .env.example .env.local

# Editar e colar suas credenciais
# Agora funciona localmente também!
```

---

## ❓ Ainda com problemas?

Se após seguir todos os passos ainda não funcionar:

1. Verifique se o projeto Supabase está ativo
2. Verifique se as migrations foram aplicadas no Supabase
3. Verifique o console do navegador para erros específicos
4. Consulte `SUPABASE_INTEGRATION.md` para mais detalhes
