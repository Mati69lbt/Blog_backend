const mongoose = require("mongoose");
const mongodbUri = process.env.MONGODB_URI;

const conexion = async () => {
  try {
    await mongoose.connect(mongodbUri);

    console.log("Conectado Exitosamente a la Base de Datod de mi_blog!!!");
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo conectar a la Base de Datos");
  }
};

module.exports = {
  conexion,
};
