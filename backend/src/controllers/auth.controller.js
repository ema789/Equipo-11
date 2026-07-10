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
const COOKIE_OPTIONS = {
    httpOnly: true,  // Inaccesible desde JavaScript del navegador
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "strict", // Defensa contra CSRF
    maxAge: 60 * 60 * 1000, // 1 hora en milisegundos
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

    res.cookie("token", result.token, COOKIE_OPTIONS);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = (req, res, next) => {
  res.clearCookie("token", COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente"
  });
};  

export const getUserByIdController = async (req, res, next) => {
  try{
    const {id} = req.params;
    const user = await getUserByIdService(id);
    res.status(200).json({
      success: true,
      user
    });
  }catch (error){
    next(error);
  }
}

export const updateUserDateController = async (req, res, next) => {
  try{
    const dato = req.body;
    const user = await updateUserDateService(dato);
    res.status(200).json({
      success: true,
      message: "Datos actualizados correctamente",
      user
    });
  }catch (error){
    next(error);
  }
}

export const updateUserCompanyController = async (req, res, next) => {
  try{
    const dato = req.body;
    const userCompany = await updateUserCompanyService(dato);
    res.status(200).json({
      success: true,
      message: "Empresa actualizada correctamente",
      userCompany
    });
  }catch (error){
    next(error);
  }
}

export const updateUserLogoController = async (req, res, next) => {
  try{
    
    const file = req.file;
    const { id } = req.usuario;
    const userLogo = await updateUserLogoService(id, file);
    
    res.status(200).json({
      success: true,
      message: "Logo actualizado correctamente",
      userLogo
    });
  }catch (error){
    next(error);
  }
}