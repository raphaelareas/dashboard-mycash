-- ============================================
-- MIGRATION 009: Storage RLS Policies
-- Políticas de segurança para buckets de storage
-- ============================================

-- ============================================
-- BUCKET: avatars
-- ============================================

-- Policy: Usuários podem fazer upload de seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem ler seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can read own avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem atualizar seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem deletar seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- BUCKET: media
-- ============================================

-- Policy: Usuários podem fazer upload de suas próprias mídias
CREATE POLICY IF NOT EXISTS "Users can upload own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Qualquer um pode ler mídias (público)
CREATE POLICY IF NOT EXISTS "Anyone can read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy: Usuários podem atualizar suas próprias mídias
CREATE POLICY IF NOT EXISTS "Users can update own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem deletar suas próprias mídias
CREATE POLICY IF NOT EXISTS "Users can delete own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- BUCKET: receipts
-- ============================================

-- Policy: Usuários podem fazer upload de seus próprios recibos
CREATE POLICY IF NOT EXISTS "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem ler seus próprios recibos
CREATE POLICY IF NOT EXISTS "Users can read own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem atualizar seus próprios recibos
CREATE POLICY IF NOT EXISTS "Users can update own receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuários podem deletar seus próprios recibos
CREATE POLICY IF NOT EXISTS "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
