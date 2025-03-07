const database = require("../conexionbd");

async function get_proveedores(req, res) {
  try {
    const connection = await database.getConnection();
    const [rows] = await connection.execute("SELECT * FROM proveedores");
    connection.release();

    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
}

async function regis_prov(req, res) {
  const { nombre, ruc, email } = req.body;

  // Validar los campos
  if (!nombre || !ruc || !email) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const connection = await database.getConnection();
    const [result] = await connection.execute(
      "INSERT INTO proveedores (nombre, ruc, email) VALUES (?, ?, ?)",
      [nombre, ruc, email]
    );
    connection.release();

    res.status(201).json({
      status: "ok",
      message: "Proveedor creado exitosamente",
      id: result.insertId, // ID del proveedor creado
    });
  } catch (error) {
    console.error("Error al crear el proveedor:", error);
    res.status(500).json({ error: "Error al crear el proveedor" });
  }
}

module.exports = {
  regis_prov,
  get_proveedores,
};
