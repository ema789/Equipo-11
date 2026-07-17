"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { loginService } from "@/services/authService";

export const LoginForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await loginService(data);
      router.push("/perfil");
    } catch (error) {
      setError("password", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Credenciales inválidas. Verificá tu email y contraseña.",
      });
    }
  };

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/logo.png"
          alt="Logo InnovaLab"
          width={130}
          height={130}
          priority
        />
      </div>

      {/* Título */}
      <h1 className="text-5xl font-bold text-center text-[#0B376D] mb-12">
        Bienvenido/a
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end -mt-3">
          <button
            type="button"
            className="text-[15px] font-medium text-[#6B7280] hover:text-[#4B5563]"
          >
            Olvidé mi contraseña
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-[#5B9B82] text-white text-lg font-semibold transition hover:bg-[#4E8C74] disabled:opacity-50"
        >
          {isSubmitting ? "Autenticando..." : "Iniciar sesión"}
        </button>

        <p className="text-center text-[17px] font-medium text-[#0B376D]">
          ¿Aún no tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#5B9B82] hover:underline"
          >
            Registrate
          </Link>
        </p>

      </form>
    </div>
  );
};