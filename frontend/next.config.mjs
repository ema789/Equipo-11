/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Habilita el compilador de React para optimizar el renderizado */
  reactCompiler: true,

  /**
   * Permite acceder al servidor de desarrollo desde direcciones IP locales.
   * Útil para pruebas en dispositivos móviles en la misma red LAN,
   * o cuando el frontend corre dentro de una VM/WSL.
   */
  allowedDevOrigins: ["192.168.56.1", "localhost", "127.0.0.1"],

  /**
   * Configuración de dominios externos permitidos para next/image.
   * Necesario para cargar imágenes (logos de empresa) alojadas en Cloudinary.
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Dominio de Cloudinary
        port: '',                       // Puerto vacío para usar el estándar (443 para https)
        pathname: '/**',                // Permite acceso a todas las rutas de imágenes bajo este host
      },
    ],
  },
};

export default nextConfig;