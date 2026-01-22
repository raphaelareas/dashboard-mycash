import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/contexts/I18nContext';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (file: File) => void;
  imageFile: File | null;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Função para criar imagem a partir de canvas
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Permitir CORS se necessário
    image.addEventListener('load', () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error('Imagem inválida: dimensões zero'));
        return;
      }
      resolve(image);
    });
    image.addEventListener('error', (error) => {
      console.error('Erro ao carregar imagem:', error);
      reject(new Error('Erro ao carregar imagem'));
    });
    image.src = url;
  });

// Função para obter área cortada redonda
const getRoundedCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const size = Math.min(sourceCanvas.width, sourceCanvas.height);
  canvas.width = size;
  canvas.height = size;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sourceCanvas, 0, 0, size, size);

  // Criar máscara circular
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = size;
  maskCanvas.height = size;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return canvas;

  maskCtx.fillStyle = '#000';
  maskCtx.fillRect(0, 0, size, size);
  maskCtx.globalCompositeOperation = 'destination-in';
  maskCtx.beginPath();
  maskCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  maskCtx.fill();

  // Aplicar máscara
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);

  return canvas;
};

// Função para cortar imagem
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Aplicar máscara circular
  const roundedCanvas = getRoundedCanvas(canvas);

  return new Promise((resolve, reject) => {
    roundedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/png', 0.95);
  });
};

export function ImageCropModal({ isOpen, onClose, onCrop, imageFile }: ImageCropModalProps) {
  const { t } = useI18n();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Carregar imagem quando o modal abrir
  useEffect(() => {
    if (!isOpen) {
      // Resetar estado quando fechar
      setImageSrc('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      return;
    }

    if (imageFile && isOpen) {
      // Resetar estado antes de carregar nova imagem
      setImageSrc('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src && src.startsWith('data:')) {
          setImageSrc(src);
        } else {
          console.error('Erro ao carregar imagem: resultado inválido', src?.substring(0, 50));
        }
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        setImageSrc(''); // Garantir que imageSrc fica vazio em caso de erro
      };
      reader.onabort = () => {
        console.warn('Leitura do arquivo abortada');
        setImageSrc('');
      };
      try {
        reader.readAsDataURL(imageFile);
      } catch (error) {
        console.error('Erro ao iniciar leitura do arquivo:', error);
        setImageSrc('');
      }
    } else if (!imageFile && isOpen) {
      console.warn('ImageCropModal aberto sem imageFile');
    }
  }, [imageFile, isOpen]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc) {
      console.error('handleSave: imageSrc está vazio');
      alert('Erro: Imagem não carregada. Tente novamente.');
      return;
    }
    if (!croppedAreaPixels) {
      console.error('handleSave: croppedAreaPixels está vazio');
      alert('Erro: Área de corte não definida. Tente mover ou ajustar a imagem.');
      return;
    }
    if (!imageFile) {
      console.error('handleSave: imageFile está vazio');
      alert('Erro: Arquivo não encontrado. Tente selecionar a imagem novamente.');
      return;
    }

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!blob) {
        console.error('handleSave: blob é null');
        alert('Erro ao processar imagem. Tente novamente.');
        return;
      }
      const croppedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '') + '.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });
      onCrop(croppedFile);
      onClose();
    } catch (error) {
      console.error('Erro ao cortar imagem:', error);
      alert('Erro ao processar imagem. Tente novamente.');
      // Não fechar o modal em caso de erro para o usuário tentar novamente
    }
  };

  if (!imageFile) {
    console.warn('ImageCropModal: imageFile não fornecido');
    return null;
  }

  if (!imageSrc) {
    // Mostrar loading enquanto a imagem está sendo carregada
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
            <h2 className="text-xl font-bold text-gray-900">Cortar Imagem</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="p-6 flex items-center justify-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Carregando imagem...</p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-w-xl mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
          <h2 className="text-xl font-bold text-gray-900">Cortar Imagem</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Arraste para mover e use a roda do mouse para ajustar o zoom
          </p>
          
          {/* Container do cropper - reduzido em 30% (de 400px para 280px) */}
          <div className="relative w-full mx-auto" style={{ height: '280px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  },
                  cropAreaStyle: {
                    border: '2px solid #fff',
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Carregando imagem...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
              className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
            >
              −
            </button>
            <span className="text-sm text-gray-600">Zoom</span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Footer - dentro do modal */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px] bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {t('imageCrop.cancel') || 'Cancelar'}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            {t('imageCrop.save') || 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
