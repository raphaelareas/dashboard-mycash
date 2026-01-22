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
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
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
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  // Resetar estado quando fechar
  useEffect(() => {
    if (!isOpen) {
      setImageSrc('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [isOpen]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !imageFile) return;

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '') + '.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });
      onCrop(croppedFile);
      onClose();
    } catch (error) {
      console.error('Erro ao cortar imagem:', error);
    }
  };

  if (!imageFile || !imageSrc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-w-2xl">
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
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Arraste para mover e use a roda do mouse para ajustar o zoom
            </p>
            
            {/* Container do cropper */}
            <div className="relative w-full" style={{ height: '400px', background: '#f0f0f0' }}>
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
                }}
              />
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
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
