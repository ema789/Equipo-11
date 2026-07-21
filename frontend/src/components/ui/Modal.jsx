"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export const Modal = ({ isOpen, onClose, title, children }) => {
  // Si no está abierto, no renderiza nada en el DOM
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      {/* Contenedor principal del modal */}
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0B376D]">{title}</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#0B376D] hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Contenido dinámico (Formularios) */}
        <div>{children}</div>
      </div>
    </div>
  );
};