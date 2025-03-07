const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const crudbd = require ("./CRUD/crudbd");
const methods = require("./login_register/login_register");
const cookies = require("./cookies/authorization");

const dotenv = require("dotenv");
dotenv.config();

//Server
const app = express();
app.set("port", 4000);
app.listen(app.get("port"));
console.log("Servidor corriendo en puerto", app.get("port"));
console.log("Base de datos: ", process.env.DATABASE);

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
    ],
    credentials: true, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204, 
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

//Apis-post
app.post("/api/register", cookies.Cookies, methods.register);
app.post("/api/login", methods.login);

app.post("/api/regis_prov", crudbd.regis_prov);
app.post("/api/update_prov", crudbd.update_prov);
app.post("/api/delete_prov", crudbd.delete_prov);


//Apis-get
app.get("/api/get_prov/:id?", crudbd.get_proveedores );
