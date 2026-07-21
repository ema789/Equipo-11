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
import { registerItemSchema } from "@/lib/validations";
// Servicios para comunicarse con el backend
import {
  createItemsService,
  updateItemsService,
  getClienteItemsByIdService,
} from "@/services/items.service";

/* ======================================================
    FORMULARIO DE ITEMS
    ------------------------------------------------------
    Este componente sirve para:
    
    • Crear un item nuevo.
    • Editar un item existente.
    
    Si recibe un itemId, entra en modo edición.
    Si clienteId es null, entra en modo creación.
   ======================================================
*/

/**
 * isOpen: controla si el modal está abierto.
 * onClose: función para cerrar el modal.
 * onSuccess: callback que ejecuta el padre cuando la operación termina correctamente.
 * itemId: si existe, indica qué item editar.
 */

export const ItemsForm = ({ isOpen, onClose, onSuccess, itemId = null }) => {
  // Guarda mensajes de error que devuelve el servidor.
  const [errorServer, setErrorServer] = useState(null);
  // Indica si se están cargando los datos de un item.
  const [isLoadingCliente, setIsLoadingCliente] = useState(false);

  // Si existe un clienteId significa que estamos editando.
  const isEditing = Boolean(itemId);

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
    resolver: zodResolver(registerItemSchema),
    // Valores iniciales del formulario.
    defaultValues: {
      nombre: "",
      precio: 0,
      cantidad: 1,
    },
  });

  /*   
    ======================================================
        * Cuando el modal se abre:

        * Si estamos editando:
            Se consulta el item al backend.
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
      if (isEditing && itemId) {
        // Función que obtiene los datos del item desde el backend.
        const fetchItemData = async () => {
          // Activamos el estado de carga.
          setIsLoadingCliente(true);
          try {
            // Consultamos el item mediante su ID.
            const data = await getClienteItemsByIdService(itemId);
            /**
             * Algunos backends responden:
             * { item:{...} }
             * Otros: { ... }
             * Esta línea soporta ambos casos.
             * */
            const item = data.item || data;

            /**  Rellenamos el formulario automáticamentecon los datos traídos
             * reset también permite cargar datos,
             * no solamente limpiar el formulario.*/
            reset({
              nombre: item.nombre || "",
              precio: item.precio || 0,
              cantidad: item.cantidad || 1,
            });
          } catch (err) {
            // Si ocurre un error mostrando los datos
            // avisamos al usuario.
            setErrorServer("No se pudieron cargar los datos del item.");
          } finally {
            // Finalizó la carga.
            // Ocultamos el indicador de loading.
            setIsLoadingCliente(false);
          }
        };
        fetchItemData();
      } else {
        // Si es creación, limpiamos el formulario por completo
        reset({
          nombre: "",
          precio: "",
          cantidad: "",
        });
        setErrorServer(null);
      }
    }
  }, [isOpen, itemId, isEditing, reset]);

  /* ======================================================
      * Envío del formulario.
      * Si estamos editando:
      *      PUT /items/:id
      * Si estamos creando:
      *      POST /items
    ======================================================*/

  // Envío del formulario
  const onSubmit = async (data) => {
    // Eliminamos cualquier error anterior antes de enviar.
    setErrorServer(null);

    try {
      let response;
      if (isEditing) {
        // Actualizamos un cliente existente.
        // Actualizamos usando el ID y los datos del form
        response = await updateItemsService(itemId, data);
      } else {
        // Creamos un cliente nuevo
        response = await createItemsService(data);
      }

      // Avisamos al componente padre que todo salió bien.
      // Generalmente se usa para actualizar la tabla.
      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (err) {
      setErrorServer(
        err.response?.data?.message ||
          `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el item.`,
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
        title={isEditing ? "Editar item" : "Agregar Item"}
      >
        {isLoadingCliente ? (
          <div className="py-8 text-center text-gray-500">
            Cargando datos del cliente...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre de Item columnas */}
            <Input
              label={
                <span>
                  Item <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Mano de obra"
              error={errors.nombre?.message}
              {...register("nombre")}
            />
            {/* Precio columnas */}
            <Input
              label={
                <span>
                  Precio <span className="text-red-500">*</span>
                </span>
              }
              type="number"
              placeholder="$ 150.000 "
              error={errors.precio?.message}
              {...register("precio", {
                valueAsNumber: true,
              })}
            />

            {/* Cantidad */}
            <Input
              label={
                <span>
                  Cantidad <span className="text-red-500">*</span>
                </span>
              }
              type="number"
              placeholder="1"
              error={errors.cantidad?.message}
              {...register("cantidad", {
                valueAsNumber: true,
              })}
            />

            {/* Mensaje de error general del servidor */}
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

            {/* Botón de acción principal */}
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
                    : "Crear item"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};