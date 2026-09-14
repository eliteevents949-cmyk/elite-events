const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "elite_events"
});

connection.connect((error) => {

    if (error) {

        console.log(
            "❌ Error al conectar con MySQL:"
        );

        console.log(error.message);

        return;
    }

    console.log("✅ Conectado a MySQL");

});

module.exports = connection;