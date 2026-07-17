"use client"; // Es un componente cliente porque usa hooks

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
// Estas son las rutas donde queremos que aparezca la barra
import { PROTECTED_ROUTES } from "@/lib/routes";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Comprobamos si la ruta actual es una de las protegidas
  const shouldShowNavbar = PROTECTED_ROUTES.some((route) => 
    pathname.startsWith(route)
  );

  // Si no es una ruta protegida, no renderizamos nada
  if (!shouldShowNavbar) return null;

  return <Navbar />;
}