import { z } from "zod";


export const loginSchema = z.object({

  email: z
    .string()
    .email("Debe ser un correo electrónico válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),

});



export const registerSchema = z
.object({

  nombre: z
    .string()
    .min(1, "El nombre es obligatorio"),


  apellido: z
    .string()
    .min(1, "El apellido es obligatorio"),


  nombreEmprendimiento: z
    .string()
    .min(1, "El nombre de la empresa es obligatorio"),


  email: z
    .string()
    .email("Debe ingresar un correo válido"),


  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[a-z]/, "Debe incluir una minúscula")
    .regex(/[0-9]/, "Debe incluir un número"),


  repetirPassword: z
    .string()
    .min(1, "Debe repetir la contraseña"),


  terminos: z
    .boolean()
    .refine(
      (value) => value === true,
      "Debe aceptar los términos y condiciones"
    ),

})
.refine(
  (data) => data.password === data.repetirPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["repetirPassword"],
  }
);

export const registerCompanySchema = z.object({
  razon_social: z
    .string()
    .min(1, "La razón social es obligatoria"),

  cuil_cuit: z
    .string()
    .min(1, "El CUIL/CUIT es obligatorio"),

  direccion: z
    .string()
    .min(1, "La dirección es obligatoria"),

  telefono: z
    .string()
    .min(8, "Debe ingresar un teléfono válido"), 

  rubro: z
    .string()
    .min(1, "El rubro es obligatorio"), 

  sitio_web: z
    .string()
    .url("Debe ingresar una URL válida") 
    .optional()
    .or(z.literal("")), 

  terminos: z
    .boolean()
    .refine(
      (value) => value === true,
      "Debe aceptar los términos y condiciones"
    ),
});
