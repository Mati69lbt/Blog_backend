const mongoose = require("mongoose");
const mongodbUri = import.meta.env.VITE_MONGODB_URI;

const conexion = async () => {
  try {
    await mongoose.connect({ mongodbUri });

    console.log("Conectado Exitosamente a la Base de Datods de mi_blog!!!");
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo conectar a la Base de Datos");
  }
};

module.exports = {
  conexion,
};
