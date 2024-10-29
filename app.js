const mongoose = require("mongoose");
const express = require("express");
const moment = require("moment");

const url = "mongodb://localhost/mongo_node";
const app = express();
app.use(express.json());

mongoose
  .connect(url, {})
  .then(() => console.log("Conexión exitosa"))
  .catch((e) => console.log("El error de conexión es: " + e));

const usuarioSchema = mongoose.Schema(
  {
    Nombre: String,
    Edad: Number,
    FechaCreacion: Date,
  },
  { versionKey: false }
);

const UsuariosModel = mongoose.model("usuarios", usuarioSchema);

// Endpoint para traer todos los usuarios
app.get("/usuarios", async (req, res) => {
  const usuarios = await UsuariosModel.find();
  res.json(usuarios);
});

// Endpoint para crear un nuevo usuario
app.post("/usuarios", async (req, res) => {
  const usuario = new UsuariosModel(req.body);
  usuario.FechaCreacion = moment().format("D-MM-YYYY");
  const nuevoUsuario = new UsuariosModel(usuario);
  const resGuardado = await nuevoUsuario.save();
  res.status(201).json(resGuardado);
});

// Endpoint para actualizar un usuario por nombre
app.put("/usuarios/:nombre", async (req, res) => {
  const { nombre } = req.params;
  const nuevoDatos = req.body;
  const usuarioActualizado = await UsuariosModel.findOneAndUpdate(
    { Nombre: nombre },
    nuevoDatos,
    {
      new: true,
    }
  );
  if (!usuarioActualizado) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  res.json(usuarioActualizado);
});

// Endpoint para obtener un usuario por nombre
app.get("/usuarios/nombre/:nombre", async (req, res) => {
  const { nombre } = req.params;
  const usuario = await UsuariosModel.findOne({ Nombre: nombre });
  if (!usuario) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  res.json(usuario);
});

// Endpoint para eliminar un usuario por nombre
app.delete("/usuarios/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const usuarioEliminado = await UsuariosModel.findOneAndDelete({
      Nombre: nombre,
    });
    if (!usuarioEliminado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      res.json({ message: "Usuario " + req.params.nombre + " eliminado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el usuario", error: error.message });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
