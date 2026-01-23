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

    const { error } = await supabase.storage
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

  // Upload de avatar - versão simplificada e robusta
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `avatar.${fileExt}`;
    const fullPath = `${userId}/${fileName}`;

    console.log('📤 Iniciando upload de avatar:', { userId, fileName, size: file.size });

    // Fazer upload
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fullPath, file, {
        cacheControl: '31536000', // 1 ano
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      throw uploadError;
    }

    console.log('✅ Upload concluído, gerando URL assinada...');

    // Obter URL assinada (avatars é privado)
    // Usar validade de 1 ano para evitar expiração
    const { data: signedData, error: urlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(fullPath, 31536000); // 1 ano de validade

    if (urlError || !signedData) {
      console.error('❌ Erro ao obter URL:', urlError);
      throw urlError || new Error('Não foi possível obter URL do arquivo');
    }

    console.log('✅ URL assinada gerada com sucesso');
    return signedData.signedUrl;
  },

  // Obter URL assinada do avatar (para recarregar quando necessário)
  async getAvatarUrl(userId: string, fileExt: string = 'png'): Promise<string | null> {
    const fileName = `avatar.${fileExt}`;
    const fullPath = `${userId}/${fileName}`;

    const { data: signedData, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(fullPath, 31536000);

    if (error || !signedData) {
      return null;
    }

    return signedData.signedUrl;
  },

  // Deletar arquivo
  async delete(bucket: BucketName, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  // Deletar avatar do usuário
  async deleteAvatar(userId: string): Promise<void> {
    // Tentar deletar diferentes extensões possíveis
    const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    const pathsToDelete = extensions.map(ext => `${userId}/avatar.${ext}`);
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove(pathsToDelete);

    // Não lançar erro se o arquivo não existir
    if (error && !error.message.includes('not found')) {
      console.error('❌ Erro ao deletar avatar:', error);
      throw error;
    }

    console.log('✅ Avatar deletado com sucesso');
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
