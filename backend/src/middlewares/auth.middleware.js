import jwt from "jsonwebtoken";
import {
    findUserByIdRepository
} from "../repositories/usuario.repository.js";

// verificacion del token
export const authMiddleware = async (req, res, next) => {
    // Middleware que valida el token antes de continuar.
    try {
        /* =========================================
            OBTENER TOKEN: cookie httpOnly (web) o
            header Authorization (apps sin cookies)
        ========================================= */

        const tokenFromCookie = req.cookies?.auth_token;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader ? authHeader.split(" ")[1] : null;

        const token = tokenFromCookie || tokenFromHeader;

        // Error si no hay token válido
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token no proporcionado",
            });
        }

        /*==========================================
            VERIFY JWT
        ============================================ */

        // Verifica y decodifica el token usando la clave secreta
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );
        

        /* =========================================
            BUSCAR USUARIO
        ========================================= */
        /**
         * En PostgreeSQL buyscamos mediante repositorios
        */

        const usuario = await findUserByIdRepository(decoded.id);
        // Si el usuario no existe
        if(!usuario){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        /* =========================================
            INYECTAR EN REQUEST
        ========================================= */

        req.usuario = usuario; 

        req.auth = {
            id: usuario.id
        }

        next()



    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado"
        });
     }
}