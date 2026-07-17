"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeService } from "@/services/authService";
import { EditarLogoForm } from "@/components/auth/EditLogoForm";
import { BackButton } from "@/components/ui/BackButton";
export default function UpdateLogoPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getMeService()
      .then((res) => {
        setUser(res.user);
      })
      .catch((err) => {
        console.error("Error de autenticación en la ruta:", err);
        // Si el token expiró o no es válido, lo mandamos al login
        router.push("/login");
      });
  }, [router]);

  if(!user){
    return <div className="p-10 text-center text-[#0B376D] font-medium">Verificando credenciales...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pt-10">
      <div className="max-w-md mx-auto">
        {/* Usamos tu componente reutilizable */}
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="flex-1 text-center text-xl font-bold text-[#0B376D] mr-8">
            Actualizar Logo
          </h1>
        </div>
        
        {/* Renderizamos el formulario global pasándole el usuario obtenido */}
        <EditarLogoForm user={user} />
      </div>
    </main>
  );

}
