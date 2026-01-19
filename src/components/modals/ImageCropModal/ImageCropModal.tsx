import { useState, useRef, useEffect } from 'react';
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

export function ImageCropModal({ isOpen, onClose, onCrop, imageFile }: ImageCropModalProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropSize = 300; // Tamanho do crop quadrado

  useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);
        const img = new Image();
        img.onload = () => {
          imgRef.current = img;
          // Calcular escala inicial para preencher o crop
          const initialScale = Math.max(cropSize / img.width, cropSize / img.height) * 1.1;
          setScale(initialScale);
          setPosition({ x: 0, y: 0 });
        };
        img.src = src;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setImageSrc('');
      setScale(1);
      setPosition({ x: 0, y: 0 });
      imgRef.current = null;
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = cropSize;
    canvas.height = cropSize;

    const img = imgRef.current;
    
    // Calcular dimensões da imagem escalada
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    // Posição do centro do container
    const centerX = cropSize / 2;
    const centerY = cropSize / 2;
    
    // Calcular posição da imagem no preview
    const imgLeft = centerX - scaledWidth / 2 + position.x;
    const imgTop = centerY - scaledHeight / 2 + position.y;
    
    // Calcular a área da imagem original que está visível dentro do crop
    const sourceX = Math.max(0, -imgLeft / scale);
    const sourceY = Math.max(0, -imgTop / scale);
    const visibleWidth = Math.min(img.width - sourceX, cropSize / scale);
    const visibleHeight = Math.min(img.height - sourceY, cropSize / scale);
    
    // Calcular posição de destino no canvas
    const destX = Math.max(0, imgLeft);
    const destY = Math.max(0, imgTop);
    const destWidth = Math.min(cropSize - destX, scaledWidth);
    const destHeight = Math.min(cropSize - destY, scaledHeight);

    ctx.clearRect(0, 0, cropSize, cropSize);
    
    // Se a imagem cobre completamente o crop, fazer crop simples
    if (imgLeft <= 0 && imgTop <= 0 && imgLeft + scaledWidth >= cropSize && imgTop + scaledHeight >= cropSize) {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        visibleWidth,
        visibleHeight,
        0,
        0,
        cropSize,
        cropSize
      );
    } else {
      // Caso contrário, desenhar a parte visível
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        visibleWidth,
        visibleHeight,
        destX,
        destY,
        destWidth,
        destHeight
      );
    }

    canvas.toBlob((blob) => {
      if (blob && imageFile) {
        const croppedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '') + '.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });
        onCrop(croppedFile);
        onClose();
      }
    }, 'image/png', 0.9);
  };

  if (!imageFile) return null;

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
            
            {/* Preview do crop */}
            <div className="flex justify-center">
              <div
                ref={containerRef}
                className="relative border-2 border-gray-300 overflow-hidden bg-gray-100 cursor-move"
                style={{ 
                  height: `${cropSize}px`, 
                  width: `${cropSize}px`
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {imageSrc && imgRef.current && (
                  <img
                    src={imageSrc}
                    alt="Crop preview"
                    className="absolute select-none pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: 'center center',
                      left: '50%',
                      top: '50%',
                      marginLeft: `-${imgRef.current.width / 2}px`,
                      marginTop: `-${imgRef.current.height / 2}px`,
                    }}
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-sm text-gray-600">Zoom</span>
              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
                className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Canvas oculto para processamento */}
          <canvas ref={canvasRef} className="hidden" />
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