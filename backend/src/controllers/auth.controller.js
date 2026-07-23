import {
  registerService,
  loginService,
  getUserByIdService,
  updateUserDateService,
  updateUserCompanyService,
  updateUserLogoService,
} from "../services/auth.service.js";

/**
 * Opciones compartidas para la cookie de autenticación.
 * Se centralizan aquí para que login y logout usen
 * exactamente la misma configuración.
 */

const COOKIE_NAME = "auth_token";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  // En producción (Render/Vercel) usamos true. En local (localhost) false para evitar problemas con HTTP.
  secure: isProduction, 
  
  // Si estamos en producción y en dominios separados (Vercel != Render), usamos 'none'. 
  // En local usamos 'lax'.
  sameSite: isProduction ? "none" : "lax",
  maxAge: 60 * 60 * 1000,
  path: "/",
};



export const registerController = async (req, res, next) => {
  try {
    const user = await registerService(req.body);

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await loginService(req.body);

    res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

    res.json({
      success: true,
      token: result.token,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = (req, res, next) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente"
  });
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.usuario;
    const user = await getUserByIdService(id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

export const updateUserDateController = async (req, res, next) => {
  try {
    const userId = req.usuario.id;
    const dato = { ...req.body, userId };
    const user = await updateUserDateService(dato);
    res.status(200).json({
      success: true,
      message: "Datos actualizados correctamente",
      user
    });
  } catch (error) {
    next(error);
  }
}

export const updateUserCompanyController = async (req, res, next) => {
  try {
    const userId = req.usuario.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }
    const dato = { ...req.body, userId };
    const userCompany = await updateUserCompanyService(dato);
    res.status(200).json({
      success: true,
      message: "Empresa actualizada correctamente",
      userCompany
    });
  } catch (error) {
    next(error);
  }
}

export const updateUserLogoController = async (req, res, next) => {
  try {

    const file = req.file;
    const { id } = req.usuario;
    const userLogo = await updateUserLogoService(id, file);

    res.status(200).json({
      success: true,
      message: "Logo actualizado correctamente",
      userLogo
    });
  } catch (error) {
    next(error);
  }
}