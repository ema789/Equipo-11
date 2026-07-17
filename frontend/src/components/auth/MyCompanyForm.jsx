"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { AvatarEmpresa } from "@/components/ui/AvatarEmpresa";
import { BackButton } from "../ui/BackButton";
import { getMeService, updateUserCompanyService } from "@/services/authService";

export const MyCompanyForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  // Precarga el formulario con los datos actuales del usuario
  useEffect(() => {
    getMeService()
      .then((res) => {
        setUser(res.user);
        const { razon_social, cuil_cuit, direccion, telefono, rubro, sitio_web } = res.user;
        reset({ razon_social, cuil_cuit, direccion, telefono, rubro, sitio_web});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const dataToSend = {
        ...data,
        userId: user.id 
      };
      await updateUserCompanyService(dataToSend);
      router.push("/perfil/empresa");
    } catch (error) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "No se pudieron guardar los cambios. Intentá nuevamente.",
      });
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      {/* Encabezado */}
      <div className="flex items-center mb-6">
        <BackButton />
        <h1 className="flex-1 text-center text-2xl font-bold text-black mr-8">
          Mi Empresa
        </h1>
      </div>

      {/* Logo Reutilizable  Avatar  */}
      <div className="flex justify-center mb-8">
        <AvatarEmpresa
          user={user}
          className="h-30 w-30"
          onEdit={() => router.push("/perfil/updateLogo")} // Redirección al hacer clic en el lápiz
        />
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Razon Social"
          placeholder="Servicios Arg"
          error={errors.razon_social?.message}
          {...register("razon_social")}
        />

        <Input
          label="CUIL / CUIT"
          placeholder="30-71234567-8"
          error={errors.cuil_cuit?.message}
          {...register("cuil_cuit")}
        />

        <Input
          label="Dirección"
          type="direccion"
          placeholder="Calle Falsa 1234, CABA, Buenos Aires"
          error={errors.direccion?.message}
          {...register("direccion")}
        />

        <Input
          label="Teléfono"
          placeholder="+54 9 11 50214093"
          error={errors.telefono?.message}
          {...register("telefono")}
        />

        <Input
          label="Rubro"
          placeholder="Servicios"
          error={errors.rubro?.message}
          {...register("rubro")}
        />

        <Input
          label="Sitio Web"
          placeholder="www.serviciosarg.com.ar"
          error={errors.sitio_web?.message}
          {...register("sitio_web")}
        />


        {errors.root && (
          <p className="text-center text-sm text-red-500">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
className="w-full h-12 rounded-xl bg-[#5B9B82] text-white font-medium hover:bg-[#4E8C74] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </>
  );
};
