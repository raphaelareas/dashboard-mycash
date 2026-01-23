# 🔧 Instruções: Aplicar Migration 009 (Storage RLS Policies)

## ⚠️ Problema Identificado

O erro **"new row violates row-level security policy"** ao fazer upload de foto ocorre porque:
1. As políticas RLS (Row Level Security) para os buckets de storage podem não estar corretas
2. Pode estar faltando a política de UPDATE (o bucket `avatars` mostra apenas 3 políticas, mas deveria ter 4: INSERT, SELECT, UPDATE, DELETE)
3. As políticas existentes podem ter configuração incorreta

## ✅ Solução

A **Migration 009** remove as políticas antigas (se existirem) e cria as políticas RLS corretas para os buckets:
- `avatars` - Avatares de usuários (4 políticas: INSERT, SELECT, UPDATE, DELETE)
- `media` - Mídias gerais (4 políticas: INSERT, SELECT, UPDATE, DELETE)
- `receipts` - Comprovantes e recibos (4 políticas: INSERT, SELECT, UPDATE, DELETE)

**Importante:** A migration vai substituir as políticas existentes. Isso é seguro e necessário para garantir que todas as políticas estejam corretas.

## 🚀 Como Aplicar a Migration

### Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Abra o arquivo `supabase/migrations/009_storage_rls_policies.sql`
5. Cole todo o conteúdo no editor SQL
6. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
7. Verifique se a mensagem de sucesso aparece

## 📋 Verificação

Após aplicar a migration, você pode verificar se as políticas foram criadas:

```sql
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;
```

Deve retornar 12 políticas (4 para cada bucket: INSERT, SELECT, UPDATE, DELETE).

## 🔍 Debug

Se ainda houver erros após aplicar a migration:

1. Verifique se os buckets existem:
   - Vá em **Storage** → **Buckets**
   - Confirme que existem: `avatars`, `media`, `receipts`

2. Se os buckets não existirem, crie-os:
   - Clique em **New bucket**
   - Nome: `avatars` (privado)
   - Nome: `media` (público)
   - Nome: `receipts` (privado)

3. Verifique os logs do console do navegador (F12) para erros específicos

## 📝 Notas

- A migration usa `IF NOT EXISTS` para evitar erros se as políticas já existirem
- As políticas garantem que usuários só possam acessar seus próprios arquivos
- O caminho dos arquivos deve seguir o padrão: `{user_id}/filename.ext`
