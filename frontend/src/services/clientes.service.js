// Importamos la instancia de Axios configurada previamente para realizar las peticiones HTTP
import api from '@/lib/axios';

/**
 * ==================================================
 * cliente.service.js — Servicios de clientes
 * ==================================================
 **/

/**
 * Servicio para crear/registrar un nuevo cliente en el sistema.
 * Hace match con la ruta del backend: router.post("/", ...)
 * 
 * @param {Object} credentials - Datos del cliente a registrar.
 * @returns {Promise<Object>} - Respuesta del servidor con el cliente creado.
 */
export const createClienteService = async (credentials) => {
  const { data } = await api.post('/clientes', credentials);
  return data;
};

/**
 * Servicio para obtener la lista completa de todos los clientes del usuario.
 * Hace match con la ruta del backend: router.get("/", ...)
 * 
 * @returns {Promise<Object>} - Listado de clientes.
 */
export const getClientesService = async () => {
  const { data } = await api.get('/clientes');
  return data;
};

/**
 * Servicio para obtener la información de UN SOLO cliente mediante su ID.
 * Hace match con la ruta del backend: router.get("/:id", ...)
 * 
 * @param {string|number} clienteId - ID único del cliente a buscar.
 * @returns {Promise<Object>} - Datos específicos del cliente.
 */
export const getClienteByIdService = async (clienteId) => {
  const { data } = await api.get(`/clientes/${clienteId}`);
  return data;
};

/**
 * Servicio para actualizar los datos de un cliente específico mediante su ID.
 * Hace match con la ruta del backend: router.put("/update/:id", ...)
 * 
 * @param {string|number} clienteId - ID del cliente que se va a actualizar.
 * @param {Object} clienteData - Nuevos datos del cliente.
 * @returns {Promise<Object>} - Respuesta del servidor indicando éxito.
 */
export const updateClienteService = async (clienteId, clienteData) => {
  const { data } = await api.put(`/clientes/update/${clienteId}`, clienteData);
  return data; 
};