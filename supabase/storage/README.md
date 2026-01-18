# Configuração de Storage Buckets no Supabase

Este documento descreve como configurar os buckets de storage necessários para o mycash+.

## 📦 Buckets Necessários

### 1. **avatars** - Avatares de usuários e membros da família
- **Public**: Não (privado)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Max file size**: 5MB
- **Policies**: Usuários podem fazer upload/read/delete apenas de seus próprios avatares

### 2. **media** - Imagens e mídias gerais (logos de cartões, etc)
- **Public**: Sim (público para leitura, privado para escrita)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- **Max file size**: 10MB
- **Policies**: Usuários podem fazer upload/read de seus próprios arquivos

### 3. **receipts** - Comprovantes e recibos de transações
- **Public**: Não (privado)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `application/pdf`
- **Max file size**: 10MB
- **Policies**: Usuários podem fazer upload/read/delete apenas de seus próprios recibos

## 🚀 Como Configurar via Supabase Dashboard

### Passo 1: Criar os Buckets

1. Acesse o Supabase Dashboard
2. Vá em **Storage** → **Buckets**
3. Clique em **New bucket** e crie cada bucket com as configurações acima

### Passo 2: Configurar RLS Policies

Para cada bucket, configure as seguintes policies:

#### Bucket: `avatars`

```sql
-- Policy: Usuários podem fazer upload de seus próprios avatares
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem ler seus próprios avatares
CREATE POLICY "Users can read own avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem deletar seus próprios avatares
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Bucket: `media`

```sql
-- Policy: Usuários podem fazer upload de suas próprias mídias
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Qualquer um pode ler mídias (público)
CREATE POLICY "Anyone can read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy: Usuários podem deletar suas próprias mídias
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Bucket: `receipts`

```sql
-- Policy: Usuários podem fazer upload de seus próprios recibos
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem ler seus próprios recibos
CREATE POLICY "Users can read own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem deletar seus próprios recibos
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 💻 Uso no Código

Exemplo de upload de avatar:

```typescript
import { supabase } from '@/lib/supabase';

async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

## 📝 Notas

- Todos os arquivos são organizados por `user_id` em pastas (`{user_id}/filename.ext`)
- Use `upsert: true` para substituir arquivos existentes
- URLs públicas são válidas enquanto o arquivo existir no bucket
- Para arquivos privados, use `getSignedUrl()` ao invés de `getPublicUrl()`
