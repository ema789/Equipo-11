"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMeService, logoutService } from "@/services/authService";
import { MenuItem } from "./MenuItem";
import { AvatarEmpresa } from "../../ui/AvatarEmpresa";
import {
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BellIcon,
  PaintBrushIcon,
  QuestionMarkCircleIcon,
  DocumentIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export const PerfilHome = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Obtenemos los datos reales de la API
    getMeService()
      .then((res) => {
        // Asegúrate de que res.user tenga la estructura esperada:
        // nombre, apellido, email, telefono, empresa, rol
        setUser(res.user);
      })
      .catch((err) => {
        console.error("Error cargando perfil:", err);
      });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutService();
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/login");
    }
  };

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-4 max-w-md mx-auto">
      {/* Tarjeta de usuario con datos reales */}
      <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <AvatarEmpresa 
              user={user}
              className="h-16 w-16"
              onEdit={() => router.push("/perfil/updateLogo")}
          />
          <div>
            <p className="text-lg font-bold text-[#0B376D]">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500">
              {user.telefono || "Sin teléfono"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8 text-teal-800 bg-teal-100 p-1.5 rounded-lg" />
            <div>
              <p className="text-sm font-bold text-[#0B376D]">
                {user.nombreEmprendimiento || "Sin nombre"}
              </p>
              <p className="text-xs text-gray-500">
                {user.rubro || "Sin rubro"}
              </p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-[#0B376D]" />
        </div>
      </section>

      {/* Menús agrupados */}
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-2 ml-2">Cuenta</h2>
          <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem
              icon={<UserIcon />}
              title="Mis datos"
              subtitle="Editar información personal"
              href="/perfil/datos"
            />
            <MenuItem
              icon={<BuildingOfficeIcon />}
              title="Mi empresa"
              subtitle="Datos de configuración"
              href="/perfil/empresa"
            />
            <MenuItem
              icon={<ShieldCheckIcon />}
              title="Seguridad"
              subtitle="Cambiar contraseña"
              href="/perfil/seguridad"
            />
            <MenuItem
              icon={<DocumentTextIcon />}
              title="Mis productos"
              subtitle="Gestionar servicios"
              href="/productos"
            />
            <MenuItem
              icon={<Cog6ToothIcon />}
              title="Mis clientes"
              subtitle="Cartera de clientes"
              href="/clientes"
              isLast
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-2 ml-2">
            Preferencias
          </h2>
          <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem
              icon={<BellIcon />}
              title="Notificaciones"
              subtitle="Alertas"
              href="/notificaciones"
            />
            <MenuItem
              icon={<PaintBrushIcon />}
              title="Apariencia"
              subtitle="Personalización"
              href="/apariencia"
              isLast
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-2 ml-2">Más</h2>
          <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem
              icon={<QuestionMarkCircleIcon />}
              title="Ayuda"
              subtitle="Soporte y contacto"
              href="/ayuda"
            />
            <MenuItem
              icon={<DocumentIcon />}
              title="Términos"
              subtitle="Políticas de uso"
              href="/terminos"
            />
            <MenuItem
              icon={<InformationCircleIcon />}
              title="Acerca de"
              subtitle="Versión 1.0.0"
              href="/acerca"
              isLast
            />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-3xl bg-white p-4 shadow-sm border border-gray-100 text-red-500 font-semibold hover:bg-red-50 transition-colors"
      >
        {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
    </div>
  );
};
