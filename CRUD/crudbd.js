const database = require("../conexionbd");

async function get_proveedores(req, res) {
  try {
    const connection = await database.getConnection();
    const { id } = req.params;

    let query;
    let params = [];

    if (id) {
      query =
        "SELECT * FROM proveedores WHERE id_proveedor = ? AND estado_prov <> 0";
      params = [id];
    } else {
      query = "SELECT * FROM proveedores WHERE estado_prov <> 0";
    }

    const [rows] = await connection.execute(query, params);
    connection.release();

    if (id && rows.length === 0) {
      return res.status(404).send("Proveedor no encontrado");
    }

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

async function update_prov(req, res) {
  const { id_proveedor, nombre, ruc, email } = req.body;
  const connection = await database.getConnection();

  try {
    const result = await connection.execute(
      "UPDATE proveedores SET nombre = ?, ruc = ?, email = ? WHERE id_proveedor = ?",
      [nombre, ruc, email, id_proveedor]
    );

    connection.release();

    if (result[0].affectedRows > 0) {
      res.status(200).send("Actualización exitosa");
    } else {
      res.status(404).send("Proveedor no encontrado");
    }
  } catch (err) {
    connection.release();
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
}

async function delete_prov(req, res) {
  const id_proveedor = req.body.id_proveedor;
  const connection = await database.getConnection();

  try {
    const result = await connection.execute(
      "UPDATE proveedores SET estado_prov=0 WHERE id_proveedor=?",
      [id_proveedor]
    );

    connection.release();

    if (result[0].affectedRows > 0) {
      res.status(200).send("Proveedor eliminado exitosamente");
    } else {
      res.status(404).send("Proveedor no encontrado");
    }
  } catch (err) {
    connection.release();
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
}

module.exports = {
  regis_prov,
  get_proveedores,
  update_prov,
  delete_prov
};
