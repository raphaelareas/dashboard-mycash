# 🔧 Instruções: Aplicar Migration 008 em Produção

## ⚠️ Problema Identificado

O erro "Erro ao salvar perfil" em produção ocorre porque a **Migration 008** ainda não foi aplicada no banco de dados de produção.

A migration adiciona os seguintes campos na tabela `users`:
- `phone` - Telefone do usuário
- `cep` - CEP do endereço
- `street` - Logradouro/Rua
- `address_number` - Número do endereço
- `city` - Cidade
- `state` - UF (Estado)
- `address` - Endereço completo (legado, para compatibilidade)

## ✅ Solução Implementada

O código foi atualizado para ser mais defensivo:
1. **Campos básicos** (name, phone, currency, etc.) são atualizados primeiro
2. **Campos de endereço** são atualizados separadamente
3. Se os campos de endereço não existirem, apenas um aviso é logado (não bloqueia o salvamento)
4. Mensagens de erro mais detalhadas para facilitar debug

## 🚀 Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Abra o arquivo `supabase/migrations/008_add_address_fields.sql`
5. Cole todo o conteúdo no editor SQL
6. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
7. Verifique se a mensagem de sucesso aparece

### Opção 2: Via Supabase CLI

```bash
# Se ainda não tiver o CLI instalado
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto (se ainda não linkou)
supabase link --project-ref seu-project-ref

# Aplicar migration
supabase db push
```

## 📋 Verificação

Após aplicar a migration, você pode verificar se as colunas foram criadas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'cep', 'street', 'address_number', 'city', 'state', 'address')
ORDER BY column_name;
```

Deve retornar todas as 7 colunas listadas acima.

## 🔍 Debug

Se ainda houver erros após aplicar a migration:

1. Verifique os logs do console do navegador (F12)
2. Procure por mensagens de erro detalhadas que começam com `❌ Erro ao atualizar perfil:`
3. Verifique se o código de erro é `42703` (coluna não encontrada)
4. Confirme que a migration foi aplicada corretamente executando a query de verificação acima

## 📝 Notas

- A migration é **idempotente** (pode ser executada múltiplas vezes sem problemas)
- Usa `IF NOT EXISTS` para evitar erros se as colunas já existirem
- O campo `address` é mantido para compatibilidade com código legado
