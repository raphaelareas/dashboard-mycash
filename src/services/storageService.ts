import { supabase } from '@/lib/supabase';

export type BucketName = 'avatars' | 'media' | 'receipts';

export const storageService = {
  // Upload de arquivo para bucket
  async upload(
    bucket: BucketName,
    file: File,
    userId: string,
    path?: string
  ): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = path || `${userId}/${Date.now()}.${fileExt}`;
    const fullPath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Obter URL (pública para media, assinada para outros)
    let url: string;
    if (bucket === 'media') {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      url = publicUrl;
    } else {
      const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
      url = signedData?.signedUrl || '';
    }

    return { path: fullPath, url };
  },

  // Upload de avatar (usa nome fixo para substituir)
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const { url } = await this.upload('avatars', file, userId, fileName);
    return url;
  },

  // Deletar arquivo
  async delete(bucket: BucketName, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  // Obter URL pública (apenas para media bucket)
  getPublicUrl(bucket: BucketName, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Obter URL assinada (para arquivos privados)
  async getSignedUrl(bucket: BucketName, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};
