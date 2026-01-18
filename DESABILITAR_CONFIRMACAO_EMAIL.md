# 📧 Como Desabilitar Confirmação de E-mail no Supabase

## ⚠️ Problema: "E-mail não confirmado"

Se você está recebendo o erro **"E-mail não confirmado"** ao fazer login, isso significa que a confirmação de e-mail está habilitada no Supabase.

## ✅ Solução: Desabilitar Confirmação de E-mail (Desenvolvimento)

Para facilitar o desenvolvimento e testes, você pode desabilitar a confirmação de e-mail:

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://app.supabase.com
   - Selecione seu projeto: **dashboard-mycashplus**

2. **Navegue até Authentication Settings:**
   - No menu lateral esquerdo, clique em **Authentication**
   - Clique em **Settings** (ou **Configurações**)

3. **Desabilite a Confirmação de E-mail:**
   - Procure por **"Enable email confirmations"** ou **"Habilitar confirmações de e-mail"**
   - **Desmarque** a opção (toggle OFF)
   - Isso permite que usuários façam login imediatamente após criar conta

4. **Salve as Alterações:**
   - Clique em **Save** ou **Salvar**

### ⚠️ Importante:

- ✅ **Desenvolvimento:** Desabilitar é recomendado para facilitar testes
- ❌ **Produção:** Considere manter habilitado para segurança
- 📧 **E-mails:** Quando habilitado, o Supabase envia e-mail de confirmação automaticamente

## 🔧 Alternativa: Confirmar E-mail Manualmente

Se preferir manter a confirmação habilitada:

1. Ao criar conta, verifique sua caixa de entrada
2. Procure por e-mail do Supabase com assunto tipo "Confirm your signup"
3. Clique no link de confirmação no e-mail
4. Depois disso, o login funcionará normalmente

## 🐛 Se o E-mail de Confirmação Não Chegar:

1. Verifique a pasta **Spam/Lixo Eletrônico**
2. Aguarde alguns minutos (pode haver delay)
3. No Supabase Dashboard, vá em **Authentication → Users**
4. Clique no usuário e você pode verificar se está confirmado
5. Você pode reenviar o e-mail de confirmação manualmente

## 📚 Configuração Avançada (Opcional)

Para personalizar os e-mails de confirmação:

1. **Authentication → Email Templates**
2. Customize templates de confirmação
3. Configure redirecionamento após confirmação

---

**Após desabilitar a confirmação, tente criar uma nova conta e fazer login novamente!** 🚀
