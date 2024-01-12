require("dotenv").config();
const { conexion } = require("./database/conexion");
const express = require("express");
const cors = require("cors");

const puerto = process.env.PORT

// Inicializar app
console.log("App de node arrancada");

// Conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();

// Configurar cors
app.use(cors());

// Convertir body a objeto js
app.use(express.json()); // recibir datos con content-type app/json
app.use(express.urlencoded({ extended: true })); // form-urlencoded

// RUTAS
const rutas_articulo = require("./rutas/Articulos");

// Cargo las rutas
app.use("/api", rutas_articulo);

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto " + puerto);
});
