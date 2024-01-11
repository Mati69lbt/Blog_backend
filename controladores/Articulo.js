const validator = require("validator");
const Articulo = require("../modelos/Articulo");
const path = require("path");

const fs = require("fs");

const prueba = (req, res) => {
  return res.status(200).json({
    mensaje: "Soy una accion de prueba en mi controlador de articulos",
  });
};

const crear_articulo = async (req, res) => {
  //recoger parametros por post a guardar
  let parametros = req.body;
  //validar los datos con validaor
  try {
    let validar_titulo =
      !validator.isEmpty(parametros.titulo) &&
      validator.isLength(parametros.titulo, { min: 5, max: undefined });
    let validar_contenido = !validator.isEmpty(parametros.contenido);
    if (!validar_titulo || !validar_contenido) {
      throw new Error("No se ha validado la Informacion!");
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
      error: error.message,
    });
  }

  //Crear el objeto a guardar
  const articulo = new Articulo(parametros); //asi se guarda todo automaticamente
  //asignar valores a objeto basado en el modelo (manual o automatico)
  //articulo.titulo = parametros.titulo; --- de forma manual, pero tardariamos mucho si tendriamos muchos parametros

  //Guardar el articulo en la base de datos
  // el metodo de abajo esta deprecado
  // //   articulo.save((err, articuloGuardado) => {
  // //     if (err || !articuloGuardado) {
  // //       return res.status(400).json({
  // //         status: "error",
  // //         mensaje: "Error al guardar el artículo",
  // //         });
  // //         }
  // //   return res.status(200).json({
  // //     status: "success",
  // //     articulo: articuloGuardado,
  // //     mensaje: "articulo guardado con exito!!!"
  // //   });
  // // });

  // nuevo metodo de guardado
  try {
    const articuloGuardado = await articulo.save();
    return res.status(200).json({
      status: "success",
      articulo: articuloGuardado,
      mensaje: "Artículo guardado con exito",
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Error al guardar el artículo",
      error: error.message,
    });
  }
};

const listar_articulos = async (req, res) => {
  const parametros_url = req.params.ultimos;

  try {
    let busqueda = Articulo.find({});

    if (parametros_url) {
      busqueda = busqueda.limit(parseInt(parametros_url));
    }

    const articulos = await busqueda.sort({ fecha: -1 }).exec();

    if (!articulos || articulos.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No hay artículos en la base de datos",
        error: error.message,
      });
    }
    res.status(200).json({
      status: "succes",
      parametros_url: parametros_url,
      contador: articulos.length,
      articulos,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener articulos",
      error: error.message,
    });
  }
};

const sacar_un_solo_articulo = async (req, res) => {
  // recoger id de la url
  let id = req.params.id;
  // buscar el articulo
  let articulo;
  try {
    articulo = await Articulo.findById(id);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al buscar el artículo",
      error: error.message,
    });
  }

  if (!articulo) {
    return res.status(404).json({
      status: "error",
      message: "El artículo no existe",
    });
  } else {
    res.status(200).json({
      status: "success",
      consulta: id,
      articulo,
    });
  }
};

const borrar_articulo = async (req, res) => {
  let id_params = req.params.id;

  let articulo;

  try {
    articulo = await Articulo.findOneAndDelete({ _id: id_params });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido eliminar el artículo",
      error: error.message,
    });
  }

  if (!articulo) {
    return res.status(404).json({
      status: "error",
      message: "El artículo no existe",
    });
  }
  return res.status(200).json({
    status: "success",
    message: "metodo de borrar aprobado",
    id_params,
    articulo,
  });
};

const editar_articulo = async (req, res) => {
  let id_articulo = req.params.id;

  let parametros = req.body;

  try {
    let validar_titulo =
      !validator.isEmpty(parametros.titulo) &&
      validator.isLength(parametros.titulo, { min: 5, max: undefined });
    let validar_contenido = !validator.isEmpty(parametros.contenido);
    if (!validar_titulo || !validar_contenido) {
      throw new Error("No se ha validado la Informacion!");
    }
    //Buscar y actualizar el articulo
    const articulo_Actualizado = await Articulo.findOneAndUpdate(
      { _id: id_articulo },
      parametros,
      { new: true }
    );

    if (!articulo_Actualizado) {
      return res.status(404).json({
        status: "Error",
        Mensaje: "El artículo no existe en la base de Datos",
      });
    } else {
      res.status(201).json({
        status: "Exito",
        articulo: articulo_Actualizado,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
      error: error.message,
    });
  }
};

const subir_imagenes = async (req, res) => {
  //Configurar multer

  //recoger el fichero de la imagen subida
  //comprobar que req.files no esta vacio, si lo esta, devolver un error
  if (!req.file) {
    return res.status(400).send({
      status: "Error",
      message: "No has subido ninguna imagen",
    });
  }

  //Nombre del archivo
  let nombreImagen = req.file.originalname;

  //obtener la extension del archivo
  let archivo_split = nombreImagen.split(".");
  let extension_archivo = archivo_split[1].toLowerCase();

  const extesiones_permitidas = ["png", "jpg", "jepg", "gif"].map((ext) =>
    ext.toLowerCase()
  );

  // comprobar extension correcta
  if (!extesiones_permitidas.includes(extension_archivo)) {
    // borrar archivo y enviar respuesta
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: "Error",
        mensaje: "La extensión del archivo no es validad",
      });
    });
  } else {
    let articulo_id = req.params.id;
    try {
      const articulo_Actualizado = await Articulo.findOneAndUpdate(
        { _id: articulo_id },
        { imagen: req.file.filename },
        { new: true }
      );

      if (!articulo_Actualizado) {
        return res.status(404).json({
          status: "Error",
          Mensaje: "El artículo no existe en la base de Datos",
        });
      } else {
        res.status(201).json({
          status: "Exito",
          mensaje: "Imagen actualizada correctamente",
          articulo: articulo_Actualizado,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "error",
        mensaje: "Faltan datos por enviar",
        error: error.message,
      });
    }
  }
};

const imagen = async (req, res) => {
  let fichero = req.params.fichero;
  let ruta_fisica = "./imagenes/articulos/" + fichero;
  fs.stat(ruta_fisica, (error, existe) => {
    if (existe) {
      return res.sendFile(path.resolve(ruta_fisica));
    } else {
      return res.status(404).json({
        status: "Error",
        Mensaje: "La imagen no se encuentra disponible",
        existe,
        fichero,
        ruta_fisica,
      });
    }
  });
};

const buscador = async (req, res) => {
  let busqueda = req.params.busqueda;

  const articulo = Articulo.find({
    $or: [
      { titulo: { $regex: busqueda, $options: "i" } },
      { contenido: { $regex: busqueda, $options: "i" } },
    ],
  });
  const articulo_encontrado = await articulo.sort({ fecha: -1 }).exec();
  if (!articulo_encontrado || articulo_encontrado.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No hay artículos en la base de datos",
    });
  } else {
    res.status(200).json({
      status: "succes",
      articulo_encontrado,
    });
  }
};

module.exports = {
  prueba,
  crear_articulo,
  listar_articulos,
  sacar_un_solo_articulo,
  borrar_articulo,
  editar_articulo,
  subir_imagenes,
  imagen,
  buscador,
};
