
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling file uploads to Supabase storage
 */
export const useFileUpload = () => {
  /**
   * Uploads an image file to Supabase storage
   */
  const uploadImage = async (
    userId: string,
    imageFile: File
  ): Promise<string | null> => {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('image_analysis')
        .upload(
          `${userId}/${Date.now()}-${imageFile.name}`,
          imageFile,
          { upsert: true, contentType: imageFile.type }
        );
          
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      if (uploadData) {
        // Obtenha a URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('image_analysis')
          .getPublicUrl(uploadData.path);
          
        return publicUrl;
      }

      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return { uploadImage };
};
