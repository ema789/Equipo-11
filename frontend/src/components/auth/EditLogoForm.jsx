"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { updateUserLogoService } from "@/services/authService";
import { useRouter } from "next/navigation";

export const EditarLogoForm = ({ user }) => {
  const [file, setFile] = useState(null);
  // La vista previa puede ser una URL de Cloudinary (string) o un Blob (string generado)
  const [preview, setPreview] = useState(user?.logo_url);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Limpiar la URL del objeto blob al desmontar el componente para liberar memoria
  useEffect(() => {
    return () => {
      if (
        preview &&
        typeof preview === "string" &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Si ya había una vista previa de blob, revocarla para no saturar la memoria
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setFile(selectedFile);
      // Crear nueva URL de objeto para la vista previa local
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("logo", file); // Asegúrate que el campo se llame igual que en tu backend (Multer)

      await updateUserLogoService(formData);

      // Opcional: Revocar preview final antes de salir
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      router.refresh(); // Refresca los datos del servidor
      router.push("/perfil"); // Vuelve al home
    } catch (error) {
      console.error("Error al actualizar logo:", error);
      alert("No se pudo actualizar el logo");
    } finally {
      setLoading(false);
    }
  };

  // Determinar si la imagen es un blob local (para desactivar optimización de next/image)
  const isLocalBlob =
    preview && typeof preview === "string" && preview.startsWith("blob:");

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Contenedor circular para la imagen */}
        <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {" "}
          {preview ? (
            <Image
              src={preview}
              alt="vista previa del logo"
              fill
              sizes="160px"
              className="object-cover"
              // Importante: Desactivar optimización para blobs locales,
              // o configurar el dominio en next.config.js
              unoptimized={isLocalBlob}
              priority // Cargar rápido porque es lo primero que ve el usuario
            />
          ) : (
            // Fallback si no hay imagen ni vista previa
            <div className="flex h-full w-full items-center justify-center bg-[#0B376D] text-5xl font-bold text-white">
              {user?.nombre?.[0]}
              {user?.apellido?.[0]}
            </div>
          )}
        </div>

        {/* Botón personalizado de subida de archivo */}
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer bg-[#0B376D] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#082a54] transition-colors duration-200 shadow-sm active:scale-95">
            {preview ? "Cambiar imagen" : "Seleccionar logo"}
            <input
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Máx 5MB. Formatos: PNG, JPG, WEBP.
          </p>
        </div>
      </div>

      {/* Botón de guardar */}
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full h-14 bg-[#5B9B82] text-white rounded-xl font-bold text-lg hover:bg-[#4E8C74] transition-all 
        duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
        shadow-md hover:shadow-lg active:scale-[0.99]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Procesando...
          </span>
        ) : (
          "Guardar cambios"
        )}
      </button>
    </form>
  );
};
