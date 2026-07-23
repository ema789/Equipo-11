import { NextResponse } from "next/server";
import { PROTECTED_ROUTES, AUTH_ROUTES } from "@/lib/routes";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Doble seguridad: Si la ruta es pública o estática, dejar pasar de inmediato
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") // Excluye archivos con extensión (favicon.ico, imagenes, etc.)
    ) {
        return NextResponse.exit ? NextResponse.next() : NextResponse.next();
    }

    // 2. Leer el token desde la Cookie HttpOnly
    const token = request.cookies.get("auth_token")?.value;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // 3. Caso 1: Ruta protegida sin token -> al login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Caso 2: Ruta de auth con token activo -> al perfil
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL("/perfil", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Coincide con todas las rutas de páginas, excepto:
         * - _next/static (archivos estáticos)
         * - _next/image (optimización de imágenes)
         * - favicon.ico (icono)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};