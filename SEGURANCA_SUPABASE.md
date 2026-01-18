# 🔒 Segurança do Supabase - Chaves Anon vs Service Role

## ⚠️ Aviso da Vercel sobre `VITE_SUPABASE_ANON_KEY`

Quando você adiciona a variável `VITE_SUPABASE_ANON_KEY` na Vercel, você verá um aviso:

> "This key, which is prefixed with VITE_ and includes the term KEY, might expose sensitive information to the browser. Verify it is safe to share publicly."

## ✅ É Seguro Ignorar Este Aviso

### Por que o aviso aparece?

A Vercel detecta qualquer variável que:
- Começa com `VITE_` (variáveis expostas ao frontend)
- Contém a palavra `KEY` no nome

E alerta por precaução, pois geralmente chaves secretas **não devem** ser expostas ao navegador.

### Por que é seguro neste caso?

**A chave `anon` (ou `public`) do Supabase foi projetada para ser usada no frontend!**

✅ **É SEGURO expor no navegador porque:**

1. **RLS (Row Level Security) protege os dados**
   - Mesmo com a chave anon, o Supabase só permite acesso aos dados do usuário autenticado
   - As políticas RLS (Row Level Security) garantem que cada usuário só acesse seus próprios dados

2. **Chave anon tem permissões limitadas**
   - A chave anon só pode fazer o que as RLS policies permitem
   - Não pode deletar tabelas, alterar schemas, ou acessar dados de outros usuários

3. **Autenticação ainda é necessária**
   - Para criar/ler/atualizar/deletar dados, o usuário precisa estar autenticado
   - A chave anon apenas inicializa a conexão

4. **É o padrão do Supabase**
   - Todos os apps Supabase usam a chave anon no frontend
   - É documentado oficialmente como prática segura

### ⚠️ O que NÃO deve ser exposto

**NUNCA exponha a `service_role` key no frontend!**

A chave `service_role`:
- ❌ Bypassa todas as RLS policies
- ❌ Pode fazer qualquer operação no banco
- ❌ É uma chave administrativa
- ❌ Deve ser usada APENAS em ambientes server-side (backend, funções serverless, etc.)

## 🔍 Como verificar se está usando a chave correta

### ✅ Chave CORRETA (anon/public) - USE ESTA:

```
Características:
- Geralmente começa com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- Localização no Supabase: Settings → API → anon public
- Última parte do nome: "...anon..." ou "...public..."
- ✅ SEGURA para usar no frontend
```

### ❌ Chave INCORRETA (service_role) - NÃO USE ESTA:

```
Características:
- Geralmente começa com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- Localização no Supabase: Settings → API → service_role (geralmente oculta)
- Última parte do nome: "...service_role..."
- ❌ PERIGOSA - nunca exponha no frontend!
```

## 📋 Checklist de Segurança

Ao configurar o Supabase no frontend, certifique-se:

- [ ] ✅ Você está usando a chave **anon** ou **public**
- [ ] ✅ As RLS policies foram aplicadas (ver `002_rls_policies.sql`)
- [ ] ✅ Cada tabela tem policies que verificam `auth.uid()`
- [ ] ✅ Você NÃO está usando `service_role` no frontend
- [ ] ✅ A chave está prefixada com `VITE_` (para expor ao frontend)

## 💡 Resumo

**O aviso da Vercel é apenas uma precaução automática.**

Para `VITE_SUPABASE_ANON_KEY`:
- ✅ **É seguro** expor no navegador
- ✅ **Ignore o aviso** e continue
- ✅ É o padrão recomendado pelo Supabase
- ✅ As RLS policies garantem segurança

## 📚 Documentação Oficial

Para mais informações sobre segurança do Supabase:
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Managing API Keys](https://supabase.com/docs/guides/platform/api-keys)

---

**Conclusão:** Pode clicar em "Save" e continuar! 🚀
