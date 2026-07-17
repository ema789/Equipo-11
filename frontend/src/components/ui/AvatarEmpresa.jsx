"use client";
import { useState } from "react";
import Image from "next/image";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const AvatarEmpresa = ({ user, className = "h-16 w-16", onEdit }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="relative inline-block">
        {/* Contenedor Circular: recibe la clase del padre */}
        <div
          onClick={() => user?.logo_url && setIsZoomed(true)}
          className={`${className} rounded-full bg-[#0B376D] flex items-center justify-center text-white font-bold overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
        >
          {user?.logo_url ? (
            <Image
              src={user.logo_url}
              alt={user.nombreEmprendimiento || "logo"}
              width={200}
              height={200}
              className="object-cover w-full h-full bg-white"
            />
          ) : (
            // Calculamos el tamaño del font proporcionalmente si es necesario, 
            // o lo dejamos fijo. "text-xl" suele quedar bien en la mayoría de casos.
            <span className="text-xl">
              {user?.nombre?.[0]} {user?.apellido?.[0]}
            </span>
          )}
        </div>

        {/* Botón de editar */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <PencilSquareIcon className="h-4 w-4 text-[#0B376D]" />
          </button>
        )}
      </div>

      {/* Modal Zoom */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-5 right-5 text-white"><XMarkIcon className="h-10 w-10" /></button>
          <Image src={user.logo_url} alt="Logo" width={500} height={500} className="rounded-lg" />
        </div>
      )}
    </>
  );
};