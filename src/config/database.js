const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "elite_events"
});

connection.connect((error) => {

    if (error) {
        console.log("❌ Error al conectar con MySQL:");
        console.log(error.message);
        return;
    }

    console.log("✅ Conectado a MySQL");
});

module.exports = connection;