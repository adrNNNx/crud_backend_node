const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const database = require("../conexionbd");

async function usuarios_db() {
  const connection = await database.getConnection();

  try {
    const [rows] = await connection.execute("SELECT * FROM usuario");
    const usuariosJSON = JSON.stringify(rows);
    return usuariosJSON;
  } catch (err) {
    console.error(err);
    throw err; // Puedes manejar el error según tus necesidades
  } finally {
    connection.release();
  }
}

async function login(req, res) {
  const { nom_usu: user, contr_usu: password } = req.body;

  //Validacion por si se envia vacio
  if (!user || !password) {
    return res.status(400).json({ error: "Usuario o contraseña inválidos" });
  }

  //Obtener usuarios de la bd
  try {
    const usuariosJSON = await usuarios_db();
    const usuarios = JSON.parse(usuariosJSON);

    //Comparacion de si existe un usuario
    const usuarioArevisar = usuarios.find(
      (usuarios) => usuarios.nom_usu === user
    );

    //Si no existe el usuario
    if (!usuarioArevisar) {
      return res.status(400).json({
        status: "Error",
        message: "Error - Usuario o contraseña inválidos",
      });
    }

    //Comparacion de la contraseña
    const loginCorrecto = await bcryptjs.compare(
      password,
      usuarioArevisar.contr_usu
    );
    if (!loginCorrecto) {
      return res.status(400).json({
        status: "Error",
        message: "Error - Usuario o contraseña inválidos",
      });
    }
    //Token de autorizacion de login
    const token = jsonwebtoken.sign(
      { user: usuarioArevisar.nom_usu },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );

    //Opciones de Cookie
    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 60 * 1000
      ),
      path: "/",
      sameSite: "Lax",
    };

    res.cookie("jwt", token, cookieOption);
    res.send({
      status: "ok",
      message: "Usuario Logeado",
      user: usuarioArevisar,
    });
  } catch (error) {
    console.error("Error al obtener usuarios de la base de datos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function register(req, res) {
  const { nom_usu, contr_usu } = req.body;

  // Validación de campos vacíos
  if (!nom_usu || !contr_usu) {
    return res.status(400).json({ error: "Usuario o contraseña inválidos" });
  }

  try {
    // Verificación de usuario
    const connection = await database.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM usuario WHERE nom_usu = ?",
      [nom_usu]
    );
    connection.release();

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ status: "Error", message: "Este usuario ya existe" });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashPassword = await bcryptjs.hash(contr_usu, salt);

    // Nuevo usuario
    const insertConnection = await database.getConnection();
    await insertConnection.query(
      "INSERT INTO usuario (nom_usu, contr_usu) VALUES (?, ?)",
      [nom_usu, hashPassword]
    );
    insertConnection.release();

    return res.status(201).json({
      status: "ok",
      message: `Usuario ${nom_usu} registrado en la base de datos`,
      redirect: "/",
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  login,
  register,
  usuarios_db,
};
