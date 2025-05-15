import React from "react";

interface ImageModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          className="absolute top-2 right-2 bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <i className="fa-solid fa-times"></i>
        </button>
        <img
          src={imageSrc}
          alt="Full size image"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageModal;
