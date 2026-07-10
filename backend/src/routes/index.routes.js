import authRoutes from "./auth.routes.js";
import clienteRoutes from "./cliente.routes.js";
import itemRoutes from "./item.routes.js";

export default (app) => {

    /* ==============================
       AUTH
    ============================== */

    app.use("/api/auth", authRoutes);

    /* ==============================
         CLIENTES
    ============================== */
    app.use("/api/clientes", clienteRoutes);

    /* ==============================
         ÍTEMS
    ============================== */

    app.use("/api/items", itemRoutes);
}