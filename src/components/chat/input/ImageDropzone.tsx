
import React, { useRef, useCallback, useState } from 'react';
import { Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageDropzoneProps {
  onDrop: (file: File) => void;
  children: React.ReactNode;
}

export const ImageDropzone = ({ onDrop, children }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left || 
        clientX > rect.right || 
        clientY < rect.top || 
        clientY > rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onDrop(file);
      }
    }
  }, [onDrop]);

  return (
    <div
      ref={dropZoneRef}
      className="relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-whatsapp-header/90 flex items-center justify-center z-50 border-2 border-dashed border-prescrevame/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-2"
            >
              <Image size={32} className="text-prescrevame" />
              <p className="text-prescrevame text-lg font-medium">Solte a imagem aqui</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
