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
    Descripcion: String,
    FechaCreacion: Date,
  },
  { versionKey: false }
);

const UsuariosModel = mongoose.model("usuarios", usuarioSchema);

// Endpoint para traer todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await UsuariosModel.find();

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    } else {
      res.json(usuarios);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al leer usuarios", error: error.message });
  }
});

// Endpoint para crear un nuevo usuario
app.post("/usuarios", async (req, res) => {
  try {
    if (!req.body.Nombre) {
      return res.status(400).json({ message: "Nombre obligatorio" });
    }

    const usuario = new UsuariosModel(req.body);

    usuario.FechaCreacion = Date.now();

    const nuevoUsuario = new UsuariosModel(usuario);
    const resGuardado = await nuevoUsuario.save();
    res.status(201).json(resGuardado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
});

// Endpoint para actualizar un usuario por nombre
app.put("/usuarios/:nombre", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
});

// Endpoint para obtener un usuario por nombre
app.get("/usuarios/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const usuario = await UsuariosModel.findOne({ Nombre: nombre });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
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
