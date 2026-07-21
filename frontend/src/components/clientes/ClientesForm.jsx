"use client";
// Hooks de React para manejar estado y efectos secundarios
import { useEffect, useState } from "react";
// Librería para administrar formularios
import { useForm } from "react-hook-form";
// Componentes reutilizables de la aplicación
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
// Permite conectar Zod con React Hook Form
import { zodResolver } from "@hookform/resolvers/zod";
// Esquema de validación del formulario
import { registerClienteSchema } from "@/lib/validations";
// Servicios para comunicarse con el backend
import {
  createClienteService,
  updateClienteService,
  getClienteByIdService,
} from "@/services/clientes.service";

/* ======================================================
    FORMULARIO DE CLIENTES
    ------------------------------------------------------
    Este componente sirve para:
    
    • Crear un cliente nuevo.
    • Editar un cliente existente.
    
    Si recibe un clienteId, entra en modo edición.
    Si clienteId es null, entra en modo creación.
   ======================================================
*/

/**
 * isOpen: controla si el modal está abierto.
 * onClose: función para cerrar el modal.
 * onSuccess: callback que ejecuta el padre cuando la operación termina correctamente.
 * clienteId: si existe, indica qué cliente editar.
 */
export const ClientesForm = ({
  isOpen,
  onClose,
  onSuccess,
  clienteId = null,
}) => {
  // Guarda mensajes de error que devuelve el servidor.
  const [errorServer, setErrorServer] = useState(null);
  // Indica si se están cargando los datos de un cliente.
  const [isLoadingCliente, setIsLoadingCliente] = useState(false);

  // Si existe un clienteId significa que estamos editando.
  const isEditing = Boolean(clienteId);

  /* ======================================================
   * Configuración del formulario.
   * register: Conecta cada Input con React Hook Form.
   * handleSubmit: Ejecuta las validaciones antes de enviar.
   * reset: Limpia el formulario o carga datos.
   * errors: Contiene los errores generados por Zod.
   * isSubmitting: Vale true mientras se envía el formulario.
   * ====================================================== */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    // Zod será el encargado de validar todos los campos.
    resolver: zodResolver(registerClienteSchema),
    // Valores iniciales del formulario.
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
    },
  });

  /*   
    ======================================================
        * Cuando el modal se abre:

        * Si estamos editando:
            Se consulta el cliente al backend.
            Luego se completan automáticamente los inputs.

        * Si estamos creando:
            Se limpia el formulario.

        * Este efecto se ejecuta cuando cambia:
            • isOpen
            • clienteId
    ====================================================== 
  */

  useEffect(() => {
    if (isOpen) {
      if (isEditing && clienteId) {
        // Función que obtiene los datos del cliente desde el backend.
        const fetchClienteData = async () => {
          // Activamos el estado de carga.
          setIsLoadingCliente(true);
          try {
            // Consultamos el cliente mediante su ID.
            const data = await getClienteByIdService(clienteId);
            /**
             * Algunos backends responden:
             * { cliente:{...} }
             * Otros: { ... }
             * Esta línea soporta ambos casos.
             * */
            const cliente = data.cliente || data;

            /**  Rellenamos el formulario automáticamentecon los datos traídos
             * reset también permite cargar datos,
             * no solamente limpiar el formulario.*/
            reset({
              nombre: cliente.nombre || "",
              apellido: cliente.apellido || "",
              telefono: cliente.telefono || "",
              email: cliente.email || "",
            });
          } catch (err) {
            // Si ocurre un error mostrando los datos
            // avisamos al usuario.
            setErrorServer("No se pudieron cargar los datos del cliente.");
          } finally {
            // Finalizó la carga.
            // Ocultamos el indicador de loading.
            setIsLoadingCliente(false);
          }
        };
        fetchClienteData();
      } else {
        // Si es creación, limpiamos el formulario por completo
        reset({
          nombre: "",
          apellido: "",
          telefono: "",
          email: "",
        });
        setErrorServer(null);
      }
    }
  }, [isOpen, clienteId, isEditing, reset]);

  /* ======================================================
      * Envío del formulario.
      * Si estamos editando:
      *      PUT /clientes/:id
      * Si estamos creando:
      *      POST /clientes
    ======================================================*/

  const onSubmit = async (data) => {
    // Eliminamos cualquier error anterior antes de enviar.
    setErrorServer(null);

    try {
      let response;
      if (isEditing) {
        // Actualizamos un cliente existente.
        // Actualizamos usando el ID y los datos del form
        response = await updateClienteService(clienteId, data);
      } else {
        // Creamos un cliente nuevo
        response = await createClienteService(data);
      }

      // Avisamos al componente padre que todo salió bien.
      // Generalmente se usa para actualizar la tabla.
      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (err) {
      // Si el backend devuelve un error,
      // mostramos el mensaje correspondiente.
      setErrorServer(
        err.response?.data?.message ||
          `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el cliente.`,
      );
    }
  };

  return (
    <>
      {/**
       * El mismo modal sirve para crear y editar.
       * Solo cambia el título y la lógica del envío.
       * */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? "Editar cliente" : "Nuevo cliente"}
      >
        {isLoadingCliente ? (
          <div className="py-8 text-center text-gray-500">
            Cargando datos del cliente...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={
                <span>
                  Nombre <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Nombre"
              error={errors.nombre?.message}
              {...register("nombre")}
            />

            <Input
              label={
                <span>
                  Apellido <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Apellido"
              error={errors.apellido?.message}
              {...register("apellido")}
            />

            <Input
              label={
                <span>
                  Número de contacto <span className="text-red-500">*</span>
                </span>
              }
              type="tel"
              placeholder="(+54) 118576-1235"
              error={errors.telefono?.message}
              {...register("telefono")}
            />

            <Input
              label={
                <span>
                  Email <span className="text-red-500">*</span>
                </span>
              }
              type="email"
              placeholder="Ingresá el email"
              error={errors.email?.message}
              {...register("email")}
            />

            {errorServer && (
              <p className="text-center text-sm text-red-500 mt-1">
                {errorServer}
              </p>
            )}
            {/** 
                *  Botón principal.
                *  Mientras se envía:
                    • Se deshabilita.
                    • Cambia automáticamente el texto.

                * Evita que el usuario haga doble clic y 
                    envíe el formulario dos veces.
            */}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#528A72] hover:bg-[#43725d] text-white font-medium py-3 rounded-2xl transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting
                  ? isEditing
                    ? "Guardando..."
                    : "Creando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear cliente"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};