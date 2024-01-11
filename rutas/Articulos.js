const { Router } = require("express");
const router = Router();

const multer = require("multer");
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes/articulos/");
  },
  filename: (req, file, cb) => {
    cb(null, "articulo" + Date.now() + file.originalname);
  },
});

const imagenes_subidas = multer({ storage: almacenamiento });

const ArticuloControlador = require("../controladores/Articulo");

//Rutas de prueba
router.get("/ruta-de-prueba", ArticuloControlador.prueba);
router.post(
  "/subir-imagen/:id",
  [imagenes_subidas.single("file0")],
  ArticuloControlador.subir_imagenes
);
router.post("/crear", ArticuloControlador.crear_articulo);
router.get("/articulos/:ultimos?", ArticuloControlador.listar_articulos);
router.get("/articulo/:id", ArticuloControlador.sacar_un_solo_articulo);
router.delete("/articulo/:id", ArticuloControlador.borrar_articulo);
router.put("/articulo/:id", ArticuloControlador.editar_articulo);
router.get("/imagen/:fichero", ArticuloControlador.imagen);
router.get("/buscar/:busqueda", ArticuloControlador.buscador);

module.exports = router;
